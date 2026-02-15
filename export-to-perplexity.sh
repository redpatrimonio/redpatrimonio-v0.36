#!/bin/bash

OUTPUT_DIR="perplexity-export"
rm -rf $OUTPUT_DIR
mkdir -p $OUTPUT_DIR

echo "📦 Exportando RedPatrimonio v0.3 en formato Markdown..."

# ============================================
# CONFIGURACIÓN Y TIPOS
# ============================================
echo "## types/reporte.ts" > $OUTPUT_DIR/types_reporte.md
echo '```typescript' >> $OUTPUT_DIR/types_reporte.md
cat app/types/reporte.ts >> $OUTPUT_DIR/types_reporte.md 2>/dev/null
echo '```' >> $OUTPUT_DIR/types_reporte.md

echo "## lib/constants/tipologias.ts" > $OUTPUT_DIR/constants_tipologias.md
echo '```typescript' >> $OUTPUT_DIR/constants_tipologias.md
cat lib/constants/tipologias.ts >> $OUTPUT_DIR/constants_tipologias.md 2>/dev/null
echo '```' >> $OUTPUT_DIR/constants_tipologias.md

echo "## lib/utils.ts" > $OUTPUT_DIR/lib_utils.md
echo '```typescript' >> $OUTPUT_DIR/lib_utils.md
cat lib/utils.ts >> $OUTPUT_DIR/lib_utils.md 2>/dev/null
echo '```' >> $OUTPUT_DIR/lib_utils.md

echo "## lib/supabase/client.ts" > $OUTPUT_DIR/supabase_client.md
echo '```typescript' >> $OUTPUT_DIR/supabase_client.md
cat lib/supabase/client.ts >> $OUTPUT_DIR/supabase_client.md 2>/dev/null
echo '```' >> $OUTPUT_DIR/supabase_client.md

echo "## lib/supabase/server.ts" > $OUTPUT_DIR/supabase_server.md
echo '```typescript' >> $OUTPUT_DIR/supabase_server.md
cat lib/supabase/server.ts >> $OUTPUT_DIR/supabase_server.md 2>/dev/null
echo '```' >> $OUTPUT_DIR/supabase_server.md

# ============================================
# COMPONENTES COMPARTIDOS
# ============================================
echo "## components/map/MapView.tsx" > $OUTPUT_DIR/components_MapView.md
echo '```tsx' >> $OUTPUT_DIR/components_MapView.md
cat app/components/map/MapView.tsx >> $OUTPUT_DIR/components_MapView.md 2>/dev/null
echo '```' >> $OUTPUT_DIR/components_MapView.md

echo "## components/Navbar.tsx" > $OUTPUT_DIR/components_Navbar.md
echo '```tsx' >> $OUTPUT_DIR/components_Navbar.md
cat app/components/Navbar.tsx >> $OUTPUT_DIR/components_Navbar.md 2>/dev/null
echo '```' >> $OUTPUT_DIR/components_Navbar.md

echo "## components/Footer.tsx" > $OUTPUT_DIR/components_Footer.md
echo '```tsx' >> $OUTPUT_DIR/components_Footer.md
cat app/components/Footer.tsx >> $OUTPUT_DIR/components_Footer.md 2>/dev/null
echo '```' >> $OUTPUT_DIR/components_Footer.md

# ============================================
# PÁGINA PRINCIPAL Y MAPA
# ============================================
echo "## app/page.tsx" > $OUTPUT_DIR/home_page.md
echo '```tsx' >> $OUTPUT_DIR/home_page.md
cat app/page.tsx >> $OUTPUT_DIR/home_page.md 2>/dev/null
echo '```' >> $OUTPUT_DIR/home_page.md

echo "## app/mapa/page.tsx" > $OUTPUT_DIR/mapa_page.md
echo '```tsx' >> $OUTPUT_DIR/mapa_page.md
cat app/mapa/page.tsx >> $OUTPUT_DIR/mapa_page.md 2>/dev/null
echo '```' >> $OUTPUT_DIR/mapa_page.md

# ============================================
# FLUJO DE REPORTAR (completo)
# ============================================
echo "## app/reportar/page.tsx" > $OUTPUT_DIR/reportar_page.md
echo '```tsx' >> $OUTPUT_DIR/reportar_page.md
cat app/reportar/page.tsx >> $OUTPUT_DIR/reportar_page.md 2>/dev/null
echo '```' >> $OUTPUT_DIR/reportar_page.md

echo "## app/reportar/StepUbicacion.tsx" > $OUTPUT_DIR/reportar_StepUbicacion.md
echo '```tsx' >> $OUTPUT_DIR/reportar_StepUbicacion.md
cat app/reportar/StepUbicacion.tsx >> $OUTPUT_DIR/reportar_StepUbicacion.md 2>/dev/null
echo '```' >> $OUTPUT_DIR/reportar_StepUbicacion.md

