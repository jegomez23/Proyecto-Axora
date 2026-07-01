# Axora

Sitio web estatico para Axora, una agencia de soluciones digitales para negocios locales.

## Estructura

- `index.html`: pagina principal (one-page: soluciones, proceso y proyectos como secciones con anclas).
- `contacto.html`: pagina de contacto con formulario conectado a una funcion serverless.
- `gracias.html`: pagina de confirmacion tras enviar el formulario.
- `main.js`: interacciones del sitio y envio del formulario.
- `netlify/functions/contact-submit.js`: endpoint seguro para insertar en Supabase.
- `supabase/contact_leads.sql`: tabla y policies alineadas con tu modelo `contact_leads`.
- `.env.local.example`: variables de entorno necesarias para desarrollo y despliegue.
- `src/input.css`: estilos fuente de Tailwind y reglas personalizadas.
- `dist/output.css`: CSS generado durante el build.
- `img/`: recursos visuales del sitio.

## Desarrollo

Instala dependencias:

```bash
npm install
```

Genera el CSS en modo watch:

```bash
npm run dev
```

Genera el CSS optimizado para produccion:

```bash
npm run build
```

## Configurar Supabase

1. Ejecuta `supabase/contact_leads.sql` en el SQL Editor de Supabase.
2. Crea `.env.local` usando `.env.local.example`.
3. Define:
   - `SUPABASE_URL=https://ziwcpmbkktflryabcrlg.supabase.co`
   - `SUPABASE_ANON_KEY=tu_anon_key`
   - `SUPABASE_TABLE=contact_leads`
   - `SITE_ORIGIN=tu_dominio_o_url_local`
4. En Netlify, añade las mismas variables de entorno.
5. El formulario enviara los datos a `/.netlify/functions/contact-submit` y, si el insert sale bien, redirigira a `gracias.html`.

## Seguridad

- La `anon key` ya no se usa en el navegador.
- No uses `service_role` para este formulario.
- La funcion serverless valida origen, honeypot, tiempo minimo, formato y contenido sospechoso antes de insertar.
- RLS sigue activo y `anon` solo puede insertar las columnas necesarias.

## Campos Guardados

- `nombre`
- `email`
- `negocio`
- `mensaje`
- `consentimiento`
- `source`
- `ip_address`
- `user_agent`
- `created_at`

## Antes De Subir

```bash
npm run build
git status
```
