# 📋 CHECKPOINT CP_011 — Compendio Stehberg 1975: Cierre Lote 01 y Protocolo de Lotes

**Fecha:** 10 de octubre de 2026  
**Versión:** RedPatrimonio v0.5  
**Repo:** `redpatrimonio/redpatrimonio-v0.36`  
**Archivo:** `_checkpoints/CP_011_2026-10-10_Stehberg_1975_Lote01_Protocolo_Lotes.md`  
**Actualiza a:** CP_010 (Sistema de Compendios Documentales). Donde este documento contradiga a CP_010, rige CP_011.  
**Autor:** Fundador (curaduría y criterio arqueológico) & Partner Ingeniero IA (estructura, extracción y SQL)  
**Estado:** Lote 01 aplicado · Lotes 02–06 cargados (134 en `pendiente`; 241 sitios en total) · Lote 05: 34 cargados y 2 en revisión · Siguiente: Lote 07

---

## 1. Estado del compendio `stehberg_1975`

| Ítem | Estado |
|---|---|
| Sitios en `sitios_compendio` | **204** (107 del Lote 01 + 97 nuevos de los Lotes 02–05) |
| `estado_validacion` | 107 en `verde` (visibles), 97 en `pendiente` (sin lectura pública por RLS). |
| `codigo_accesibilidad` | 204 en `B` |
| Homologación de tipologías (Lote 01) | ✅ Aplicada el 10/10/2026 |
| Campos `categoria_general`, `categoria_sitio`, `cultura_asociada`, `periodo_cronologico`, `cronologia_general` | ✅ Completos en los 107 (antes vacíos) |
| `comuna` | Vacía a propósito (ver §5.6) |
| Notas del compilador `[Nota RP: …]` (Lote 01) | 9 sitios |
| Lote 02 (pendientes A–CH + D–E) | ✅ 18 sitios en `pendiente`, código B, texto completo, 6 con nota RP |
| Lote 03 (FANTINI → HUENCHULLAMI) | ✅ 25 sitios en `pendiente`, código B, texto completo, 6 con nota RP |
| Lote 04 (HUENTELAUQUEN → LIGUA, La) | ✅ 20 sitios en `pendiente`, código B, texto completo |
| Lote 05 (LIGUAY → MATA GORDA) | 34 sitios en `pendiente`, código B, texto completo; LO VALLE y LLAPEN en revisión y fuera de la tabla |
| Lote 06 (MAUCO → PASTIZAL, Taller del) | ✅ 37 sitios en `pendiente`, código B, texto completo, 10 con nota RP; 7 remisiones «(Ver X)» |
| Corrección de metadatos del Lote 05 (aprobada 15/10/2026) | ✅ 34 registros alineados con §5.2: `capa_destino='arqueologico'`, `compilador_digital='Carlos Verdugo Rotella'`, `declarado_cmn` NULL, `fuente_principal` = referencias + « — Diccionario Stehberg»; la línea «Referencias citadas por Stehberg» salió de la descripción |
| Resto del diccionario (PATAGUILLA → YAQUIL) | Por revisar y cargar, Lotes 07 a 11; aparte quedan las 2 entradas no localizadas del Lote 05 |

### Rotulación de lotes (definitiva)
- **Lote 01** = homologación y correcciones de los 107 sitios ya cargados (A–CH). No existe "Lote 00".
- **Lote 02 en adelante** = sitios nuevos, por parte del PDF (§6).

---

## 2. Fuentes del compendio (Project files · carpeta `1975 DSA/`)

| Fuente | Uso | Observaciones |
|---|---|---|
| `Libro original/…páginas-N.pdf` (18 partes) | **Fuente primaria.** Se lee su texto extraído por partes. | Las partes `a2` y `a3` repiten pp. 5–19 con OCR deficiente. Usar la serie sin prefijo `a` cuando exista. |
| `1975 - DSA p4-p35.md`, `p36-p68.md`, `p69-p96.md` | Transcripción de apoyo para contrastar la lectura. | OCR con errores en grados (`9` por `°`, `%` por `°`). |
| `1975 - DSA p4-p35.csv`, `p36-p68.csv`, `p69-p96.csv` | **Solo borrador**, nunca fuente. | Columnas corridas (referencias mezcladas en etiquetas). p4-p35 termina en CH; p36-p68 termina en PURUTUN; p69-p96 parte en RELOCA. Faltan D–I y PUTU–REINA II. |
| `1975 DSA/lotes/` | Salida de cada lote: CSV de revisión + SQL aplicado. | `Lote_01_homologacion_A-CH.csv` y `.sql` |
| `1975 DSA/lotes/_herramientas/homologar_v1.py` | Reglas de homologación reutilizables. | Se aplica igual en todos los lotes. |