echo "## app/reportar/StepCaracterizacion.tsx" > $OUTPUT_DIR/reportar_StepCaracterizacion.md
echo '```tsx' >> $OUTPUT_DIR/reportar_StepCaracterizacion.md
cat app/reportar/StepCaracterizacion.tsx >> $OUTPUT_DIR/reportar_StepCaracterizacion.md 2>/dev/null
echo '```' >> $OUTPUT_DIR/reportar_StepCaracterizacion.md

echo "## app/reportar/StepEstado.tsx" > $OUTPUT_DIR/reportar_StepEstado.md
echo '```tsx' >> $OUTPUT_DIR/reportar_StepEstado.md
cat app/reportar/StepEstado.tsx >> $OUTPUT_DIR/reportar_StepEstado.md 2>/dev/null
echo '```' >> $OUTPUT_DIR/reportar_StepEstado.md

echo "## app/reportar/StepFotos.tsx" > $OUTPUT_DIR/reportar_StepFotos.md
echo '```tsx' >> $OUTPUT_DIR/reportar_StepFotos.md
cat app/reportar/StepFotos.tsx >> $OUTPUT_DIR/reportar_StepFotos.md 2>/dev/null
echo '```' >> $OUTPUT_DIR/reportar_StepFotos.md

echo "## app/reportar/MapPicker.tsx" > $OUTPUT_DIR/reportar_MapPicker.md
echo '```tsx' >> $OUTPUT_DIR/reportar_MapPicker.md
cat app/reportar/MapPicker.tsx >> $OUTPUT_DIR/reportar_MapPicker.md 2>/dev/null
echo '```' >> $OUTPUT_DIR/reportar_MapPicker.md

echo "## app/reportar/confirmacion/page.tsx" > $OUTPUT_DIR/reportar_confirmacion.md
echo '```tsx' >> $OUTPUT_DIR/reportar_confirmacion.md
cat app/reportar/confirmacion/page.tsx >> $OUTPUT_DIR/reportar_confirmacion.md 2>/dev/null
echo '```' >> $OUTPUT_DIR/reportar_confirmacion.md

# ============================================
# MIS REPORTES (usuario ciudadano)
# ============================================
echo "## app/mis-reportes/page.tsx" > $OUTPUT_DIR/mis-reportes_list.md
echo '```tsx' >> $OUTPUT_DIR/mis-reportes_list.md
cat app/mis-reportes/page.tsx >> $OUTPUT_DIR/mis-reportes_list.md 2>/dev/null
echo '```' >> $OUTPUT_DIR/mis-reportes_list.md

echo "## app/mis-reportes/[id]/page.tsx" > $OUTPUT_DIR/mis-reportes_detail.md
echo '```tsx' >> $OUTPUT_DIR/mis-reportes_detail.md
cat "app/mis-reportes/[id]/page.tsx" >> $OUTPUT_DIR/mis-reportes_detail.md 2>/dev/null
echo '```' >> $OUTPUT_DIR/mis-reportes_detail.md

# ============================================
# FICHA DE SITIO (pública)
# ============================================
echo "## app/sitio/[id]/page.tsx" > $OUTPUT_DIR/sitio_detail.md
echo '```tsx' >> $OUTPUT_DIR/sitio_detail.md
cat "app/sitio/[id]/page.tsx" >> $OUTPUT_DIR/sitio_detail.md 2>/dev/null
echo '```' >> $OUTPUT_DIR/sitio_detail.md

# ============================================
# DASHBOARD ARQUEÓLOGOS - REVISAR
# ============================================
echo "## app/dashboard/revisar/page.tsx" > $OUTPUT_DIR/dashboard_revisar_list.md
echo '```tsx' >> $OUTPUT_DIR/dashboard_revisar_list.md
cat app/dashboard/revisar/page.tsx >> $OUTPUT_DIR/dashboard_revisar_list.md 2>/dev/null
echo '```' >> $OUTPUT_DIR/dashboard_revisar_list.md

echo "## app/dashboard/revisar/[id]/page.tsx" > $OUTPUT_DIR/dashboard_revisar_detail.md
echo '```tsx' >> $OUTPUT_DIR/dashboard_revisar_detail.md
cat "app/dashboard/revisar/[id]/page.tsx" >> $OUTPUT_DIR/dashboard_revisar_detail.md 2>/dev/null
echo '```' >> $OUTPUT_DIR/dashboard_revisar_detail.md

