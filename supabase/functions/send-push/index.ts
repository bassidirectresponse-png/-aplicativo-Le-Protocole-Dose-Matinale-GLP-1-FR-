import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

type PushRequest = {
  title?: string;
  body?: string;
  url?: string;
  userIds?: string[];
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const adminUserId = Deno.env.get('ADMIN_USER_ID');
  const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
  const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
  const vapidSubject = Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@example.com';

  if (!supabaseUrl || !serviceRoleKey || !adminUserId || !vapidPublicKey || !vapidPrivateKey) {
    return new Response(JSON.stringify({ error: 'Missing push configuration' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || authData.user?.id !== adminUserId) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const payload = await req.json() as PushRequest;
  const title = payload.title?.trim() || 'Protocole Pink Salt Burn';
  const body = payload.body?.trim() || 'Votre rappel du protocole est pret.';
  const url = payload.url?.trim() || '/';

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

  let query = supabase
    .from('push_subscriptions')
    .select('id, endpoint, subscription');

  if (payload.userIds?.length) {
    query = query.in('user_id', payload.userIds);
  }

  const { data: subscriptions, error } = await query;
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let sent = 0;
  let removed = 0;

  await Promise.all((subscriptions || []).map(async row => {
    try {
      await webpush.sendNotification(row.subscription, JSON.stringify({ title, body, url }));
      sent += 1;
    } catch (error) {
      const statusCode = error instanceof Error && 'statusCode' in error
        ? Number((error as Error & { statusCode?: number }).statusCode)
        : 0;

      if (statusCode === 404 || statusCode === 410) {
        await supabase.from('push_subscriptions').delete().eq('id', row.id);
        removed += 1;
      } else {
        console.error('Push failed', row.endpoint, error);
      }
    }
  }));

  return new Response(JSON.stringify({ sent, removed }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
