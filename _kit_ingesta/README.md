# Kit de Ingesta de Sitios Patrimoniales

Esta carpeta contiene todos los archivos necesarios para incorporar sitios al atlas, ya sea usando un agente de IA o completando la tabla manualmente.

## Archivos incluidos

| Archivo | Para qué sirve |
|---|---|
| `instrucciones_agente_extractor.md` | Instrucciones completas para que un agente IA extraiga sitios desde un documento y genere el CSV |
| `plantilla_ingesta_base.csv` | Cabecera CSV oficial — fuente de verdad del sistema |
| `manual_usuario_ingesta.md` | *(próximamente)* Guía paso a paso para el usuario: ingesta AI y llenado manual |

## Flujo resumido

```
Documento fuente (PDF, texto, tabla, video)
        │
        ▼
Agente IA (usa instrucciones_agente_extractor.md)
        │  extrae sitios, completa con web, pregunta al usuario
        │  entrega vista previa → usuario aprueba
        ▼
Archivo CSV (basado en plantilla_ingesta_base.csv)
        │
        ▼
Panel de carga en la app → revisión → publicación
```

## Cabecera CSV oficial

```
tipo_de_registro,nombre,latitud,longitud,descripcion,region,comuna,codigo_accesibilidad,categoria_cmn,tipologias,cultura_asociada,periodo_cronologico,subcategoria,que_lo_cubre,acceso_publico_privado
```

## Notas importantes

- No modificar la cabecera CSV.
- `codigo_accesibilidad` solo acepta los valores `A`, `B` o `C`. El criterio lo asigna el bibliotecario o el responsable de revisión.
- Para el llenado manual, usar la guía de campos en `manual_usuario_ingesta.md`.
- Los archivos subidos entran como **pendientes de revisión** — ningún sitio se publica sin aprobación.
