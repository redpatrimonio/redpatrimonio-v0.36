# 📋 CHECKPOINT CP_011 — Compendio Stehberg 1975: Cierre Lote 01 y Protocolo de Lotes

**Fecha:** 10 de octubre de 2026 (actualizado 18/10/2026)  
**Versión:** RedPatrimonio v0.5  
**Repo:** `redpatrimonio/redpatrimonio-v0.36`  
**Archivo:** `_checkpoints/CP_011_2026-10-10_Stehberg_1975_Lote01_Protocolo_Lotes.md`  
**Actualiza a:** CP_010 (Sistema de Compendios Documentales). Donde este documento contradiga a CP_010, rige CP_011.  
**Autor:** Fundador (curaduría y criterio arqueológico) & Partner Ingeniero IA (estructura, extracción y SQL)  
**Estado:** Lote 01 aplicado · Lotes 02–10 cargados (247 en `pendiente`; 354 sitios en total) · Lote 05: 34 cargados y 2 en revisión · Lotes 07, 08, 09 y 10: 15 registros con nota PENDIENTE DE REVISIÓN · Siguiente: Lote 11 (desde TABO, Carabineros del; último lote del plan)

---

## 1. Estado del compendio `stehberg_1975`

| Ítem | Estado |
|---|---|
| Sitios en `sitios_compendio` | **354** (107 del Lote 01 + 247 nuevos de los Lotes 02–10) |
| `estado_validacion` | 107 en `verde` (visibles), 247 en `pendiente` (sin lectura pública por RLS: la única política de lectura es `estado_validacion = 'verde'`). |
| `codigo_accesibilidad` | 354 en `B` |
| Homologación de tipologías (Lote 01) | ✅ Aplicada el 10/10/2026 |
| Campos `categoria_general`, `categoria_sitio`, `cultura_asociada`, `periodo_cronologico`, `cronologia_general` | ✅ Completos en los 107 (antes vacíos) |
| `comuna` | Vacía a propósito (ver §5.6) |
| Notas del compilador `[Nota RP: …]` (Lote 01) | 9 sitios |
| Lote 02 (pendientes A–CH + D–E) | ✅ 18 sitios en `pendiente`, código B, texto completo, 6 con nota RP |
| Lote 03 (FANTINI → HUENCHULLAMI) | ✅ 25 sitios en `pendiente`, código B, texto completo, 6 con nota RP |
| Lote 04 (HUENTELAUQUEN → LIGUA, La) | ✅ 20 sitios en `pendiente`, código B, texto completo |
| Lote 05 (LIGUAY → MATA GORDA) | 34 sitios en `pendiente`, código B, texto completo; LO VALLE y LLAPEN en revisión y fuera de la tabla |
| Lote 06 (MAUCO → PASTIZAL, Taller del) | ✅ 37 sitios en `pendiente`, código B, texto completo, 10 con nota RP; 7 remisiones «(Ver X)» |
| Lote 07 (PATAGUILLA, La → PLANCHON, Paso del) | ✅ 30 sitios en `pendiente`, código B, 12 con nota RP; 7 con nota «PENDIENTE DE REVISIÓN» (ver §7.9); 2 remisiones «(Ver X)» (PIEDRA DE LOS PLATITOS, PLACILLA). Transcrito desde OCR y texto pegado por el fundador, sin lectura visual del PDF |
| Lote 08 (PLAZA, La → PURUTUN) | ✅ 21 sitios en `pendiente`, código B, 6 con nota RP; 3 con nota «PENDIENTE DE REVISIÓN» (ver §7.14); 2 nombres repetidos diferenciados con `alias_local` (PUNTILLA, La). Texto pegado por el fundador y OCR del proyecto, sin lectura visual del PDF |
| Lote 09 (PUTU → RASPA 2, La) | ✅ 28 sitios en `pendiente`, código B; 2 con nota «PENDIENTE DE REVISIÓN» (QUEBRACHAL, QUISCAS; ver §7.16); 9 registros QUIVOLGO como Aldea; 2 remisiones «(Ver X)» (QUEBRADA VERDE, RAPIANTU). Texto pegado por el fundador, sin lectura visual del PDF |
| Lote 10 (RATONES, Cerro los → SOBRANTE, El) | ✅ 34 sitios en `pendiente`, código B; 3 con nota «PENDIENTE DE REVISIÓN» (RIO CLARO, RIO SECO, SALINAS; ver §7.17); 2 remisiones «(Ver X)» (RETIRO, SAN BORJA). Texto leído por la IA desde los `.md` del espacio (p36-p68 y p69-p96), sin lectura visual del PDF |
| Corrección de metadatos del Lote 05 (aprobada 15/10/2026) | ✅ 34 registros alineados con §5.2: `capa_destino='arqueologico'`, `compilador_digital='Carlos Verdugo Rotella'`, `declarado_cmn` NULL, `fuente_principal` = referencias + « — Diccionario Stehberg»; la línea «Referencias citadas por Stehberg» salió de la descripción |
| Resto del diccionario (TABO → YAQUIL) | Por revisar y cargar, Lote 11 (~32 entradas); aparte quedan las 2 entradas no localizadas del Lote 05 |

Verificación posterior al INSERT del Lote 07 (17/10/2026): total 271; verde 107; pendiente 164; código distinto de B: 0; comuna con valor: 0; `declarado_cmn` con valor: 0; `capa_destino='arqueologico'`: 164; `url_pdf` con PDF 71072: 101 (Lotes 05–07); con nota PENDIENTE DE REVISIÓN: 7.

Verificación posterior al INSERT del Lote 08 (18/10/2026): total 292; verde 107; pendiente 185; código distinto de B: 0; comuna con valor: 0; `declarado_cmn` con valor: 0; `capa_destino='arqueologico'`: 185; `url_pdf` con PDF 71072: 122 (Lotes 05–08); con nota PENDIENTE DE REVISIÓN: 10; con `alias_local`: 5 (3 MAITENES y 2 PUNTILLA).

Verificación posterior al INSERT del Lote 09 (18/10/2026): total 320; verde 107; pendiente 213; código distinto de B: 0; comuna con valor: 0; `declarado_cmn` con valor: 0; `capa_destino='arqueologico'`: 213; `url_pdf` con PDF 71072: 150 (Lotes 05–09); con nota PENDIENTE DE REVISIÓN: 12; con `alias_local`: 5.

