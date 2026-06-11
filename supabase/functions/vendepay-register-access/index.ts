import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

type DeliveryPayload = Record<string, unknown>;

type ProfileInput = {
  email: string;
  fullName: string;
  firstName: string;
  phone: string;
  purchaseId: string;
  productId: string;
  currentWeight: number;
  targetWeight: number;
  height: number;
  age: number;
  previousDiets: string;
  preferredLanguage: string;
  redirectTo: string;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-delivery-secret',
};

const DEFAULT_REDIRECT_URL = 'https://pink-salt.netlify.app/';
const DEFAULT_PRODUCT_ID = 'f87666b2-3a02-48ce-b329-e3a800c8521f';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readPath(source: unknown, path: string[]): unknown {
  let current = source;
  for (const part of path) {
    if (!isRecord(current)) return undefined;
    current = current[part];
  }
  return current;
}

function firstString(source: unknown, paths: string[][], fallback = '') {
  for (const path of paths) {
    const value = readPath(source, path);
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  }
  return fallback;
}

function numberFrom(source: unknown, paths: string[][], fallback: number) {
  const value = firstString(source, paths);
  if (!value) return fallback;
  const parsed = Number(String(value).replace(',', '.'));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function randomPassword() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes)) + 'Aa1!';
}

function normalizePayload(payload: DeliveryPayload): ProfileInput {
  const email = firstString(payload, [
    ['email'],
    ['customerEmail'],
    ['customer_email'],
    ['client_email'],
    ['buyer_email'],
    ['cliente', 'email'],
    ['customer', 'email'],
    ['buyer', 'email'],
    ['data', 'customer', 'email'],
    ['data', 'buyer', 'email'],
  ]).toLowerCase();

  const fullName = firstString(payload, [
    ['full_name'],
    ['fullName'],
    ['name'],
    ['customerName'],
    ['customer_name'],
    ['client_name'],
    ['buyer_name'],
    ['cliente', 'nome'],
    ['cliente', 'name'],
    ['customer', 'name'],
    ['buyer', 'name'],
    ['data', 'customer', 'name'],
    ['data', 'buyer', 'name'],
  ], 'Cliente Pink Salt');

  const firstName = firstString(payload, [['first_name'], ['firstName']], fullName.split(/\s+/)[0] || 'Cliente');

  return {
    email,
    fullName,
    firstName,
    phone: firstString(payload, [
      ['phone'],
      ['telefone'],
      ['customer_phone'],
      ['customer', 'phone'],
      ['buyer', 'phone'],
      ['data', 'customer', 'phone'],
    ]),
    purchaseId: firstString(payload, [
      ['purchase_id'],
      ['purchaseId'],
      ['order_id'],
      ['orderId'],
      ['transaction_id'],
      ['transactionId'],
      ['id'],
      ['data', 'id'],
      ['data', 'order_id'],
    ]),
    productId: firstString(payload, [
      ['product_id'],
      ['productId'],
      ['produtoId'],
      ['product', 'id'],
      ['data', 'product', 'id'],
    ], DEFAULT_PRODUCT_ID),
    currentWeight: numberFrom(payload, [['current_weight'], ['currentWeight'], ['weight']], 75),
    targetWeight: numberFrom(payload, [['target_weight'], ['targetWeight']], 65),
    height: numberFrom(payload, [['height']], 165),
    age: Math.round(numberFrom(payload, [['age']], 35)),
    previousDiets: firstString(payload, [['previous_diets'], ['previousDiets']], 'purchase_auto'),
    preferredLanguage: firstString(payload, [['preferred_language'], ['preferredLanguage'], ['language'], ['locale']], 'fr').slice(0, 8),
    redirectTo: firstString(payload, [['access_redirect_url'], ['redirectTo'], ['redirect_to']], Deno.env.get('APP_ACCESS_URL') || DEFAULT_REDIRECT_URL),
  };
}

async function findUserIdByEmail(supabase: ReturnType<typeof createClient>, email: string) {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (profile?.id) return profile.id as string;

  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const user = data.users.find(candidate => candidate.email?.toLowerCase() === email);
    if (user) return user.id;
    if (data.users.length < 1000) break;
  }

  return null;
}

serve(async req => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ success: false, error: 'Method not allowed' }, 405);
  }

  const configuredSecret = Deno.env.get('N8N_DELIVERY_SECRET');
  const headerSecret = req.headers.get('x-delivery-secret') || req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

  if (configuredSecret && headerSecret !== configuredSecret) {
    return jsonResponse({ success: false, error: 'Unauthorized' }, 401);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ success: false, error: 'Missing Supabase admin configuration' }, 500);
  }

  let payload: DeliveryPayload;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ success: false, error: 'Invalid JSON body' }, 400);
  }

  const input = normalizePayload(payload);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    return jsonResponse({ success: false, error: 'Valid customer email is required' }, 400);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const metadata = {
    full_name: input.fullName,
    first_name: input.firstName,
    phone: input.phone,
    current_weight: input.currentWeight,
    target_weight: input.targetWeight,
    height: input.height,
    age: input.age,
    previous_diets: input.previousDiets,
    preferred_language: input.preferredLanguage,
    source: 'vendepay',
    product: 'pink_salt',
    product_id: input.productId,
    purchase_id: input.purchaseId,
  };

  let createdUser = false;
  let userId: string | null = null;

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email: input.email,
    password: randomPassword(),
    email_confirm: true,
    user_metadata: metadata,
  });

  if (createError) {
    const alreadyExists = /already|registered|exists/i.test(createError.message);
    if (!alreadyExists) {
      return jsonResponse({ success: false, error: createError.message }, 500);
    }
    userId = await findUserIdByEmail(supabase, input.email);
    if (!userId) return jsonResponse({ success: false, error: 'Existing user not found' }, 500);
    await supabase.auth.admin.updateUserById(userId, { user_metadata: metadata });
  } else {
    createdUser = true;
    userId = created.user?.id || null;
  }

  if (!userId) {
    return jsonResponse({ success: false, error: 'User id was not returned' }, 500);
  }

  const { error: profileError } = await supabase
    .from('user_profiles')
    .upsert({
      id: userId,
      email: input.email,
      full_name: input.fullName,
      current_weight: input.currentWeight,
      target_weight: input.targetWeight,
      height: input.height,
      age: input.age,
      previous_diets: input.previousDiets,
      preferred_language: input.preferredLanguage,
    }, { onConflict: 'id' });

  if (profileError) {
    return jsonResponse({ success: false, error: profileError.message }, 500);
  }

  const today = new Date().toISOString().slice(0, 10);
  const { data: existingWeight } = await supabase
    .from('weight_entries')
    .select('id')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle();

  if (!existingWeight) {
    await supabase
      .from('weight_entries')
      .insert({ user_id: userId, date: today, weight: input.currentWeight });
  }

  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: input.email,
    options: { redirectTo: input.redirectTo },
  });

  if (linkError || !linkData.properties?.action_link) {
    return jsonResponse({ success: false, error: linkError?.message || 'Magic link was not generated' }, 500);
  }

  return jsonResponse({
    success: true,
    created_user: createdUser,
    user_id: userId,
    email: input.email,
    full_name: input.fullName,
    first_name: input.firstName,
    product_id: input.productId,
    purchase_id: input.purchaseId,
    app_login_url: input.redirectTo,
    access_url: linkData.properties.action_link,
  });
});
