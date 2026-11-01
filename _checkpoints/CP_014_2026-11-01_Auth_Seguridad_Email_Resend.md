# CP_014 — Auth, seguridad Supabase y correo de marca

**Fecha:** 1 de noviembre de 2026
**Repo:** redpatrimonio/redpatrimonio-v0.36 (main)
**Estado:** Login por correo funcionando (validado por el usuario) · Seguridad Fase 1 aplicada · Fases 2 y 3 pendientes
**Contexto:** continúa CP_012 (dominio). CP_013 (ingesta CMN) es otro frente y no se toca aquí.

---

## 1. Hecho

### Login y sesión (código)
- `app/(auth)/login/page.tsx`: diseño oscuro con tokens del sistema, Google + Magic Link por correo, errores en pantalla (sin `alert`), logo 140 px, copy final ("ArqueoPortal", "Patrimonio arqueológico").
- `app/(auth)/callback/route.ts`: va a `/perfil` por defecto o a `next` (solo rutas internas); si falla, redirige a `/login?auth_error=...` en vez de ocultar el error.
- `app/(auth)/confirm/route.ts` (nueva): valida el enlace del correo con `verifyOtp` (token_hash, type=email) en el servidor.
- Commits: `0267393`, `cf887d5`, `857e0e6`, `31e3274`.

### Correo de marca (Resend + Supabase SMTP)
- Resend: dominio `arqueoportal.com` verificado. Registros DNS en Cloudflare, todos DNS only: TXT `resend._domainkey`, CNAME `rsend`, CNAME `send`. DMARC opcional, no agregado.
- Supabase SMTP personalizado: remitente `no-reply@arqueoportal.com`, nombre `ArqueoPortal`, host `smtp.resend.com`, puerto 465, usuario `resend`, contraseña = API key de Resend (solo guardada en Supabase).
- Plantillas "Confirm sign up" y "Magic link" con enlace `{{ .SiteURL }}/confirm?token_hash={{ .TokenHash }}&type=email`.
- Causa del primer fallo de envío: host mal escrito (`mtp.resend.com`). Corregido; el usuario confirmó que funciona.

### Seguridad Supabase — Fase 1 (migración `fase1_rls_lugares_capas_y_funciones_internas`)
- RLS activado en `lugares_capas`; `anon` solo SELECT; `authenticated` SELECT/INSERT/UPDATE/DELETE filtrado por políticas (founder/partner).
- Cerradas a `PUBLIC/anon/authenticated`: `limpiar_reportes_antiguos()`, `copiar_reporte_a_sitio()`, `handle_new_user()`.
- Verificado: triggers `on_auth_user_created` y `trigger_copiar_reporte_verde` siguen existiendo; el perfil de un usuario nuevo se crea con rol `publico`; el mapa sin sesión sigue mostrando las capas (prueba del usuario OK).

---

## 2. Decisiones cerradas

- Las cargas por SQL Editor y por conector siguen igual (rol `postgres` no depende de RLS). La API pública no debe escribir sitios; la app opera con roles (partner+ crea/edita sitios; no existe borrado por API).
- Magic Link por correo como alternativa a Google. Código de 6 dígitos queda como alternativa futura.
- Flujo de enlace de correo: `/confirm` con token_hash (no depende de la cookie PKCE del navegador).
- Los usuarios con rol `experto` se solicitarán desde el panel de usuario, con aprobación; `partner` nunca se postula (lo otorga el founder).

---

## 3. Pendientes (orden sugerido)

1. **Banner superior (Navbar)** — siguiente sprint. Hoy en pantallas pequeñas no se ve quién está conectado; si existe sesión pero el perfil no carga, muestra "Ingresar"; marca aún dice "RedPatrimonio".
2. **Seguridad Fase 2 (script ya revisado, pendiente de aprobar):** RLS e `inv_cola`, `inv_fichas`, `inv_log`, `reportes_cmn` (founder/partner); `usuarios_autorizados`: reemplazar política "Registro público" por registro propio con rol `publico`, y trigger que impide cambiar `rol`, `activo`, `email`, `id_usuario`, `creado_por_email` a quien no sea founder (SQL/servicio exentos).
3. **Seguridad Fase 3:** quitar `TRUNCATE/REFERENCES/TRIGGER` a `anon/authenticated` en tablas públicas; cerrar escrituras de `anon` innecesarias (`reportes_medios`, `sitios_publicaciones`); fijar `search_path` en 11 funciones; revisar funciones ejecutables por `anon`; activar protección de contraseñas filtradas; revisar columnas heredadas `password_hash` y `google_id`.
4. `spatial_ref_sys` (propietario `supabase_admin`): no se puede corregir con `postgres`; evaluar mover PostGIS fuera de `public`.
5. Solicitud de rol `experto` desde el panel de usuario + aprobación en `/panel-usuarios`.
6. Pequeños: `/perfil` redirige a `/auth/login` (ruta inexistente; debe ser `/login`); el middleware no pasa `?next=` al redirigir a `/login`; borrar el usuario de prueba creado con correo temporal; agregar DMARC en Cloudflare cuando se quiera; confirmar que Site URL en Supabase es `https://arqueoportal.com`.
7. Loading de inicio (pendiente del plan original).

---

## 4. Notas operativas

- Rate limit de correos de Supabase pasó de 2/hora a 30/hora al activar SMTP propio.
- No pegar la API key de Resend en el chat, el repo ni capturas. Si se sospecha exposición: crear una nueva en Resend y reemplazarla en Supabase.
- Causa técnica original del Magic Link con plantillas por defecto no se pudo determinar con certeza (el login con Google sí funcionaba); el flujo `/confirm` la evita.
