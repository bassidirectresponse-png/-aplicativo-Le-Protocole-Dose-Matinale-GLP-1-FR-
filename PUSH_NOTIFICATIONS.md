# Push notifications

This app stores browser push subscriptions in Supabase and sends notifications through the `send-push` Edge Function.

## 1. Generate VAPID keys

```bash
npx web-push generate-vapid-keys
```

Set the public key in the frontend:

```env
VITE_VAPID_PUBLIC_KEY=your_public_key
```

Set the private configuration in Supabase:

```bash
supabase secrets set VAPID_PUBLIC_KEY=your_public_key
supabase secrets set VAPID_PRIVATE_KEY=your_private_key
supabase secrets set VAPID_SUBJECT=mailto:you@example.com
supabase secrets set ADMIN_USER_ID=your_supabase_user_id
```

`ADMIN_USER_ID` is the only account allowed to send pushes.

## 2. Deploy

Run the migration that creates `push_subscriptions`, then deploy the function:

```bash
supabase db push
supabase functions deploy send-push
```

## 3. Send a push

Log in with the admin account, get that user's Supabase access token, then call:

```bash
curl -X POST "https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-push" \
  -H "Authorization: Bearer YOUR_ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Protocole Pink Salt Burn\",\"body\":\"C'est l'heure de suivre votre protocole.\",\"url\":\"/recipes\"}"
```

To send only to specific users, include `userIds`:

```json
{
  "title": "Rappel du protocole",
  "body": "Prenez votre recette au bon moment aujourd'hui.",
  "url": "/recipes",
  "userIds": ["user-uuid-1", "user-uuid-2"]
}
```

Notes:

- iPhone requires iOS 16.4+ and the PWA installed on the home screen before notifications can be enabled.
- Android works after the user grants notification permission in Chrome or from the installed PWA.
- Push notifications require HTTPS in production. Localhost is only for development.