Verificación posterior al INSERT del Lote 10 (18/10/2026): total 354; verde 107; pendiente 247; código distinto de B: 0; comuna con valor: 0; `declarado_cmn` con valor: 0; `capa_destino='arqueologico'`: 247; `url_pdf` con PDF 71072: 184 (Lotes 05–10); con nota PENDIENTE DE REVISIÓN: 15; con `alias_local`: 5.

### Rotulación de lotes (definitiva)
- **Lote 01** = homologación y correcciones de los 107 sitios ya cargados (A–CH). No existe "Lote 00".
- **Lote 02 en adelante** = sitios nuevos, por parte del PDF (§6).

---

## 2. Fuentes del compendio (Project files · carpeta `1975 DSA/`)

| Fuente | Uso | Observaciones |
|---|---|---|
| `Libro original/…páginas-N.pdf` (18 partes) | **Fuente primaria.** Se lee su texto extraído por partes. | Las partes `a2` y `a3` repiten pp. 5–19 con OCR deficiente. Usar la serie sin prefijo `a` cuando exista. |
| `1975 - DSA p4-p35.md`, `p36-p68.md`, `p69-p96.md` | Transcripción de apoyo para contrastar la lectura. | OCR con errores en grados (`9` por `°`, `%` por `°`). Los marcadores «## Página N» numeran la página del PDF: la página impresa es N + 1. |
| `1975 - DSA p4-p35.csv`, `p36-p68.csv`, `p69-p96.csv` | **Solo borrador**, nunca fuente. | Columnas corridas (referencias mezcladas en etiquetas). p4-p35 termina en CH; p36-p68 termina en PURUTUN; p69-p96 parte en RELOCA. Faltan D–I y PUTU–REINA II. |
| `1975 DSA/lotes/` | Salida de cada lote: CSV de revisión + SQL aplicado. | `Lote_01_homologacion_A-CH.csv` y `.sql` |
| `1975 DSA/lotes/_herramientas/homologar_v1.py` | Reglas de homologación reutilizables. | Se aplica igual en todos los lotes. |

