# CHECKPOINT 02.2 — Mayo 2026
## Ficha Registro Hallazgo + Middleware rutas protegidas

**Fecha:** 03 Mayo 2026  
**Rama:** main  
**Commits:** `293c817` (ficha + botón) · `d3faa63` (middleware)  
**Agente:** Perplexity (sesión nocturna)

---

## Contexto

Esta sesión parte del estado dejado en CP_02.1, donde:
- `/denuncia/[id]` ya estaba funcional (riesgo)
- El botón "Generar ficha registro" en `publicados/[id]` tenía `alert()` placeholder
- El middleware no cubría `/denuncia` ni `/ficha`
- Quedaban `console.log` de DEBUG en middleware

---

## 1. Nuevo — `app/ficha/[id]/page.tsx`

Página espejo de `/denuncia/[id]` pero para hallazgos arqueológicos.

### Flujo
1. Carga `reportes_nuevos` por `id_reporte` + `reportes_medios`
2. Pre-llena todos los campos editables desde BD
3. Arqueólogo/partner edita lo que falta
4. Dos acciones: **Guardar borrador** | **Exportar PDF**

### Pre-llenado automático

| Campo formulario | Fuente BD |
|---|---|
| Nombre del sitio | `nombre_reporte` |
| Registrador | `autor_reporte` |
| Fecha de registro | hoy (auto — no editable) |
| Categoría SA / HA | `tipologia_especifica[0]` |
| Tipología funcional | `categoria_general` |
| Cultura asociada | `cultura_asociada` |
| Cronología general | `periodo_cronologico` |
| Estado de conservación | `estado_conservacion` |
| Nivel de protección | `nivel_proteccion` |
| Alteraciones / amenazas | `amenazas` |
| Región | `region` |
| Comuna | `comuna` |
| Descripción ubicación | `descripcion_ubicacion` |
| Latitud / Longitud | `latitud`, `longitud` (readonly) |
| Fotos | `reportes_medios` (grid 2 col) |

### Estructura del documento (secciones REGMON/CMN)
1. **I. Identificación y Registro** — nombre, registrador, institución, fecha, categoría SA/HA, ID RP
2. **II. Descripción** — tipología funcional, cultura, cronología (select), estado conservación (select), descripción entidad
3. **III. Conservación y Protección** — nivel protección (select), recinto privado (readonly), alteraciones
4. **IV. Ubicación** — región, comuna, coordenadas WGS84 (readonly), descripción emplazamiento
5. **V. Registro Fotográfico** — grid 2 columnas con fotos del reporte
6. **VI. Observaciones del registrador** — campo libre
7. **Firma + timbre** — líneas en blanco para firma manuscrita

### Guardar borrador
Actualiza `reportes_nuevos` con:
`nombre_reporte`, `cultura_asociada`, `periodo_cronologico`, `estado_conservacion`,
`nivel_proteccion`, `amenazas`, `region`, `comuna`, `descripcion_ubicacion`

### Exportar PDF
`window.print()` con CSS `@media print` que oculta `.no-print`, limpia sombras y fondo.

### Acceso
Guard en componente: solo `['partner', 'founder']` → redirige a `/perfil`.

---

## 2. Modificación — `app/dashboard/publicados/[id]/page.tsx`

Cambio único: el `onClick` del botón hallazgo:

```typescript
// ANTES
alert('🛠️ Próximamente: Generar ficha de registro')

// DESPUÉS
router.push(`/ficha/${reporte.id_reporte}`)
```

Cambio visual: botón hallazgo pasó de `bg-blue-600` a `bg-teal-700` + ícono 📋.

---

## 3. Modificación — `middleware.ts`

### Rutas nuevas agregadas al array `protectedPaths`
```typescript
'/denuncia',
'/ficha',
```

### Bloques de rol nuevos
```typescript
// /denuncia — solo partner o founder
if (request.nextUrl.pathname.startsWith('/denuncia')) {
  if (!rol || !['partner', 'founder'].includes(rol)) {
    return NextResponse.redirect(new URL('/mapa', request.url))
  }
}

// /ficha — solo partner o founder
if (request.nextUrl.pathname.startsWith('/ficha')) {
  if (!rol || !['partner', 'founder'].includes(rol)) {
    return NextResponse.redirect(new URL('/mapa', request.url))
  }
}
```

### Limpieza
- Eliminados 5 `console.log` de DEBUG que quedaron de sesiones anteriores

---

## 4. Mapa completo de rutas protegidas (estado actual)

| Ruta | Requiere | Redirige si falla |
|---|---|---|
| `/perfil`, `/reportar`, `/mis-reportes` | autenticado | `/login` |
| `/dashboard` | experto / partner / founder | `/mapa` |
| `/panel-usuarios` | founder | `/mapa` |
| `/denuncia/[id]` | partner / founder | `/mapa` |
| `/ficha/[id]` | partner / founder | `/mapa` |

---

## 5. Estructura de rutas dashboard + documentos (estado actual)

```
app/dashboard/
├── revisar/[id]/page.tsx     ✅ bloque contacto + banner riesgo
├── aprobar/page.tsx          ✅ botón → publicados
├── publicados/page.tsx       ✅ tabs Todos/Hallazgos/Riesgo
└── publicados/[id]/page.tsx  ✅ botones conectados (riesgo y hallazgo)

app/reportar/
└── riesgo/page.tsx           ✅ formulario 4 pasos, campos CMN

app/denuncia/
└── [id]/page.tsx             ✅ documento riesgo — editable + PDF (CP_02.1)

app/ficha/
└── [id]/page.tsx             ✅ documento hallazgo — editable + PDF (CP_02.2)
```

---

## 6. Pendiente próximo sprint

- [ ] Verificar columnas en BD antes de probar flujo completo end-to-end:
  - `fecha_observacion` (date/timestamptz)
  - `nombre_proyecto` (text)
  - `infractor_conocido` (boolean, default false)
  - `infractor_nombre` (text, nullable)
  - `infractor_contacto` (text, nullable)
- [ ] Considerar tabla separada `denuncias` / `fichas` para tracking (estado, fecha envío CMN, respuesta)
- [ ] Paginación en listas dashboard (revisar, aprobar, publicados) cuando el volumen crezca
- [ ] CP_001 formal — consolidar estado previo al hilo CP_002

---

## 7. Convenciones activas (no cambiar sin consenso)

- Color primario: `#10454B` (teal oscuro)
- Color acción secundaria (botón enviar): `#B6875D` (terracota)
- Fondo app: `#f2f5f6`
- Fondo card seleccionada: `#e8f4f5`
- Border seleccionado: `#10454B`
- Roles con acceso al dashboard: `['experto', 'partner', 'founder']`
- Roles con acceso a /denuncia y /ficha: `['partner', 'founder']`
- `categoria_general = 'arqueologia_en_riesgo'` distingue riesgo vs hallazgo
- `estado_validacion`: `'rojo'` → `'amarillo'` → `'verde'`
- `temporalidad_riesgo`: `'pasado'` | `'activo'` | `'inminente'`
- Medios: `prioridad_visualizacion` mayor = foto principal
- Guard de rol: doble capa — middleware (borde) + componente (segundo nivel)
