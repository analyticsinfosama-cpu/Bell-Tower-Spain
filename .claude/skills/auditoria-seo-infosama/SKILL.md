---
name: auditoria-seo-infosama
description: Genera un informe SEO integral y profesional en Word (.docx) con la identidad visual de Infosama, gráficas y tono informativo, a partir de la URL de un cliente. Úsalo cuando el usuario pida una "auditoría SEO", "informe SEO", "análisis SEO para un cliente" o pase una URL para auditar con el estilo Infosama. Cubre autoridad, técnico, datos estructurados, contenido, E-E-A-T, GEO/IA, optimización de imágenes, competidores y análisis de deficiencias.
---

# Auditoría SEO integral — estilo Infosama

Genera un informe SEO profesional en **Word (.docx)**, con la identidad visual de Infosama
(Agencia SEO en Cádiz), gráficas a medida y **tono estrictamente informativo/diagnóstico**.
El público es el **cliente final**: el informe describe el estado, las carencias y la posición
competitiva, **sin listas de tareas ni instrucciones de "aplica esto"** (el plan de ejecución es
un documento aparte interno de la agencia).

## Identidad visual Infosama (fija, no cambiar)

- Azul: `#4688A8` · Verde: `#A4D76C` · Carbón: `#2A2A2A` · Gris texto: `#6B7177`
- Estados de color: rojo `#C0392B` (Deficiente), naranja `#C8801F` (Mejorable), verde `#5A8A2A` (Correcto)
- Portada con el **logo oficial** `assets/logo-infosama.png` (puzzle azul+verde, avión y
  "INFOSAMA · Agencia SEO en Cádiz"). El template lo incrusta automáticamente si está presente
  en `informe-assets/`; si falta, usa una reserva textual "INFO"+"SAMA".
- Pie de página: "Infosama — Agencia SEO en Cádiz | Página N"
- Idioma: **castellano (español de España)** siempre.

## Flujo de trabajo

### Paso 1 — Recopilar datos REALES del dominio
No inventar nada. Usar herramientas en paralelo cuando sea posible:

1. `WebFetch` de la home → negocio, productos, idioma, NAP (dirección/teléfono/email/horario),
   title, meta description, Open Graph, canonical, JSON-LD, CMS/plataforma.
2. `WebFetch` de `/robots.txt` → directivas, bloqueo de crawlers IA, declaración de Sitemap.
3. Localizar el **sitemap** (probar `/sitemap.xml`, y en PrestaShop `/1_index_sitemap.xml` →
   sub-sitemaps). Contar URLs y detectar patrones: slugs heredados de demo, duplicación
   por multicategoría, thin content.
4. `WebFetch` de 1-2 **fichas de producto/servicio** → schema, descripción, breadcrumbs,
   reseñas, precio/stock, canonical.
5. `WebFetch` de `/llms.txt` (para GEO) y de páginas legales / "sobre nosotros" si existen.
6. **Imágenes**: extraer src/alt/nombre de archivo de home y ficha; con `Bash`/`curl -sIL`
   comprobar **peso real** (`content-length`) y formato (`content-type`) de logo, banner y
   producto; probar `Accept: image/webp` para ver si sirve formatos de nueva generación.
7. `WebSearch` → notoriedad de marca, reseñas, y **competidores** locales y nacionales.

**VERIFICAR antes de afirmar.** Si un hallazgo parece grave (p. ej. "productos demo"),
abrir la URL real y confirmar qué muestra. Corregir el hallazgo si la realidad difiere
(caso típico PrestaShop: el producto es real pero el *slug* de la URL es el demo heredado).

### Paso 2 — Estructurar el informe (12 secciones)
1. Resumen ejecutivo (con puntuación global y desglose por áreas)
2. Autoridad del proyecto
3. Diagnóstico técnico (9 categorías)
4. Datos estructurados (Schema.org)
5. On-page y contenido
6. Optimización de imágenes
7. Señales E-E-A-T
8. Visibilidad en buscadores con IA (GEO)
9. Competidores y análisis de deficiencias (gap analysis)
10. Contenido y oportunidad de escala (SEO programático)
11. Síntesis de deficiencias por nivel de impacto
12. Conclusión

Adaptar el tipo de negocio (e-commerce, local, SaaS, servicios). Para tiendas, reforzar
Product schema, Shopping y fichas; para negocios locales, GBP/NAP/reseñas.

### Paso 3 — Generar las gráficas (estilo Infosama)
Editar el bloque `DATA` al inicio de `assets/charts_template.py` con los valores reales del
cliente y ejecutarlo: `python charts_template.py`. Produce 7 PNG en `informe-assets/`:
1. Gauge de puntuación global
2. Barras por área SEO
3. Autoridad estimada vs competidores
4. Matriz de presencia de elementos SEO (gap analysis)
5. Donut de hallazgos por severidad
6. Composición del sitemap
7. Peso de imágenes (logo vs catálogo) — incluir solo si hay hallazgo de imágenes

Verificar visualmente 1-2 PNG con `Read` antes de incrustarlos.

### Paso 4 — Construir el Word
Usar `assets/report_template.js` como **esqueleto**: conservar intactos los *helpers*
(H1/H2/P/bullet/img/table), los estilos, la portada, el encabezado y el pie (marca Infosama).
**Reescribir el array `children[]`** con el contenido real del cliente, manteniendo el tono
informativo. Requisitos previos: `npm install docx` (en el directorio de trabajo), tener los
PNG en `informe-assets/` y **copiar el logo** del skill a la carpeta de trabajo:
`cp <skill>/assets/logo-infosama.png informe-assets/`. Construir: `node report_template.js`.

### Paso 5 — Validar
- Validar el .docx con el script del skill `docx` (modo UTF-8 en Windows):
  `PYTHONUTF8=1 python <docx-skill>/scripts/office/validate.py Informe-SEO-<Cliente>.docx`
- Confirmar imágenes incrustadas (zip → `word/media/*.png`).
- LibreOffice (si está instalado) para exportar PDF; si no, indicar que se exporta desde Word.

## Reglas de tono (críticas — requisito del cliente)
- **Informativo, no prescriptivo.** "Se ha detectado la ausencia de X; esta carencia
  implica…" en lugar de "implementa X" o "elimina Y".
- Cada hallazgo: **observación + impacto**. Sin hojas de ruta ni "funcionalidades a aplicar".
- Métricas sin acceso a Search Console/Analytics/herramientas de pago = **estimaciones
  razonadas**, señaladas como tales (incluida la nota metodológica al inicio).

## Notas técnicas
- En Windows el `soffice.py` del skill docx falla (usa AF_UNIX). Llamar a LibreOffice directo
  o exportar desde Word.
- El validador del skill docx revienta al imprimir `→`: ejecutar con `PYTHONUTF8=1`.
- `npm` global puede no existir: instalar `docx` localmente en el directorio de trabajo.

## Salida final
- `Informe-SEO-<Cliente>.docx` (entregable)
- `informe-assets/*.png` (gráficas, por si hay que sustituir alguna)
- Opcional: versión markdown de respaldo.
