# CP_013 — Ingesta listado CMN: diagnóstico previo

**Fecha:** 25 de octubre de 2026
**Repo:** redpatrimonio/redpatrimonio-v0.36 (main)
**Estado:** Diagnóstico de contexto cerrado · Análisis de archivos CMN PENDIENTE · Nada cargado

---

## 1. Objetivo del frente
Incorporar al atlas los registros del listado del Consejo de Monumentos Nacionales (Excel, 1.410 filas según el usuario): (a) monumentos arqueológicos y (b) algunos de alto interés turístico o hitos nacionales.

## 2. Insumos disponibles (no verificados aún en contenido)
- Puntos_Oficiales_Monumentos_Nacionales.xlsx (+ copia -2.xlsx)
- Puntos_Oficiales_Monumentos_Nacionales.xlsx-Hoja1.csv
- Puntos_Oficiales_Monumentos_Nacionales.geojson
- Puntos_Oficiales_Monumentos_Nacionales.kmz (archivos del proyecto)
- Pendiente: imagen de formatos de descarga del geoportal (image.jpg, sin revisar).

## 3. Decisiones cerradas
- Formato de entrada: XLSX original (sin filtrar previamente) + GeoJSON para ubicaciones; CSV UTF-8 como alternativa. No se requiere convertir a TSV.
- Formato de salida: CSV con la cabecera oficial de `_kit_ingesta/plantilla_ingesta_base.csv` (15 campos, no se modifica).
- El cruce Excel↔GeoJSON se hará por identificador, nunca por orden de filas.
- No se cargará nada en producción sin vista previa y aprobación del usuario.
- Este frente es independiente de la ingesta Stehberg 1975 (CP_011).
- Modelo IA en Perplexity: para procesar archivos usar modo de creación de archivos/ejecución de código; exigir que los totales (incluidos + excluidos + pendientes) cuadren con la entrada.

## 4. Estado Supabase observado (solo lectura, 25-oct)
- sitios_master: 20 · sitios_compendio: 386 · lugares_capas: 21 (10 lugar_interes, 11 museo) · lotes_ingesta: 0 · inv_cola: 19 · inv_fichas: 2 · sitios_memoria: 13.
- Ninguno corresponde a datos CMN.

## 5. Alerta de seguridad (sin resolver, sin cambios hechos)
- RLS desactivado y privilegios INSERT/UPDATE/DELETE para `anon` en: lugares_capas, inv_cola, inv_fichas, inv_log, reportes_cmn.
- Falta verificar exposición efectiva vía API y definir políticas. Resolver ANTES de cualquier importación.

## 6. Pendientes abiertos (preguntas para el usuario)
1. Ubicar/confirmar el archivo `0_3` (columna vertebral); no fue encontrado por nombre en el repo.
2. Reconciliar `AGENTE BIBLIOTECARIO - RP 03_04_2026.md` con el mapper vigente (`lib/ingesta/mapper.ts`) y el kit actual.
3. Definir destino de los registros CMN: ¿`sitios_master`, `lugares_capas` u otro? (no asumir).
4. Definir criterio de «alto interés turístico / hito nacional» y asignación de `codigo_accesibilidad` (A/B/C).
5. Un registro puede ser arqueológico y a la vez histórico: no filtrar solo por categoría legal.

## 7. Próximo paso (siguiente sesión)
Diagnóstico de archivos: conteo real de filas, columnas, identificadores, duplicados, calidad de coordenadas y método de unión Excel↔GeoJSON. Presentar muestra y casos dudosos. Sin cargar datos.

## 8. Reglas vigentes
Un paso a la vez · coherencia de nombres y estructuras · cada paso cierra con checkpoint breve.
