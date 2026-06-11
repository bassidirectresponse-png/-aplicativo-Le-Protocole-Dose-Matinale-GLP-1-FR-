# Pink Salt Burn App

App companion do Protocole Pink Salt Burn, clonado a partir do Pink Gelatin Burn App e adaptado para entregar o produto pos-compra da oferta Pink Salt em frances.

## Stack

- React 19.2 + TypeScript + Vite 6
- Tailwind CSS 3.4
- Supabase Auth, Postgres, RLS e Edge Functions
- i18next
- Recharts
- PWA com `vite-plugin-pwa`

## Funcionalidades

- Onboarding em 7 etapas com URL por idioma, por exemplo `/onboarding/fr`.
- Cadastro via Supabase Auth.
- Trigger remoto que cria `user_profiles` e primeira entrada em `weight_entries` quando o usuario se cadastra.
- Dashboard com shot Pink Salt personalizado por peso, meta calorica, proteina, agua e progresso.
- Receitas/shots de apoio para deficit calorico, saciedade, proteina e controle de desejos.
- Aulas em video herdadas temporariamente do app original.
- Calendario de peso com recalculo automatico.
- Perfil, suporte, favoritos e PWA instalavel.
- Push notification via Edge Function `send-push`.

## Supabase

- Projeto: `https://bzdvrgkanqycftgwuozm.supabase.co`
- Ref: `bzdvrgkanqycftgwuozm`
- Migrations aplicadas: `00001` a `00004`
- Edge Function deployada: `send-push`
- Secrets VAPID configurados no Supabase: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`
- Auth config aplicada: email signup habilitado, confirmacao de email desabilitada, redirects locais liberados para `127.0.0.1:5173` e `localhost:5173`.

## Ambiente

Crie/preencha `.env.local`:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_VAPID_PUBLIC_KEY=
```

## Comandos

```bash
npm install
npm run dev
npm run lint
npm run build
```

## Validacao Executada

- `npm install`
- `npm run lint`
- `npm run build`
- `supabase db push --yes`
- `supabase functions deploy send-push`
- `supabase secrets set` para VAPID
- Cadastro de teste no onboarding com criacao automatica de perfil e peso inicial; usuario de teste removido depois.
- Cadastro testado apos ajuste de Auth config: cria conta e entra direto no dashboard.
- Browser local em `http://127.0.0.1:5173/onboarding/fr`: marca Pink Salt carregando, logo exibida, sem texto visivel de Pink Gelatin.