**Enlace resuelto, corrección anterior pendiente:** el Lote 05 usa el [PDF original de la Publicación Ocasional N° 17 de 1975](https://publicaciones.mnhn.gob.cl/668/articles-71072_archivo_01.pdf), identificado en la [ficha del MNHN](https://publicaciones.mnhn.gob.cl/668/w3-article-71072.html). Los Lotes 05 y 06 (71 registros) usan el PDF original. Los 170 registros anteriores siguen apuntando al [Apéndice 1975-1977](https://publicaciones.mnhn.gob.cl/668/articles-64113_archivo_01.pdf); no se actualizaron al cargar el Lote 05 y su corrección se hará por separado.

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
| Poblado, pueblo, aldea | Sitios habitacionales | Aldea |
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
7. **Insertar** con SQL `Lote_NN_<tramo>.sql`, guardado en `1975 DSA/lotes/`.
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
url_pdf              = (igual que los 107, hasta resolver el pendiente del §2)
comuna               = NULL
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
| 07 | 12 | 53–58 | PATAGUILLA → PLACILLA | ~27 |
| 08 | 13 | 59–62 | PLAZA → PURUTUN | ~15 |
| 09 | 14 | 63–68 | PUTU → RASPA 2 | ~28 |
| 10 | 15 | 69–75 | RATONES → SOBRANTE | ~32 |
| 11 | 16 + 17 | 76–83 | TABO → YAQUIL | ~29 |

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

**Total en `sitios_compendio` (stehberg_1975):** 204 = 107 `verde` + 97 `pendiente`.

**Aviso para lotes futuros:** PIEDRAS TAZAS y TALLER LITICO (grupo Borries 1971, cuesta de Chacabuco) traen el mismo 71°54' erróneo que CASAS y ALAMO; corregir con igual criterio.

---

## 7. Pendientes y decisiones abiertas
0. 📌 Completar `descripcion_detallada` de los 107 del Lote 01 con el texto íntegro y renombrar sus remisiones con el sufijo `(Ver X)` (ALGARROBAL, BUCALEMU, CHENA, CHINCOLCO u otras). Se trabaja después.
1. Aplicar por separado el `url_pdf` original de la Publicación Ocasional N° 17 a los 170 registros anteriores al Lote 05 (§2). El enlace ya está identificado; los 71 de los Lotes 05 y 06 lo usan.
2. ¿Se trata el Apéndice 1975-1977 como compendio aparte (`stehberg_1977_apendice`)?
3. ✅ Resuelto en el Lote 06: `NEUQUEN` está en la «ex-provincia de Colchagua» (Chile, no Argentina); se cargó con pin genérico en el valle de Colchagua y nota RP. Revisar en la fase final si se identifica la localidad.
4. Comuna: resolver en una fase posterior (§5.6).
5. LO VALLE y LLAPEN (Lote 05, p. 40): conservados en el CSV, no insertados. Falta ubicación respaldada; no equiparar automáticamente con Lo Ovalle o Illapel.
6. MATA GORDA (Lote 05): «Complejo Papudo» conservado en la descripción y cultura `No determinado`. Definir si se agrega Papudo a CULTURAS; no se añadió automáticamente.
7. Lote 06, para la revisión final de pines: (a) DUNAS 2 y DUNAS BAJAS 3 (Lotes anteriores) siguen en el punto costero impreso (32°51' - 71°31'); decisión 15/10/2026: se dejan en la zona costera y se reubican con el resto de la revisión. MISIONES 1, MISIONES 2 y NORMANDIE (Lote 06) se desplazaron ≤1 km a tierra. (b) CIGUEÑA (Lote 02) está a ~3 km del estero La Cigüeña; MIRAMAR, PALQUIAL y PARAGUAS (Lote 06) se midieron desde el estero (-33.52065, -71.60669); REPRESA y POTRERO LA VIÑA (Lote 07) deben usar el mismo ancla.
8. MAUCO (Lote 06): subtítulo «Estructuras indígenas», sin «fortaleza» en el texto; cargado como `No determinado` / `Otro`. MAULE conserva la coordenada impresa (±), cercana al río Claro de San Clemente, afluente del Maule alto.
