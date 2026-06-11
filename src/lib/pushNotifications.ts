import { supabase } from './supabase';

type PushResult = {
  ok: boolean;
  message: string;
};

const getVapidPublicKey = () => import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
};

export const isPushSupported = () =>
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window;

export const enablePushNotifications = async (userId: string): Promise<PushResult> => {
  if (!isPushSupported()) {
    return {
      ok: false,
      message: "Ce telephone ne prend pas encore en charge les notifications push pour cette app.",
    };
  }

  const vapidPublicKey = getVapidPublicKey();
  if (!vapidPublicKey) {
    return {
      ok: false,
      message: 'Les notifications sont pretes, mais la cle VAPID publique doit etre configuree.',
    };
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return {
      ok: false,
      message: 'Notifications non activees. Vous pourrez les autoriser plus tard dans les reglages du telephone.',
    };
  }

  const registration = await navigator.serviceWorker.register('/push-sw.js', { scope: '/push/' });
  const existingSubscription = await registration.pushManager.getSubscription();
  const subscription =
    existingSubscription ||
    await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
    });

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(
      {
        user_id: userId,
        endpoint: subscription.endpoint,
        subscription: subscription.toJSON(),
        user_agent: navigator.userAgent,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'endpoint' },
    );

  if (error) {
    console.error('Failed to save push subscription', error);
    return {
      ok: false,
      message: "Les notifications ont ete autorisees, mais l'inscription n'a pas ete sauvegardee.",
    };
  }

  return {
    ok: true,
    message: 'Notifications activees. Vous recevrez les rappels importants du protocole.',
  };
};
