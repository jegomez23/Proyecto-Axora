# Axora

Sitio web estático para Axora, una agencia de soluciones digitales para negocios locales.

## Estructura

- `index.html`: página principal.
- `contacto.html`: página de contacto con formulario preparado para Netlify Forms.
- `proceso.html`, `proyectos.html`, `soluciones.html`: páginas internas.
- `main.js`: interacciones del sitio.
- `src/input.css`: estilos fuente de Tailwind y reglas personalizadas.
- `dist/output.css`: CSS generado durante el build.
- `img/`: recursos visuales del sitio.
- `netlify.toml`: configuración de despliegue y cabeceras para Netlify.

## Desarrollo

Instala dependencias:

```bash
npm install
```

Genera el CSS en modo watch:

```bash
npm run dev
```

Genera el CSS optimizado para producción:

```bash
npm run build
```

## Despliegue En Netlify

Configuración recomendada:

- Build command: `npm run build`
- Publish directory: `.`

El archivo `netlify.toml` ya incluye esos valores. El formulario de `contacto.html` usa Netlify Forms con honeypot anti-spam y redirección a `gracias.html`.

## Antes De Subir A GitHub

Verifica:

```bash
npm run build
git status
```

No subas `node_modules/`, `.netlify/` ni archivos `.env`; ya están cubiertos por `.gitignore`.