# ============================================
# DASHBOARD ARQUEÓLOGOS - APROBAR
# ============================================
echo "## app/dashboard/aprobar/page.tsx" > $OUTPUT_DIR/dashboard_aprobar_list.md
echo '```tsx' >> $OUTPUT_DIR/dashboard_aprobar_list.md
cat app/dashboard/aprobar/page.tsx >> $OUTPUT_DIR/dashboard_aprobar_list.md 2>/dev/null
echo '```' >> $OUTPUT_DIR/dashboard_aprobar_list.md

echo "## app/dashboard/aprobar/[id]/page.tsx" > $OUTPUT_DIR/dashboard_aprobar_detail.md
echo '```tsx' >> $OUTPUT_DIR/dashboard_aprobar_detail.md
cat "app/dashboard/aprobar/[id]/page.tsx" >> $OUTPUT_DIR/dashboard_aprobar_detail.md 2>/dev/null
echo '```' >> $OUTPUT_DIR/dashboard_aprobar_detail.md

# ============================================
# PERFIL Y AUTENTICACIÓN
# ============================================
echo "## app/perfil/page.tsx" > $OUTPUT_DIR/perfil_page.md
echo '```tsx' >> $OUTPUT_DIR/perfil_page.md
cat app/perfil/page.tsx >> $OUTPUT_DIR/perfil_page.md 2>/dev/null
echo '```' >> $OUTPUT_DIR/perfil_page.md

echo "## app/login/page.tsx" > $OUTPUT_DIR/login_page.md
echo '```tsx' >> $OUTPUT_DIR/login_page.md
cat app/login/page.tsx >> $OUTPUT_DIR/login_page.md 2>/dev/null
echo '```' >> $OUTPUT_DIR/login_page.md

# ============================================
# API ROUTES (si existen)
# ============================================
echo "## app/api/reportes/route.ts" > $OUTPUT_DIR/api_reportes.md
echo '```typescript' >> $OUTPUT_DIR/api_reportes.md
cat app/api/reportes/route.ts >> $OUTPUT_DIR/api_reportes.md 2>/dev/null
echo '```' >> $OUTPUT_DIR/api_reportes.md

echo "## app/api/reportes/[id]/route.ts" > $OUTPUT_DIR/api_reportes_id.md
echo '```typescript' >> $OUTPUT_DIR/api_reportes_id.md
cat "app/api/reportes/[id]/route.ts" >> $OUTPUT_DIR/api_reportes_id.md 2>/dev/null
echo '```' >> $OUTPUT_DIR/api_reportes_id.md

# ============================================
# LAYOUTS
# ============================================
echo "## app/layout.tsx" > $OUTPUT_DIR/root_layout.md
echo '```tsx' >> $OUTPUT_DIR/root_layout.md
cat app/layout.tsx >> $OUTPUT_DIR/root_layout.md 2>/dev/null
echo '```' >> $OUTPUT_DIR/root_layout.md

echo "## app/dashboard/layout.tsx" > $OUTPUT_DIR/dashboard_layout.md
echo '```tsx' >> $OUTPUT_DIR/dashboard_layout.md
cat app/dashboard/layout.tsx >> $OUTPUT_DIR/dashboard_layout.md 2>/dev/null
echo '```' >> $OUTPUT_DIR/dashboard_layout.md

# ============================================
# CONFIGURACIÓN DEL PROYECTO
# ============================================
echo "## package.json" > $OUTPUT_DIR/package.md
echo '```json' >> $OUTPUT_DIR/package.md
cat package.json >> $OUTPUT_DIR/package.md 2>/dev/null
echo '```' >> $OUTPUT_DIR/package.md

echo "## next.config.js" > $OUTPUT_DIR/next_config.md
echo '```javascript' >> $OUTPUT_DIR/next_config.md
cat next.config.js >> $OUTPUT_DIR/next_config.md 2>/dev/null
echo '```' >> $OUTPUT_DIR/next_config.md

echo "## tailwind.config.ts" > $OUTPUT_DIR/tailwind_config.md
echo '```typescript' >> $OUTPUT_DIR/tailwind_config.md
cat tailwind.config.ts >> $OUTPUT_DIR/tailwind_config.md 2>/dev/null
echo '```' >> $OUTPUT_DIR/tailwind_config.md

echo "## tsconfig.json" > $OUTPUT_DIR/tsconfig.md
echo '```json' >> $OUTPUT_DIR/tsconfig.md
cat tsconfig.json >> $OUTPUT_DIR/tsconfig.md 2>/dev/null
echo '```' >> $OUTPUT_DIR/tsconfig.md

echo ""
echo "✅ Exportación completa en formato Markdown"
echo "📂 Ubicación: $OUTPUT_DIR/"
echo ""
echo "📊 Archivos exportados:"
ls -1 $OUTPUT_DIR/*.md | wc -l
echo ""
echo "📋 Lista de archivos:"
ls -lh $OUTPUT_DIR/
