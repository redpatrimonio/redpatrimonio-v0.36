# CP_012 — Dominio arqueoportal.com + Hoja de ruta WEB MANAGER

**Fecha:** 25 de octubre de 2026
**Repo:** redpatrimonio/redpatrimonio-v0.36 (main)
**Estado:** Dominio operativo · Auth y login pendientes

---

## 1. Hecho en esta sesión

### Dominio
- Dominio comprado en **Cloudflare Registrar**: `arqueoportal.com`.
- Dominio principal definido: **sin www** (`arqueoportal.com`).
- `www.arqueoportal.com` redirige con **308 (permanente)** a `arqueoportal.com`.
- Dominio por defecto `redpatrimonio-v0-36.vercel.app` sigue activo (Valid Configuration, Production).

### Vercel (proyecto conectado a este repo)
- `arqueoportal.com` → Connect to environment: **Production**.
- `www.arqueoportal.com` → Redirect to Another Domain: **308** → `arqueoportal.com`.

### Cloudflare DNS (registros agregados)
| Type | Name | Target | Proxy | TTL |
|---|---|---|---|---|
| CNAME | `@` | `a80964ec69b95d43.vercel-dns-017.com` | DNS only (nube gris) | Auto |
| CNAME | `www` | `a80964ec69b95d43.vercel-dns-017.com` | DNS only (nube gris) | Auto |

- Registros MX/TXT de Cloudflare Email Routing (SPF, DKIM) existentes: **no tocar**.
- Nameservers de Cloudflare (`garret.ns.cloudflare.com`, `megan.ns.cloudflare.com`): **no cambiar** (no se usa Vercel DNS).

### Verificación
- `https://arqueoportal.com` carga la app (validado por el usuario).
- `https://www.arqueoportal.com` redirige al dominio sin www (validado por el usuario).

---

## 2. Decisiones cerradas

- Proxy de Cloudflare **apagado** (DNS only) en ambos registros. El aviso "Proxying is required..." de Cloudflare se ignora a propósito.
- Dominio canónico: `https://arqueoportal.com`.
- Redirección www → raíz: permanente (308).
- No se modifica código ni middleware para el dominio; es solo configuración externa.

---

## 3. Diagnóstico del repo (lectura del 24-25 oct 2026)

- Login solo Google OAuth: `app/(auth)/login/page.tsx`. Usa colores Tailwind claros (bg-gray-50 / bg-white), inconsistente con el sistema visual oscuro (variables `--bg`, `--accent`, etc.).
- Errores de login con `alert()`.
- `app/(auth)/callback/route.ts`: redirige siempre a `/`; no respeta la ruta de origen.
- Login usa `window.location.origin` en `redirectTo`; el callback usa `requestUrl.origin`. Cada dominio debe estar autorizado en Supabase y Google.
- `components/auth/AuthProvider.tsx` expone `loading`, pero ningún componente lo usa para una pantalla de carga global.
- No existe `loading.tsx` global en `app/`; solo en `/perfil` y `/mis-reportes`.
- `middleware.ts`: protege `/perfil`, `/reportar`, `/mis-reportes`, `/dashboard`, `/panel-usuarios`, `/denuncia`, `/ficha`, con roles por ruta. Sin cambios necesarios.
- Pendiente de lectura: `globals.css`, `components/layout/Navbar.tsx`, `lib/supabase/server.ts`.
- `estructura-app.txt` dio error de lectura vía GitHub; revisar si es symlink/archivo corrupto.

---

## 4. Hoja de ruta (un paso a la vez, cada uno cierra con validación)

### Paso 2 — Autorizar el dominio nuevo (SIN código) · PRÓXIMO
1. **Supabase** → Authentication → URL Configuration:
   - Site URL: `https://arqueoportal.com`.
   - Redirect URLs: agregar `https://arqueoportal.com/**`; mantener la URL de vercel.app y localhost si se usan.
2. **Google Cloud Console** → Credenciales → cliente OAuth:
   - Orígenes autorizados de JavaScript: `https://arqueoportal.com`.
   - El URI de redirección de Google apunta al callback de Supabase (`https://<proyecto>.supabase.co/auth/v1/callback`); solo agregar si no existe.
3. Validar: login con Google desde `https://arqueoportal.com` y desde vercel.app.
4. Revisar pantalla de consentimiento OAuth (nombre de app, dominio autorizado, enlaces a /privacidad y /terminos).

### Paso 3 — Callback con retorno a la ruta de origen
- Archivos: `app/(auth)/callback/route.ts`, `app/(auth)/login/page.tsx`, `middleware.ts` (solo si se pasa `?next=`).
- Objetivo: volver a la página que el usuario intentaba abrir (`next`), validando que sea ruta interna.

### Paso 4 — Rediseño de login
- Archivo: `app/(auth)/login/page.tsx` (+ posible `app/(auth)/login/layout.tsx`).
- Usar variables CSS del sistema visual; logo; errores en pantalla (sin `alert`); estado de carga del botón.
- Decisión pendiente: ¿solo Google o agregar email/contraseña o link mágico?

### Paso 5 — Loading de inicio
- Archivos: nuevo `components/layout/LoadingScreen.tsx`, `app/loading.tsx`, uso de `loading` desde `AuthProvider`.
- Decisiones pendientes: duración mínima, logo estático o animado, si aparece en cada carga o solo en la primera visita.

### Paso 6 — Higiene posterior (opcional)
- Redirigir `redpatrimonio-v0-36.vercel.app` → `arqueoportal.com` (hacerlo solo después del Paso 2 validado).
- Actualizar metadata en `app/layout.tsx` (`metadataBase`, Open Graph) al dominio nuevo.
- Revisar `app/manifest.ts` (PWA) con la URL nueva.
- Evaluar proxy de Cloudflare solo si hay una necesidad concreta (WAF/caché).
- Correos del dominio (Email Routing de Cloudflare ya tiene MX/SPF/DKIM).

---

## 5. Pendientes heredados (no se tocan en este frente)
- Ajuste fino de controles móviles del mapa (CP v0.42).
- Random estable por sitio (seed por id_reporte) para el desplazamiento B/C.
- Sprint MVP vol. II Fase 1: sistema de iconos (código pendiente).
- Ingesta Stehberg 1975 (CP_011): 354 sitios, 247 pendientes.

---

## 6. Reglas de trabajo vigentes
- Un paso a la vez; el usuario ejecuta lo manual, el agente entrega archivos completos.
- Coherencia de nombres y estructuras por sobre velocidad.
- Cada paso cierra con checkpoint breve.