**Enlace resuelto, corrección anterior pendiente:** los Lotes 05 a 10 usan el [PDF original de la Publicación Ocasional N° 17 de 1975](https://publicaciones.mnhn.gob.cl/668/articles-71072_archivo_01.pdf), identificado en la [ficha del MNHN](https://publicaciones.mnhn.gob.cl/668/w3-article-71072.html). Esos 184 registros usan el PDF original. Los 170 registros anteriores siguen apuntando al [Apéndice 1975-1977](https://publicaciones.mnhn.gob.cl/668/articles-64113_archivo_01.pdf); su corrección se hará por separado.

---

## 3. Vocabulario controlado (fuente única: `lib/constants/tipologias.ts`)

### 3.1 Adiciones aprobadas y subidas en este checkpoint
- `TIPOLOGIAS['Infraestructura productiva']`: **`Piedras tacitas`**, **`Taller lítico`**
- `CULTURAS`: **`Aconcagua`**
- `CULTURAS`: **`Huentelauquén`** (aprobada y añadida durante el Lote 04).
- `PERIODOS`: **`Paleoindio`**

### 3.2 Valores por campo (corrige la descripción de columnas de CP_010)

| Campo | Valores |
|---|---|
| `categoria_general` | Una de `CATEGORIAS` (ej.: `Sitios habitacionales`, `Arte rupestre`, `Estructuras ceremoniales o funerarias`, `Infraestructura productiva`, `Sistemas viales`, `Fortificaciones`, `Hallazgos aislados`, `Otro`). Corresponde a la categoría de la **primera** tipología. |
| `tipologia_especifica` | Array de valores de `TIPOLOGIAS`, en el orden de aparición del subtítulo de Stehberg. |
| `categoria_sitio` | `Sitio Arqueológico` o `Hallazgo Aislado` (`CLASIFICACION_CMN`) |
| `cultura_asociada` | Valores de `CULTURAS` unidos por ` / ` (ej.: `Molle / Inca`). Sin mención explícita: `No determinado`. |
| `periodo_cronologico` | Valores de `PERIODOS` unidos por ` / `. Sin mención explícita: `No determinado`. |
| `cronologia_general` | `Prehispánico`, `Histórico` o `Prehispánico e Histórico` |

### 3.3 Tabla de homologación Stehberg → RP

| Término de Stehberg (subtítulo) | Categoría | Tipología |
|---|---|---|
| Conchal (cerámico / precerámico) | Sitios habitacionales | Conchales |
| Alero, abrigo, cueva, casa de piedra | Sitios habitacionales | Refugio rocoso |
| Paradero, campamento | Sitios habitacionales | Campamento |
| Poblado, pueblo, aldea, sitio de poblamiento (Lote 09) | Sitios habitacionales | Aldea |
| Estructuras incásicas/habitacionales, centro indígena, curacazgo, mitimaes | Sitios habitacionales | Complejo habitacional |
| Petroglifos | Arte rupestre | Petroglifos |
| Pictografías | Arte rupestre | Pictografías |
| Figura, ídolo, escultura de piedra | Arte rupestre | Arte mobiliar |
| Cementerio | Estructuras ceremoniales o funerarias | Cementerio |
| Cementerio de túmulos | Estructuras ceremoniales o funerarias | Cementerio + Túmulo funerario |
| Enterratorio, sepultura, esqueleto | Estructuras ceremoniales o funerarias | Sepultura |
| Santuario, adoratorio | Estructuras ceremoniales o funerarias | Plataforma ceremonial |
| Piedras tacitas | Infraestructura productiva | Piedras tacitas |
| Taller lítico | Infraestructura productiva | Taller lítico |
| Acequia, canal | Infraestructura productiva | Sistema de riego |
| Lavaderos de oro, mina | Infraestructura productiva | Minas |
| Camino Real, Camino del Inca | Sistemas viales | Qhapaq Ñan (Camino Inca) |
| Tambo, tambillos | Sistemas viales | Tambo |
| Puente | Sistemas viales | Puente |
| Fortaleza, fortificación, pucará | Fortificaciones | Pukará |
| Clava, hacha, puntas, piedra horadada, material lítico | Hallazgos aislados | Material lítico |
| Cerámica, ceramio, aríbalo, vaso | Hallazgos aislados | Material cerámico |
| Mastodonte, fauna, restos óseos | Hallazgos aislados | Material óseo |
| "Restos indígenas precolombinos" (sin más) | Otro | No determinado |

**Ajustes al script (`homologar_v1.py`, Lote 03)**
- `caserío` y `asentamiento` → `Aldea`.
- "influencia(s) diaguita(s)" no asigna cultura Diaguita (singular y plural).
- "a la llegada de los españoles" no asigna `Colonial` (se quitó `español` del patrón; quedan `hispano` y `colonial`).
- Coordenadas que quedan a ~3 km del lugar nombrado dentro de una ciudad (ej.: GOLF, HUELEN) se mantienen como en el original: están dentro de la aproximación de Stehberg y moverlas las dejaría en pleno centro urbano.
- (Lote 07) "preincaico" y "relacionado con la ocupación incaica" activan el patrón `inca` del script pero no afirman cultura Inca: se corrigen a mano a `No determinado` (PETORCA, PIEDRA NUMERADA). Una colonia mitimae solo atribuida a un autor (PELEQUEN) tampoco asigna Inca.
- (Lote 08) "Colonia mitimae", "Curacazgo inca", "Cerámica inca-local" y "Estructuras incásicas" afirmados en el subtítulo o en el texto asignan `Inca` (POCOA, PURUTUN, PRINCIPAL, PORTILLO, PUENTE DE LOS INCAS). "Santuario incaico" → `Plataforma ceremonial` (PLOMO). En PLAZA, La las piedras tacitas se citan como forma del nivel anterior y no se agregan como tipología.
- (Lote 09) "pre-incaica" (QUINTA NORMAL) y fortificación inca atribuida a un autor y "probablemente" de otro sitio (QUINTERO) no asignan Inca. "Cementerio de túmulos ... período formativo" atribuido por un congreso asigna `Formativo` (QUILAPILUN). "Presuntamente precerámico" no asigna período (RASPA, La).
- (Lote 10) "influencia incaica" (SAN JOSE DE MAIPO) no asigna Inca; "Cementerio diaguita - incaico" asigna `Diaguita / Inca` (SAN AGUSTIN DE TANGO); "Cementerio Picunche" queda `No determinado` hasta definir la cultura (ver §7.17).

**Reglas complementarias**
1. Si el subtítulo tiene un tipo de sitio y además material (ej.: "Conchal con cerámica"), el material no se agrega como tipología.
2. Si la descripción menciona explícitamente tacitas, petroglifos, pictografías o túmulos asociados, se agregan al final.
3. `categoria_sitio = Hallazgo Aislado` solo cuando todas las tipologías son materiales (`Material lítico/cerámico/óseo/textil`, `Arte mobiliar`).
4. **Cultura:** Molle/molloide → `Molle`; Aconcagua Salmón → `Aconcagua`; diaguita → `Diaguita` (no cuando dice "influencia diaguita"); inca, incaico, incásico, inca-local, curacazgo, mitimaes → `Inca`; pehuenche → `Pehuenche`; hispano/colonial → `Colonial`. **"Aconcagua" como topónimo (río, desembocadura) no es cultura.**
5. **Período:** precerámico → `Arcaico`; Molle → `Formativo`; Aconcagua → `Intermedio Tardío`; Inca → `Tardío/Inca`; mastodonte/paleo → `Paleoindio`; Colonial → `Colonial`.
6. **No inferir:** si el texto no lo dice, queda `No determinado`. "Cerámico" por sí solo no asigna período.
7. El subtítulo original de Stehberg se conserva **literal** en `descripcion_breve`.

---

## 4. Correcciones de coordenadas aplicadas en el Lote 01

| Sitio | Original | Antes en tabla | Ahora | Motivo |
|---|---|---|---|---|
| CURIMON | 32°47' - 70°42' | -70.81667 | -70.70 | Error de carga (70°49') |
| CATEMU | 32°46' - 71°58' | -71.96667 | -70.96667 | El original cae en el mar; Altos de Catemu = 70°58' |
| CURAUMA, Quebrada de | 32°09' - 71°42' | -32.15 | -33.15 | Texto: 8 km al S de Valparaíso |
| CASAS | 33°07' - 71°54' | -33.11667, -71.9 | -33.000, -70.705 | Cae en el mar; texto: camino de la cuesta de Chacabuco |
| ALAMO, Aguada el | 33°07' - 71°54' | -33.11667, -71.9 | -32.987, -70.705 | Cae en el mar; 1,5 km al N de Casas |
| CHOMEDAHUE | sin coordenadas | = CUNACO, región Maule | -34.645, -71.345, O'Higgins | Error del CSV; localidad en comuna de Santa Cruz |
| CAÑAS, LAS | 35°30' - 70°30' | (ya corregido) | — | Solo se agrega la nota: costa de Constitución = 72°30' |
| CHANCO | 32°45' - 72°37' | (ya corregido) | — | Solo se agrega la nota: Chanco = 35°45' |
| CHARAMABIDA | ? | (aproximada) | — | Solo se agrega la nota de ubicación aproximada |

Verificación cruzada: los 107 se contrastaron con las partes 2–6 del PDF; los demás coinciden con el original.

---

## 5. Protocolo de extracción por lote (Bibliotecario de Compendio)

Adapta el rol del Agente Bibliotecario (`reportes_nuevos`) a la tabla `sitios_compendio`.

### 5.1 Ciclo de cada lote
1. **Extraer** las entradas de la parte del PDF que corresponde (§6).
2. **Contrastar** cada entrada con la transcripción `.md` y, si existe, con el CSV borrador.
3. **Verificar duplicados** contra `sitios_compendio` por nombre.
4. **Homologar** con `homologar_v1.py` y revisar caso a caso.
5. **Validar coordenadas** (§5.4).
6. **Entregar** `Lote_NN_<tramo>.csv` con observaciones → **aprobación del fundador**.
7. **Insertar** con SQL `Lote_NN_<tramo>.sql` (una sola sentencia, sin BEGIN/COMMIT), guardado en `1975 DSA/lotes/`.
8. **Verificar** los conteos tras el INSERT y registrar el lote en el siguiente checkpoint.

### 5.2 Valores fijos de cada INSERT
```
compendio_slug       = 'stehberg_1975'
estado_validacion    = 'pendiente'      -- no visible hasta el cierre de la revisión
codigo_accesibilidad = 'B'
capa_destino         = 'arqueologico'
autor_original       = 'Rubén Stehberg'
titulo_obra          = 'Diccionario de sitios arqueológicos de Chile Central'
anio_publicacion     = 1975
institucion_editora  = 'Museo Nacional de Historia Natural — Publicación Ocasional N° 17'
compilador_digital   = 'Carlos Verdugo Rotella'
url_pdf              = 'https://publicaciones.mnhn.gob.cl/668/articles-71072_archivo_01.pdf'  -- Lotes 05 a 10; los 170 anteriores, ver §2
comuna               = NULL
alias_local          = NULL             -- salvo nombres repetidos (ver §5.3.3)
declarado_cmn        = NULL             -- NULL, no false
fuente_principal     = referencias de la entrada + ' — Diccionario Stehberg'
```

### 5.3 Mapeo de cada entrada
| Elemento de la entrada | Campo |
|---|---|
| Nombre en mayúsculas, tal como se imprime (ej.: `MAITEN, El`) | `nombre_sitio` |
| Coordenadas GG°MM' → decimal negativo, 5 decimales | `latitud`, `longitud` |
| Subtítulo (línea 2) | `descripcion_breve` (literal) |
| Cuerpo del texto **completo**, con el OCR corregido (palabras cortadas por guion unidas, sin cambiar la redacción) | `descripcion_detallada` + notas RP al final |
| Localidad mencionada en el texto | `localidad_sector` |
| Referencias bibliográficas + ` — Diccionario Stehberg` | `fuente_principal` |
| Región actual: `Coquimbo`, `Valparaíso`, `Metropolitana`, `O'Higgins`, `Maule`, `Ñuble` | `region` |

### 5.3.1 Decisiones del 10/10/2026
- **Descripción completa:** los sitios nuevos (Lote 02 en adelante) llevan el texto íntegro de Stehberg. Los 107 del Lote 01 conservan su resumen por ahora (📌 pendiente §7).
- **Signo ±:** no se registra. Según el propio autor, prácticamente todas sus coordenadas son aproximadas; además, el código B ya muestra el punto desplazado.
- **Remisiones con texto propio:** si una entrada dice "(Ver X)" pero tiene descripción propia (ej.: CAMINO 2), no lleva el sufijo en el nombre; el sufijo `(Ver X)` es solo para entradas cuyo cuerpo es únicamente la remisión.
- **Tipologías corregidas a mano:** cuando el script asigna algo que el texto no afirma del sitio (ej.: "precerámico" citado como comparación), se corrige a mano y queda registrado en el CSV del lote.

### 5.3.2 Decisión del 17/10/2026 (Lote 07)
- **Entradas con datos faltantes o dudosos** (nombre, coordenada o texto de remisión no resueltos con el OCR) se cargan igual, en `pendiente`, con una segunda nota al final de `descripcion_detallada`: `[Nota RP: PENDIENTE DE REVISIÓN: …]`. Se buscan después con `descripcion_detallada ILIKE '%PENDIENTE DE REVISIÓN%'` y se completan en el PDF. `latitud` y `longitud` son NOT NULL en la tabla: si falta la coordenada se usa un pin provisional con nota.
- **Revisión del PDF:** se hace solo cuando la información está incompleta, es incoherente o la coordenada es poco congruente; esos casos los revisa el fundador.
- **Cultura Inca:** los registros con relación inca se dejan como asigna el protocolo (PICO y PEUMO: Inca); PETORCA, PIEDRA NUMERADA y PELEQUEN quedan `No determinado`.
- **PATOS, Paso de los:** ubicación referencial aceptada (pin en el paso, -32.36289, -70.2195).

### 5.3.3 Decisiones del 18/10/2026 (Lote 08)
- **Nombres repetidos en el libro:** se diferencian con un descriptor entre paréntesis y el nombre impreso va en `alias_local`, igual que los MAITENES del Lote 05 (ej.: `PUNTILLA, La (Conchal cerámico)` y `PUNTILLA, La (Cueva con enterratorio)`, alias `PUNTILLA, La`). El filtro NOT EXISTS del INSERT compara por `nombre_sitio`, por eso los nombres deben ser únicos.
- **Coordenadas aportadas por el fundador en UTM:** se convierten con pyproj (EPSG:32718, WGS84 huso 18S) y la nota RP registra las UTM originales (PUNTILLA de Pichilemu: 771378.72 E, 6186514.34 S = -34.42725, -72.04695).
- **Pines del fundo El Peral:** POTRERO LA VIÑA (3 km al E y ~300 m al S del ancla) y POTRERO SEGUNDO (2 km al E y ~200 m al N del ancla) se miden desde el ancla del estero (-33.52065, -71.60669). En POTRERO SEGUNDO se sigue la distancia al camino público.
- **Fuente del texto:** el fundador pega el texto de las páginas desde el `.md` (marcadores «## Página N»; página impresa = N + 1). La lectura de archivos del proyecto devuelve tramos limitados con omisiones; para el Lote 10 la IA logró leer el tramo completo con consultas dirigidas a bloques de páginas.

### 5.3.4 Decisiones del 18/10/2026 (Lotes 09 y 10)
- **Criterio general de coordenadas (fundador):** «vamos a confiar más en la descripción que en la coordenada»; R. Stehberg le confesó que no manejaba coordenadas exactas. Cuando la cifra impresa contradice el lugar descrito, se sigue el texto y la nota RP registra la cifra impresa. Excepción: si una entrada es el mismo sitio que otro ya cargado (ej.: SAUCE, El = CASA DEL BRUJO), se usa la coordenada impresa/ya cargada.
- **Quivolgo (Lote 09):** los 9 registros (QUIVOLGO y QUIVOLGO 1 a 8) se cargan como `Aldea` (más Conchales / Refugio rocoso / Piedras tacitas / Túmulo funerario cuando el texto lo dice) y `Sitio Arqueológico`; pin en la margen N del Maule (-35.313, -72.401; QUIVOLGO 8 ~200 m al N), siguiendo el texto antes que la coordenada impresa, que cae sobre Constitución.
- **«Sitio de poblamiento»** → tipología `Aldea` (aprobado por el fundador).
- **PUNTILLA de Pichilemu (Lote 08):** coordenada UTM del fundador (ver §5.3.3).
- **QUIRILLUCA (Lote 09):** ubicada por indicación del fundador en el Parque Acantilados de la Quirilluca, Puchuncaví (-32.69752, -71.45929, Mapcarta/OpenStreetMap), al N de Ventanas por la costa.
- **RIO CLARO, Cerro del (Lote 10):** usa el mismo pin que ITATA (-36.88, -72.42), como se dejó acordado en el Lote 04.
- **Remisiones (Lote 10):** SAN BORJA copia MARCOLETA (mismo pin); RETIRO, El copia solo lo propio de QUILPUE (calle El Retiro). Referencia correcta: **Baytelman 1970** (Beco Baytelman, investigador chileno que documentó hallazgos arqueológicos históricos del centro de Santiago); en MARCOLETA (Lote 05) la tabla dice «Bateylman» y debe corregirse (§7.17).
- **Pines Ritoque (Lote 10):** RITOQUE y sus 3 «Núcleo» usan el mismo pin que MISIONES 1 y NORMANDIE (-32.85, -71.508) y se reubican en la revisión final de pines junto con DUNAS 2 y DUNAS BAJAS 3.

### 5.4 Validación de coordenadas (regla del fundador)
Cada coordenada se contrasta con **el lugar que describe el texto**, no solo con la cifra impresa. Se marca si:
- cae en el mar o fuera de Chile Central;
- no coincide con la localidad, río o distancia que menciona el texto ("8 km al S de…", "1,5 km al N de…");
- repite exactamente las coordenadas de otro sitio sin que el texto lo justifique.

**Cómo se corrige:**
- **Errata evidente** (un dígito o un grado): se corrige y se agrega `[Nota RP: Coordenada corregida: el original imprime …; …]`.
- **Sin coordenadas (`?`):** se ubica cerca de la zona que indica el texto, **nunca en el centro de la ciudad o pueblo**, y se agrega `[Nota RP: El original no indica coordenadas. Ubicación aproximada RP …]`.
- La nota va **siempre al final de `descripcion_detallada`**, separada por una línea en blanco.

### 5.5 Remisiones "Ver X"
Cada entrada "Ver X" se carga como **fila propia**:
- `nombre_sitio` = `NOMBRE (Ver X)`, ej.: `MOLLACA (Ver Quillota)`
- coordenadas: las de la entrada
- `descripcion_detallada`: se copia lo necesario de la entrada X referida al lugar
- `fuente_principal`: las referencias de la entrada más las de X

### 5.6 Comuna
No se asigna. Si el texto no la dice, queda `NULL`; un error de comuna es peor que un dato vacío. Se resolverá en una fase posterior.

### 5.7 Cierre de la revisión (al final de todos los lotes)
- `UPDATE … SET estado_validacion = 'verde' WHERE compendio_slug = 'stehberg_1975' AND estado_validacion = 'pendiente'`
- Actualizar el conteo fijo en el código "Chile Central · 107 sitios" (`components/map/ToggleCapas.tsx`).

---

## 6. Plan de lotes (sitios nuevos)

Criterio: **una parte del PDF por lote, entre 20 y 30 sitios**, para revisarlo en una sola sesión y que un error quede acotado a su lote.

| Lote | Parte PDF | Páginas | Tramo | Aprox. |
|---|---|---|---|---|
| 02 | 5 (+ pendientes A–CH) | 26–29 | Pendientes A–CH + DEHESA → ESPERANZA | 8 + ~12 |
| 03 | 6 | 30–34 | FANTINI → HUENCHULLAMI | ~25 |
| 04 | a7 | 35–38 | HUENTELAUQUEN → LIGUA, La | ~19 |
| 05 | a8 + a9 | 39–45 | LIGUAY → MATA GORDA (incluye MAITENCILLO 1-6) | 36: 34 cargadas, 2 en revisión |
| 06 | 10 + 11 | 46–52 | MAUCO → PASTIZAL, Taller del | 37 cargadas |
| 07 | 12 | 53–58 | PATAGUILLA, La → PLANCHON, Paso del | 30 cargadas |
| 08 | 13 | 59–61 | PLAZA, La → PURUTUN | 21 cargadas |
| 09 | 14 | 62–67 | PUTU → RASPA 2, La | 28 cargadas |
| 10 | 15 | 68–74 | RATONES, Cerro los → SOBRANTE, El | 34 cargadas |
| 11 | 16 + 17 | 75–82 (marcadores del `.md`; impresas 76–83) | TABO, Carabineros del → ZORRA, Piedra de la (YAQUIL incluido) | ~32 |

**Pendientes A–CH que entran en el Lote 02:** BATALLA (Piedra de la), CASA DEL BRUJO, CERRITO (Taller del), CIGUEÑA (Estero de la) —remisiones "Ver X"—; CAMINO 2 (omitido en la carga inicial); CAMINO DEL INCA, COPEQUEN y CUDAHUITA (sin coordenadas en el original).

Los conteos son aproximados (detección automática de encabezados); el número exacto se fija al extraer cada lote.

### 6.1 Registro de lotes aplicados
| Lote | Fecha | Sitios | Estado | Archivos (`1975 DSA/lotes/`) | Notas |
|---|---|---|---|---|---|
| 01 | 10/10/2026 | 107 (UPDATE) | `verde` | `Lote_01_homologacion_A-CH.csv/.sql` | Homologación + 9 notas RP |
| 02 | 10/10/2026 | 18 (INSERT) | `pendiente` | `Lote_02_pendientesA-CH_D-E.csv/.sql`, `_herramientas/lote02_data.py` | Coordenadas corregidas: CIGUEÑA, DOCAS, ESCUELA DE COMUNICACIONES I. Sin coordenadas en el original: CAMINO DEL INCA (tramo Chacabuco–Colina), COPEQUEN (Copequén, Coinco; tentativa), CUDAHUITA (afueras de Malloco, según historia local de Peñaflor–Malloco–Padre Hurtado; tentativa). |
| 03 | 10/10/2026 | 25 (INSERT) | `pendiente` | `Lote_03_F-HUENCHULLAMI.csv/.sql`, `_herramientas/lote03_data.py`, `gen03.py` | Coordenadas corregidas: GUACHO, HIERRO VIEJO, HORCON III, HUAPI, HUENCHULLAMI. Sin coordenadas: FANTINI (afueras de Quillota). Remisiones: GUAIQUIVILO y HUAYQUIVILLO (Ver Valle de Calabozos). |
| 04 | 10/10/2026 | 20 (INSERT) | `pendiente` | `Lote_04_HUENTELAUQUEN-LIGUA.csv/.sql`, `_herramientas/lote04_data.py`, `gen04.py` | Coordenadas corregidas: HUENTELAUQUEN (margen N del Choapa), ILOCA, INFIERNILLO, JAHUEL ALTO. Sin coordenadas: LA CRUZ (zona acequia madre del Maipo, tentativa), ITATA (Ver Río Claro; zona Quinel, Cabrero, entre Itata y río Claro; tentativa — la entrada RIO CLARO, Cerro del ? de la letra R debe usar la misma ubicación). Nueva cultura en lista controlada: `Huentelauquén` (agregada a `CULTURAS` en `tipologias.ts`). |
| 05 | 10/10/2026 | 34 (INSERT); 2 excluidas | `pendiente` | `Lote_05_LIGUAY-MATA_GORDA.csv/.sql`, `_revision.md`, `_carga.json`, `_herramientas/lote05_data.py`, `gen05.py` | Aprobación explícita de las 34 entradas y exclusión de LO VALLE y LLAPEN por ubicación no resuelta. 15 ajustes geográficos aproximados con nota RP. Dos MAITENES, Los diferenciados como Conchal y Tiesto alfarero, con nombre original como alias. MAITEN, El incorpora RIO COLORADO p. 70, afluente del Aconcagua. Verificados: 34 IDs, coincidencia de campos con el CSV aprobado, comuna NULL, código B, estado pendiente y cero visibles al rol anon. |
| 06 | 15/10/2026 | 37 (INSERT) | `pendiente` | `Lote_06_MAUCO-PASTIZAL.csv/.sql`, `_EXPLAIN.sql`, `_PRECHECK.sql`, `_validacion.json`, `_herramientas/lote06_data.py`, `gen06.py` | 10 notas RP; 7 remisiones «(Ver X)»; anclas del estero La Cigüeña para MIRAMAR, PALQUIAL y PARAGUAS. |
| 07 | 17/10/2026 | 30 (INSERT) | `pendiente` | `Lote_07_PATAGUILLA-PLANCHON.csv/.sql`, `_EXPLAIN.sql`, `_PRECHECK.sql`, `_validacion.json`, `_herramientas/lote07_data.py`, `gen07.py`, `homologar_v1.py` (**generados en la sesión; pendientes de subir a `1975 DSA/lotes/`, sin CLI `pplx`**) | Transcrito desde OCR y texto pegado por el fundador; sin lectura visual del PDF; EXPLAIN no ejecutado en la base (sentencia única); lista controlada no validada contra `tipologias.ts`. Coordenadas corregidas: PERAL (Fundo) y PERAL (Laguna) por ancla/laguna, PETRAS, PIEDRAS TAZAS, PITE, PATOS (Paso). Remisiones: PIEDRA DE LOS PLATITOS (Ver La Huerta), PLACILLA (Ver Las Cenizas). 7 con nota PENDIENTE DE REVISIÓN (ver §7.9). |
| 08 | 18/10/2026 | 21 (INSERT) | `pendiente` | `Lote_08_PLAZA-PURUTUN.csv/.sql`, `_EXPLAIN.sql`, `_PRECHECK.sql`, `_validacion.json`, `_herramientas/lote08_data.py`, `gen08.py`, `homologar_v1.py` (**generados en la sesión; pendientes de subir a `1975 DSA/lotes/`, sin CLI `pplx`**) | Texto pegado por el fundador (desde POTRERILLOS) y OCR del proyecto (PLAZA a PORTILLO); sin lectura visual del PDF; EXPLAIN no ejecutado en la base. 0 duplicados en el precheck. Coordenadas corregidas: POTRERO LA VIÑA y POTRERO SEGUNDO (ancla del estero), PUNTILLA de Pichilemu (UTM del fundador). Nombres repetidos: PUNTILLA, La (2) con alias. 3 con nota PENDIENTE DE REVISIÓN (ver §7.14). |
| 09 | 18/10/2026 | 28 (INSERT) | `pendiente` | `Lote_09_PUTU-RASPA_2.csv/.sql`, `_herramientas/lote09_data.py`, `gen09.py`, `homologar_v1.py` (**generados en la sesión; no conservados ni subidos a `1975 DSA/lotes/`, sin CLI `pplx`; reconstruibles desde la tabla**) | Texto pegado por el fundador (desde QUILPUE) y del lote anterior (PUTU a QUILPUE); sin lectura visual del PDF; EXPLAIN no ejecutado. 0 duplicados en el precheck. Coordenadas corregidas: QUIRILLUCA (Parque Acantilados de la Quirilluca), QUIVOLGO 0–8 (margen N del Maule), RANCHILLOS (grupo Borries), RASPA, RASPA 1 y 2 (punto medio Papudo–Zapallar), QUISCAS (estero Las Hualtatas), QUEBRACHAL (11 km al E de Los Vilos). Remisiones: QUEBRADA VERDE (Ver La Poza 2), RAPIANTU (Ver Cajón de los Cipreses, texto tomado de BATALLA, Piedra de la). 2 con nota PENDIENTE DE REVISIÓN (ver §7.16). |
| 10 | 18/10/2026 | 34 (INSERT) | `pendiente` | `Lote_10_RATONES-SOBRANTE.csv/.sql`, `_validacion.json`, `_herramientas/lote10_data.py`, `gen10.py`, `homologar_v1.py` (**generados en la sesión; pendientes de subir a `1975 DSA/lotes/`, sin CLI `pplx`**) | Texto leído desde los `.md` del espacio; sin lectura visual del PDF; EXPLAIN no ejecutado. 0 duplicados en el precheck. Coordenadas corregidas: RATONES (junto a Queltehues), REÑACA, REPRESA, RITOQUE (+3 núcleos y Punta), SALINAS, SAN PEDRO, SAN SEBASTIAN (Playa Grande), SANTO DOMINGO, SANTOS DEL MAR. Remisiones: RETIRO, El (Ver Quilpué), SAN BORJA (Ver Marcoleta). Nuevo «º» en NUCLEO 1º/2º/3º (el OCR imprime %), con nombre original en el CSV. 3 con nota PENDIENTE DE REVISIÓN (ver §7.17). |

**Total en `sitios_compendio` (stehberg_1975):** 354 = 107 `verde` + 247 `pendiente`.

**Aviso para lotes futuros (Lote 11):** TALLER LITICO (grupo Borries 1971, cuesta de Chacabuco) trae el mismo 71°54' erróneo que CASAS, ALAMO, PIEDRAS TAZAS y RANCHILLOS; corregir con igual criterio (PIEDRAS TAZAS quedó ~1 km al S de CASAS, en -33.009, -70.705; el texto de TALLER LITICO lo ubica a 300 m al SO de Piedras Tazas). VITACURA (Ver El Salto) debe usar la misma coordenada que SALTO, El (-33.38333, -70.65). TAMBILLOS DEL INCA (Ver Marga-Marga) usa la coordenada de MARGA-MARGA. TIL-TIL ya tiene remisiones cargadas (MONUMENTO, Cementerio del).

---

## 7. Pendientes y decisiones abiertas
0. 📌 Completar `descripcion_detallada` de los 107 del Lote 01 con el texto íntegro y renombrar sus remisiones con el sufijo `(Ver X)` (ALGARROBAL, BUCALEMU, CHENA, CHINCOLCO u otras). Se trabaja después.
1. Aplicar por separado el `url_pdf` original de la Publicación Ocasional N° 17 a los 170 registros anteriores al Lote 05 (§2). El enlace ya está identificado; los 184 de los Lotes 05 a 10 lo usan.
2. ¿Se trata el Apéndice 1975-1977 como compendio aparte (`stehberg_1977_apendice`)?
3. ✅ Resuelto en el Lote 06: `NEUQUEN` está en la «ex-provincia de Colchagua» (Chile, no Argentina); se cargó con pin genérico en el valle de Colchagua y nota RP. Revisar en la fase final si se identifica la localidad.
4. Comuna: resolver en una fase posterior (§5.6).
5. LO VALLE y LLAPEN (Lote 05, p. 40): conservados en el CSV, no insertados. Falta ubicación respaldada; no equiparar automáticamente con Lo Ovalle o Illapel.
6. MATA GORDA (Lote 05): «Complejo Papudo» conservado en la descripción y cultura `No determinado`. Definir si se agrega Papudo a CULTURAS; no se añadió automáticamente.
7. Lote 06, para la revisión final de pines: (a) DUNAS 2 y DUNAS BAJAS 3 (Lotes anteriores) siguen en el punto costero impreso (32°51' - 71°31'); decisión 15/10/2026: se dejan en la zona costera y se reubican con el resto de la revisión. MISIONES 1, MISIONES 2 y NORMANDIE (Lote 06) se desplazaron ≤1 km a tierra; RITOQUE y sus 3 núcleos (Lote 10) usan el mismo pin. (b) CIGUEÑA (Lote 02) está a ~3 km del estero La Cigüeña; MIRAMAR, PALQUIAL y PARAGUAS (Lote 06), PERAL, Fundo el (Lote 07), POTRERO LA VIÑA y POTRERO SEGUNDO (Lote 08) y REPRESA, Cerro La (Lote 10; 500 m al N y 500 m al E) se midieron desde el estero (-33.52065, -71.60669).
8. MAUCO (Lote 06): subtítulo «Estructuras indígenas», sin «fortaleza» en el texto; cargado como `No determinado` / `Otro`. MAULE conserva la coordenada impresa (±), cercana al río Claro de San Clemente, afluente del Maule alto.
9. **Lote 07, registros con nota PENDIENTE DE REVISIÓN (verificar en el PDF):**
   - PATAGUILLA, La: el OCR lee 34°43' - 71°35', ~16 km al O-SO de Santa Cruz; el texto dice ~9 km al SO de Paniahue (si el PDF dice 71°25' es coherente). Se cargó la coordenada impresa.
   - PEÑA BLANCA E. 5: verificar el encabezado («E. 5») y las páginas de la última cita (Berdichewsky 1964). Se corrigió «perdichewsky 1935» a 1955.
   - PETRAS, Quebrada: la latitud OCR (33°09') no cuadra; la quebrada Las Petras está entre Algarrobo y El Quisco. Pin orientativo (-33.385, -71.668).
   - PICHIDANGUI: la longitud impresa probablemente cae en el mar; ubicar la desembocadura del Quilimarí y poner el pin 500 m al N. Se corrigió «Bahamondes 1909» a 1969.
   - SIN NOMBRE LEGIBLE (Putaendo; entre PIEDRAS TAZAS y PIRAMIDE, La): el OCR perdió el encabezado (nombre y coordenadas). Hipótesis no verificada: PIGUCHEN. Pin provisional (-32.6, -70.7). Al resolverlo, renombrar el registro.
   - PIRAMIDE, La: 33°25' - 70°38' cae en el sector del cerro San Cristóbal, no al NO de Santiago; si el PDF dice 70°43' queda junto al cerro Renca. Se cargó la coordenada impresa.
   - PLACILLA (Ver Las Cenizas): completar con el texto íntegro de CENIZAS, Las (el copiado viene del registro del Lote 01, que es un resumen) y combinar sus referencias.
10. Lote 07, observaciones menores (sin nota en la tabla): PEDERNAL 1, 2 y 3 comparten coordenada entre sí y con CHINCOLCO (Lote 01); PICHILEMU («En la misma plaza», ¿playa?); PIEDRA DE LAS MARCAS (cabecera del río Seco, posible desfase hacia el interior); PITE, Punta (verificar que el pin no caiga en el mar); varias coordenadas impresas conservadas sin contraste cartográfico fino.
11. `capa_destino` está vacío (NULL) en los 107 registros `verde` del Lote 01; §5.2 la fija como `arqueologico`. Decidir si se completa antes del cierre de la revisión (afecta lo que se ve en el mapa).
12. Archivos de los Lotes 07 a 10 y este checkpoint pendientes de subir a `1975 DSA/lotes/` y `1975 DSA/checkpoints/` de los archivos del proyecto (requiere la CLI `pplx project files submit`). La copia de CP_011 en `1975 DSA/checkpoints/` está desactualizada (llega solo hasta el Lote 06).
13. Seguridad (aviso del asesor de Supabase, 17/10/2026): `spatial_ref_sys`, `reportes_cmn`, `lugares_capas`, `inv_cola`, `inv_fichas` e `inv_log` no tienen RLS activado. No afecta a `sitios_compendio`; se trata como tarea aparte.
14. **Lote 08, registros con nota PENDIENTE DE REVISIÓN (verificar en el PDF):**
   - PLAZA, La: verificar la palabra «Colmo» (el OCR lee «Ccliimo»).
   - PORTILLO, Paso del: verificar que la coordenada impresa (35°15' - 70°20') quede del lado chileno y en el paso indicado (alta cordillera, cerca del límite internacional).
   - PULLALLI 1: la longitud del OCR («719 93») es ilegible; se usa provisoriamente la de PULLALLI 2 (71°28'). La latitud impresa (32°27') de ambos PULLALLI queda ~6 km al N de Papudo, mientras el texto dice «entre Papudo y Zapallar».
15. Lote 08, observaciones menores (sin nota en la tabla): PLOMO, Cerro del conserva «figuras de platas y oro» como lo lee el OCR; POCOA (coordenada con «(?)» del autor); POZA 2, La y PUNTILLA, La (Conchal cerámico) con coordenada impresa cercana al mar (verificar que no caigan en él); PUENTE DE LOS INCAS (coordenada en la alta cordillera cerca del límite internacional; cultura Inca por el subtítulo aunque el texto dice «habrían»); PUNTILLA de Pichilemu (pin según UTM del fundador, ~3 km al SO de la coordenada impresa); POTRERO SEGUNDO (el texto dice a la vez «próximo a la desembocadura» y «a más de 2 km del camino público»); varias coordenadas impresas conservadas sin contraste cartográfico fino.
16. **Lote 09, registros con nota PENDIENTE DE REVISIÓN (verificar en el PDF):**
   - QUEBRACHAL: la coordenada del OCR es ilegible («3192 06” - 70% 34») y la longitud 70°34' queda ~95 km al E de Los Vilos. Pin provisional ~11 km al E de Los Vilos (-31.908, -71.393).
   - QUISCAS, Casa de piedra Las: la coordenada impresa cae al NO de Santiago y el texto dice NE (estero Las Hualtatas, La Dehesa, Lo Barnechea). Pin orientativo (-33.36, -70.51); el texto menciona «comuna de Las Condes» (la comuna queda vacía).
   - Observaciones menores: QUIRILLUCA (ubicada según el fundador; verificar los minutos de latitud en el PDF); PUTU y QUIVOLGO 1 como Sitio Arqueológico (el texto dice «yacimiento/sitio arqueológico») pese a tener solo material en el subtítulo; QUIVOLGO 3 y 5 (7.000 m² / material de superficie) también quedaron como Aldea por el criterio del fundador; QUILLOTA y QUILLOTA (Estadio de) comparten coordenada con MOLLACA; RASPA 1/2 y RASPA, La en el mismo pin (punto medio Papudo–Zapallar); RAPIANTU copia el texto de BATALLA, Piedra de la (misma coordenada que CIPRESES, Cajon de los).
17. **Lote 10, registros con nota PENDIENTE DE REVISIÓN (verificar en el PDF):**
   - RIO CLARO: la coordenada impresa (35°14' - 71°10', Maule) no coincide con el texto (departamento de San Fernando, frente a la Isla de los Briones). Se cargó la impresa y la región Maule, a confirmar.
   - RIO SECO, Cajón del: coordenada ilegible en el OCR («309 03 - 70% 02 ?»); pin provisional en 36°03' - 71°02' (cordillera de Linares, estilo Guaiquivilo).
   - SALINAS, Estero las: ubicar con precisión la bifurcación Las Salinas–Puchuncaví / Quintero en el límite de Las Ventanas; el pin (-32.75, -71.48) es orientativo.
   - 📌 **RAUCO** (cementerio «Picunche», Lote 10): queda `No determinado` por ahora. «Picunche» se podría agregar a `CULTURAS` u homologar a otra cultura de Chile Central; el fundador lo definirá con Rubén Stehberg en la revisión final. No agregar a las listas sin su aprobación.
   - Corrección de referencia: MARCOLETA (Lote 05) dice «Bateylman 1970»; debe decir «Baytelman 1970» (Beco Baytelman).
   - SAUCE, El: carga con la coordenada impresa de CASA DEL BRUJO (Ver El Sauce, Lote 02: -33.11667, -71.66667), pues el texto identifica ambos sitios como el mismo. Esa coordenada cae en la costa de Laguna Verde, lejos de Villa Alemana/Limache; ambos registros deben reubicarse juntos en la revisión final (sugerencia: entre Villa Alemana (-33.043, -71.374) y el Fundo El Sauce (-33.023, -71.300)).
   - SAN MANUEL, Fundo / PARRAL (Ver Fundo San Manuel, Lote 06): texto dice 50 km al E de Parral y la cifra impresa queda a ~23 km; se mantiene la impresa por coherencia entre ambos registros.
   - RATONES, Cerro los: pin ~1,5 km al SE del pin impreso de QUELTEHUES (Lote 09); ambos se afinan juntos (la coordenada impresa de Queltehues no se contrastó con mapa).
   - Observaciones menores: RIO CLARO, Cerro del usa el mismo pin que ITATA; RITOQUE y los 3 núcleos comparten pin con MISIONES 1; SAN JERONIMO («fundo costero») con coordenada ~11 km tierra adentro; SAN PEDRO sin coordenadas (pin ~2 km al S de la desembocadura del Maipo); SANTO DOMINGO y SAN SEBASTIAN (Playa Grande) con pines orientativos; SAN MIGUEL, Hacienda y varias coordenadas impresas conservadas sin contraste cartográfico fino.
