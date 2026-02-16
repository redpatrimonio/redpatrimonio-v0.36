#!/bin/bash

OUTPUT_DIR="perplexity-export"
rm -rf $OUTPUT_DIR
mkdir -p $OUTPUT_DIR

echo "📦 Exportando RedPatrimonio v0.4 - COMPLETO..."

# Función helper
export_file() {
  local source_path=$1
  local output_name=$2
  local file_type=$3
  
  if [ -f "$source_path" ]; then
    echo "## $source_path" > "$OUTPUT_DIR/$output_name.md"
    echo '```'"$file_type" >> "$OUTPUT_DIR/$output_name.md"
    cat "$source_path" >> "$OUTPUT_DIR/$output_name.md" 2>/dev/null
    echo '```' >> "$OUTPUT_DIR/$output_name.md"
    echo "✓ $output_name"
  else
    echo "⚠ NO EXISTE: $source_path"
  fi
}

echo ""
echo "=== LIB: CONFIGURACIÓN Y TIPOS ==="
export_file "app/types/reporte.ts" "types_reporte" "typescript"
export_file "lib/constants/tipologias.ts" "constants_tipologias" "typescript"
export_file "lib/constants/accesibilidad.ts" "constants_accesibilidad" "typescript"
export_file "lib/utils.ts" "lib_utils" "typescript"
export_file "lib/utils/role.ts" "lib_utils_role" "typescript"
export_file "lib/utils/accesibilidad.ts" "lib_utils_accesibilidad" "typescript"
export_file "lib/utils/storage.ts" "lib_utils_storage" "typescript"
export_file "lib/supabase.ts" "lib_supabase_main" "typescript"
export_file "lib/supabase/client.ts" "supabase_client" "typescript"
export_file "lib/supabase/server.ts" "supabase_server" "typescript"

echo ""
echo "=== COMPONENTES COMPARTIDOS ==="
export_file "app/components/map/MapView.tsx" "components_MapView" "tsx"
export_file "app/components/Navbar.tsx" "components_Navbar" "tsx"
export_file "app/components/Footer.tsx" "components_Footer" "tsx"
export_file "app/components/auth/AuthProvider.tsx" "components_AuthProvider" "tsx"

echo ""
echo "=== ROOT: LAYOUT Y HOME ==="
export_file "app/layout.tsx" "root_layout" "tsx"
export_file "app/page.tsx" "home_page" "tsx"
export_file "app/globals.css" "globals_css" "css"

echo ""
echo "=== AUTH ==="
export_file "app/(auth)/login/page.tsx" "auth_login" "tsx"
export_file "app/(auth)/callback/route.ts" "auth_callback" "typescript"

echo ""
echo "=== MAPA ==="
export_file "app/mapa/page.tsx" "mapa_page" "tsx"

echo ""
echo "=== REPORTAR - PÁGINA PRINCIPAL ==="
export_file "app/reportar/page.tsx" "reportar_page" "tsx"
export_file "app/reportar/confirmacion/page.tsx" "reportar_confirmacion" "tsx"

echo ""
echo "=== REPORTAR - STEPS (COMPONENTES) ==="
export_file "app/reportar/StepUbicacion.tsx" "reportar_StepUbicacion" "tsx"
export_file "app/reportar/StepCaracterizacion.tsx" "reportar_StepCaracterizacion" "tsx"
export_file "app/reportar/StepEstado.tsx" "reportar_StepEstado" "tsx"
export_file "app/reportar/StepFotos.tsx" "reportar_StepFotos" "tsx"
export_file "app/reportar/MapPicker.tsx" "reportar_MapPicker" "tsx"

echo ""
echo "=== MIS REPORTES ==="
export_file "app/mis-reportes/page.tsx" "mis-reportes_list" "tsx"
export_file "app/mis-reportes/[id]/page.tsx" "mis-reportes_detail" "tsx"

echo ""
echo "=== SITIO (FICHA PÚBLICA) ==="
export_file "app/sitio/[id]/page.tsx" "sitio_detail" "tsx"

echo ""
echo "=== DASHBOARD - REVISAR ==="
export_file "app/dashboard/layout.tsx" "dashboard_layout" "tsx"
export_file "app/dashboard/revisar/page.tsx" "dashboard_revisar_list" "tsx"
export_file "app/dashboard/revisar/[id]/page.tsx" "dashboard_revisar_detail" "tsx"

echo ""
echo "=== DASHBOARD - APROBAR ==="
export_file "app/dashboard/aprobar/page.tsx" "dashboard_aprobar_list" "tsx"
export_file "app/dashboard/aprobar/[id]/page.tsx" "dashboard_aprobar_detail" "tsx"

echo ""
echo "=== PERFIL Y USUARIOS ==="
export_file "app/perfil/page.tsx" "perfil_page" "tsx"
export_file "app/panel-usuarios/page.tsx" "panel_usuarios" "tsx"

echo ""
echo "=== PÁGINAS ESTÁTICAS ==="
export_file "app/privacidad/page.tsx" "privacidad_page" "tsx"
export_file "app/terminos/page.tsx" "terminos_page" "tsx"
export_file "app/mas/page.tsx" "mas_page" "tsx"
export_file "app/mas/buenas-practicas/page.tsx" "mas_buenas_practicas" "tsx"
export_file "app/mas/contacto/page.tsx" "mas_contacto" "tsx"

echo ""
echo "=== API ROUTES ==="
export_file "app/api/reportes/route.ts" "api_reportes" "typescript"
export_file "app/api/reportes/[id]/route.ts" "api_reportes_id" "typescript"

echo ""
echo "=== CONFIGURACIÓN PROYECTO ==="
export_file "package.json" "package" "json"
export_file "next.config.js" "next_config" "javascript"
export_file "next.config.mjs" "next_config" "javascript"
export_file "tailwind.config.ts" "tailwind_config" "typescript"
export_file "tailwind.config.js" "tailwind_config" "javascript"
export_file "tsconfig.json" "tsconfig" "json"

echo ""
echo "=== MIDDLEWARE ==="
export_file "middleware.ts" "middleware" "typescript"

echo ""
echo "=========================================="
echo "✅ Exportación completa"
echo "📂 Ubicación: $OUTPUT_DIR/"
echo ""
echo "📊 Archivos exportados:"
ls -1 $OUTPUT_DIR/*.md 2>/dev/null | wc -l
echo ""
echo "📋 Archivos generados:"
ls -1 $OUTPUT_DIR/ 2>/dev/null
echo ""
echo "⚠️  Si ves 'NO EXISTE', el archivo no está en tu proyecto."
