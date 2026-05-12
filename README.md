# Customer Agent Wizard

Wizard interno de Revenue Hub Latam para configurar HubSpot Customer Agent en 8 pasos.

## Stack

Vite, React 18, TypeScript, Tailwind, shadcn/ui, Supabase (Postgres + Auth + Storage + Edge Functions), Zustand, TanStack Query, react-hook-form, zod, JSZip, Anthropic SDK.

## Setup

1. Clona el repo e instala dependencias.

```
npm install
```

2. Copia variables de entorno.

```
cp .env.example .env
```

Completa `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con los valores de tu proyecto Supabase.

3. Login en Supabase y aplica migraciones.

```
supabase login
supabase link --project-ref <tu-project-ref>
supabase db push
```

4. Despliega Edge Functions.

```
supabase functions deploy generate-blueprint
supabase functions deploy generate-file
supabase functions deploy validate-hubspot
```

Configura los secrets del proyecto en Supabase (Dashboard > Project Settings > Edge Functions):

```
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase secrets set HUBSPOT_CLIENT_ID=...
supabase secrets set HUBSPOT_CLIENT_SECRET=...
supabase secrets set NOTION_API_KEY=...
```

5. Levanta el frontend.

```
npm run dev
```

Abre http://localhost:5173.

## Estructura

- `src/pages/` rutas principales (Landing, Login, Dashboard, Wizard, Export)
- `src/components/wizard/` pasos 1 a 8
- `src/components/blueprint/` viewer del JSON blueprint
- `supabase/migrations/` schema y seeds
- `supabase/functions/` Edge Functions Deno

## Flujo

Landing -> Login -> Dashboard -> Wizard (8 pasos) -> Export (.zip + checklist HubSpot).
