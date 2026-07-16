const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, LevelFormat, HeadingLevel, BorderStyle, WidthType,
  ShadingType, ImageRun, PageBreak, TableOfContents, Footer, Header,
  PageNumber, VerticalAlign,
} = require("docx");

const ASSETS = path.join(__dirname, "informe-assets") + path.sep;

// Paleta Infosama
const AZUL = "4688A8";
const VERDE = "A4D76C";
const CARBON = "2A2A2A";
const GRIS = "6B7177";
const ROJO = "C0392B";
const NARANJA = "C8801F";
const VERDEOSC = "5A8A2A";

const CONTENT_W = 9360;

// ---- Helpers ---------------------------------------------------------------
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)] });
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] });
const H3 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(t)] });

function P(text, opts = {}) {
  const runs = Array.isArray(text) ? text : [new TextRun({ text, ...opts })];
  return new Paragraph({ spacing: { after: 120, line: 276 }, children: runs, ...(opts.align ? { alignment: opts.align } : {}) });
}

function bullet(runs) {
  return new Paragraph({
    numbering: { reference: "bul", level: 0 },
    spacing: { after: 60, line: 268 },
    children: Array.isArray(runs) ? runs : [new TextRun(runs)],
  });
}

function img(file, w, h, caption) {
  const ext = "png";
  const arr = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 60 },
      children: [new ImageRun({
        type: ext,
        data: fs.readFileSync(ASSETS + file),
        transformation: { width: w, height: h },
        altText: { title: caption, description: caption, name: file },
      })],
    }),
  ];
  if (caption) {
    arr.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: caption, italics: true, size: 17, color: GRIS })],
    }));
  }
  return arr;
}

const border = { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" };
const borders = { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border };

function cell(content, { w, fill, bold, color, align, head } = {}) {
  const runs = (Array.isArray(content) ? content : [content]).map((t) =>
    typeof t === "string" ? new TextRun({ text: t, bold: bold || head, color: color || (head ? "FFFFFF" : CARBON), size: head ? 19 : 19 }) : t);
  return new TableCell({
    borders,
    width: { size: w, type: WidthType.DXA },
    verticalAlign: VerticalAlign.CENTER,
    shading: fill ? { fill, type: ShadingType.CLEAR } : undefined,
    margins: { top: 70, bottom: 70, left: 110, right: 110 },
    children: [new Paragraph({ alignment: align || AlignmentType.LEFT, children: runs })],
  });
}

function table(headers, rows, widths) {
  const headRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => cell(h, { w: widths[i], fill: AZUL, head: true, align: i === 0 ? AlignmentType.LEFT : AlignmentType.CENTER })),
  });
  const bodyRows = rows.map((r, ri) =>
    new TableRow({
      children: r.map((c, i) => {
        const isObj = c && typeof c === "object" && !Array.isArray(c) && c.text !== undefined;
        const txt = isObj ? c.text : c;
        return cell(txt, {
          w: widths[i],
          fill: ri % 2 ? "F4F7F9" : "FFFFFF",
          color: isObj ? c.color : undefined,
          bold: isObj ? c.bold : false,
          align: i === 0 ? AlignmentType.LEFT : AlignmentType.CENTER,
        });
      }),
    }));
  return new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: widths, rows: [headRow, ...bodyRows] });
}

// estado coloreado
const E = {
  fail: { text: "Deficiente", color: ROJO, bold: true },
  warn: { text: "Mejorable", color: NARANJA, bold: true },
  pass: { text: "Correcto", color: VERDEOSC, bold: true },
  nd: { text: "Sin datos", color: GRIS, bold: true },
};

// ---- Documento -------------------------------------------------------------
const children = [];

const LOGO_PATH = ASSETS + "logo-infosama.png";
const logoBlock = fs.existsSync(LOGO_PATH)
  ? [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 1400, after: 700 },
        children: [new ImageRun({
          type: "png",
          data: fs.readFileSync(LOGO_PATH),
          transformation: { width: 380, height: 144 },
          altText: { title: "Infosama", description: "Infosama — Agencia SEO en Cádiz", name: "logo-infosama" },
        })],
      }),
    ]
  : [
      new Paragraph({ spacing: { before: 1400 } }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: "INFO", bold: true, size: 56, color: AZUL }),
          new TextRun({ text: "SAMA", bold: true, size: 56, color: VERDE }),
        ],
      }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 700 }, children: [new TextRun({ text: "Agencia SEO en Cádiz", size: 22, color: GRIS, allCaps: true })] }),
    ];

// PORTADA
children.push(
  ...logoBlock,
  new Paragraph({
    alignment: AlignmentType.CENTER,
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: AZUL, space: 12 }, top: { style: BorderStyle.SINGLE, size: 12, color: AZUL, space: 12 } },
    spacing: { before: 200, after: 200 },
    children: [new TextRun({ text: "INFORME SEO INTEGRAL", bold: true, size: 46, color: CARBON })],
  }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 300 }, children: [new TextRun({ text: "belltowerspain.com", bold: true, size: 40, color: AZUL })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 }, children: [new TextRun({ text: "Marroquinería artesanal de Ubrique (Cádiz)", size: 24, color: GRIS, italics: true })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Documento de diagnóstico · Análisis del estado SEO", size: 22, color: CARBON })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "Fecha de elaboración: 16 de julio de 2026", size: 20, color: GRIS })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Confidencial — preparado por Infosama", size: 18, color: GRIS, italics: true })] }),
  new Paragraph({ children: [new PageBreak()] }),
);

// INDICE
children.push(
  H1("Índice"),
  new TableOfContents("Tabla de contenidos", { hyperlink: true, headingStyleRange: "1-2" }),
  new Paragraph({ children: [new PageBreak()] }),
);

// NOTA METODOLOGICA
children.push(
  H1("Nota metodológica"),
  P("Este documento recoge un diagnóstico del estado de optimización para buscadores (SEO) del sitio web belltowerspain.com. Su finalidad es exclusivamente informativa: describe la situación actual del proyecto, sus fortalezas, sus carencias y su posición frente a la competencia, sin entrar en la ejecución de tareas, que se aborda en un plan de trabajo independiente."),
  P([
    new TextRun({ text: "Fuentes y alcance. ", bold: true, color: AZUL }),
    new TextRun("El análisis combina el rastreo real del dominio (página principal, robots.txt, sitemap, fichas de producto, página de contacto), una auditoría on-page ya indexada del proyecto (títulos, H1, metadescripciones, velocidad de URLs, canibalizaciones) y datos de palabras clave, tráfico orgánico estimado y enlaces entrantes procedentes de una base de datos SEO de terceros. No se ha dispuesto de acceso a Google Search Console ni a Google Analytics del cliente, por lo que las métricas de tráfico, posiciones y enlaces se presentan como estimaciones razonadas y se identifican como tales a lo largo del documento."),
  ]),
  new Paragraph({ children: [new PageBreak()] }),
);

// 1. RESUMEN EJECUTIVO
children.push(
  H1("1. Resumen ejecutivo"),
  P("Bell Tower Spain es una fábrica y tienda online de marroquinería artesanal ubicada en Ubrique (Cádiz), en activo desde 1980 según su propia comunicación de marca (\"Cuna de la piel\"). El sitio está construido sobre WordPress con WooCommerce, cuenta con versión en español e inglés (/en/) y combina catálogo de producto (bolsos, carteras, maletines, mochilas y fundas para boquillas de instrumentos de viento) con una sección de blog activa y bilingüe."),
  P("El proyecto presenta fundamentos técnicos y de contenido notablemente mejores que sus dos competidores directos de Ubrique analizados en este informe (El Potro y Ferpiel): es el único de los tres en el que se ha detectado metadescripción, marcado Product Schema y marcado FAQPage. Sin embargo, arrastra carencias que limitan su capacidad de posicionamiento frente a la competencia: un perfil de enlaces entrantes todavía muy débil y concentrado en contenido patrocinado, ausencia de reseñas de cliente visibles, canibalización de palabras clave entre la portada y varias páginas de aterrizaje dedicadas, y un volumen relevante de URLs con tiempos de respuesta lentos detectados en el rastreo."),
  H2("Puntuación SEO global"),
  ...img("01_gauge.png", 300, 241, "Puntuación SEO global estimada: 47 sobre 100."),
  P("La puntuación global de 47/100 sitúa al proyecto en una fase de consolidación: con una base de contenido y datos estructurados por delante de sus competidores locales directos, pero con una autoridad de dominio y una visibilidad en buscadores de IA todavía muy por debajo de su potencial."),
  ...img("02_categorias.png", 540, 272, "Desglose del diagnóstico por área SEO (0-100)."),
);

children.push(
  H2("Síntesis por áreas"),
  table(
    ["Área", "Estado", "Valoración"],
    [
      ["Autoridad de dominio / enlaces", E.fail, "32/100 — perfil de enlaces entrantes débil, apoyado en contenido patrocinado"],
      ["Visibilidad en IA (GEO)", E.fail, "32/100 — sin llms.txt y sin monitorización de menciones en IA, pese a contar con FAQPage"],
      ["Competitividad", E.warn, "38/100 — 70 palabras clave posicionadas frente a 101 (El Potro) y 79 (Ferpiel)"],
      ["E-commerce / Shopping", E.warn, "45/100 — Product Schema presente, sin reseñas ni valoraciones"],
      ["Técnico (rastreo/indexación)", E.warn, "52/100 — base ordenada con canibalización de keywords y URLs lentas"],
      ["Datos estructurados", E.warn, "55/100 — Product y FAQPage presentes; faltan LocalBusiness, Review y confirmar BreadcrumbList"],
      ["Contenido / E-E-A-T", E.warn, "58/100 — trayectoria desde 1980 y blog activo, sin prueba social"],
      ["On-page (titles/meta)", E.warn, "62/100 — metadescripción cuidada en portada, con duplicados puntuales en paginación de blog"],
    ],
    [3400, 1800, 4160]
  ),
  new Paragraph({ children: [new PageBreak()] }),
);

// 2. AUTORIDAD
children.push(
  H1("2. Autoridad del proyecto"),
  P("La autoridad de un dominio refleja la confianza acumulada a ojos de los buscadores, fruto principalmente de su antigüedad, su perfil de enlaces entrantes y su reconocimiento de marca. En el caso de Bell Tower Spain, las señales observadas apuntan a una autoridad todavía baja, aunque con una tendencia de tráfico orgánico creciente desde 2023."),
  H2("Observaciones"),
  bullet([new TextRun({ text: "Perfil de enlaces entrantes: ", bold: true }), new TextRun("el rastreo detecta un número reducido de dominios que enlazan al sitio. Destaca una concentración relevante de enlaces (5 de los analizados) procedentes de un mismo blog universitario (magupe.blogs.uv.es), junto con menciones puntuales en un portal de noticias (diario24horas.com) y en directorios de tiendas online (dtiendasonline.es). Este patrón es propio de una estrategia de notas de prensa o guest-posting patrocinado más que de un perfil de enlaces editoriales espontáneos, y su autoridad de origen es de nivel bajo-medio.")]),
  bullet([new TextRun({ text: "Tráfico orgánico estimado: ", bold: true }), new TextRun("la serie histórica muestra una evolución ascendente, desde cifras testimoniales en agosto de 2023 hasta picos de 358 visitas/mes en junio de 2024 y 286 en febrero de 2025, estabilizándose en torno a 130-200 visitas/mes estimadas en el último periodo analizado (70 palabras clave posicionadas en total).")]),
  bullet([new TextRun({ text: "Notoriedad de marca: ", bold: true }), new TextRun("las búsquedas externas confirman cobertura editorial reciente (varios artículos de blog y prensa digital sobre \"Bell Tower Spain\" y su papel en la marroquinería de Ubrique) y presencia en directorios locales (Páginas Amarillas), lo que indica cierto trabajo de relaciones y notoriedad ya iniciado.")]),
  H2("Posición competitiva"),
  P("Bell Tower Spain comparte origen geográfico con una industria muy consolidada: Ubrique concentra decenas de fabricantes de piel con décadas de trayectoria. Entre los competidores directos con venta online identificados destacan El Potro (marca de referencia del sector, con un catálogo amplio de 35-40 categorías), Ferpiel (fabricante desde 1972, con blog propio y testimonios de cliente) y Barada Bags (posicionamiento de lujo/artesanía). El agregador Piel de Ubrique revende, entre otras, la marca El Potro."),
  ...img("03_autoridad.png", 540, 263, "Tráfico orgánico estimado de Bell Tower Spain frente a sus competidores directos."),
  P([
    new TextRun({ text: "Lectura. ", bold: true, color: AZUL }),
    new TextRun("El Potro concentra casi diez veces más tráfico orgánico estimado que Bell Tower Spain y posiciona un 44 % más palabras clave (101 frente a 70), una distancia que corresponde más a volumen de catálogo y antigüedad de marca que a una diferencia en fundamentos técnicos, donde Bell Tower Spain está, de hecho, mejor equipado (ver apartado 9)."),
  ]),
  new Paragraph({ children: [new PageBreak()] }),
);

// 3. TECNICO
children.push(
  H1("3. Diagnóstico técnico"),
  P("El análisis técnico evalúa nueve categorías relacionadas con la capacidad del sitio para ser rastreado, indexado y servido correctamente a los buscadores."),
  table(
    ["Categoría", "Estado", "Valoración"],
    [
      ["Rastreabilidad", E.pass, "75/100"],
      ["Indexabilidad", E.warn, "55/100"],
      ["Seguridad", E.pass, "80/100"],
      ["Estructura de URL", E.pass, "70/100"],
      ["Optimización móvil", E.pass, "85/100"],
      ["Core Web Vitals / velocidad", E.fail, "35/100 — 237 URLs lentas detectadas en el rastreo"],
      ["Canibalización de keywords", E.fail, "30/100 — 33 clústeres de palabras clave afectados"],
      ["Renderizado JavaScript", E.pass, "85/100"],
      ["Protocolo IndexNow", E.nd, "No verificado"],
    ],
    [3600, 1800, 3960]
  ),
  H2("Rastreabilidad"),
  P("El archivo robots.txt está correctamente configurado: bloquea de forma adecuada el carrito, el checkout, las cuentas de usuario, los parámetros de filtrado, los archivos de sistema (backups, fuentes web) y las URLs de tipo \"add-to-cart\" propias de WooCommerce, y declara correctamente el sitemap (sitemap_index.xml, generado por Rank Math). El índice de sitemaps se organiza en 5 sub-sitemaps (entradas de blog, páginas, productos, categorías y categorías de producto), sumando aproximadamente 313 URLs."),
  H2("Indexabilidad"),
  P("No se han detectado páginas marcadas como noindex de forma indebida. Se han identificado, no obstante, dos circunstancias que restan calidad al conjunto:"),
  bullet([new TextRun({ text: "Producto de prueba heredado e indexado. ", bold: true }), new TextRun("La URL /tienda/sin-categorizar/producto-prueba/ permanece en el sitemap de producto, alojada además en la categoría genérica \"sin categorizar\". Es un resto de configuración de la plataforma que no aporta valor y diluye ligeramente la limpieza del catálogo indexado.")]),
  bullet([new TextRun({ text: "Duplicación de títulos, H1 y metadescripciones en paginación. ", bold: true }), new TextRun("La auditoría on-page detecta 3 títulos duplicados, 17 clústeres de H1 duplicados y 5 metadescripciones duplicadas, concentrados sobre todo en las páginas de paginación del blog (/blog/page/2/, /page/3/…), que heredan el mismo título y descripción que la página 1. Se ha detectado además un caso puntual de traducción incompleta: la versión en inglés de la política de privacidad (/en/privacy-policy/) conserva el H1 en español (\"Política de protección de datos\").")]),
  H2("Canibalización de palabras clave"),
  P("El análisis de Search Console ya recopilado para el proyecto identifica 33 clústeres de palabras clave en los que compiten entre sí dos o más URLs propias del sitio, normalmente la portada frente a una página de aterrizaje dedicada. Ejemplos destacados: \"piel de ubrique\" (portada vs. /piel-de-ubrique/), \"bolsos de ubrique\" (portada, /bolsos-de-ubrique/ y /tienda/), \"carteras ubrique\" y \"fabrica de carteras en ubrique\" (portada vs. /carteras-ubrique/), y las variantes de marca \"bell tower\" / \"bell tower spain\" (portada vs. /tienda/). Esta competencia interna dispersa la señal de relevancia entre páginas del propio dominio en lugar de concentrarla en una única URL por intención de búsqueda."),
  ...img("06_sitemap.png", 460, 286, "Composición real del sitemap por tipo de contenido (5 sub-sitemaps, ~313 URLs)."),
  H2("Seguridad"),
  P("El sitio sirve el 100 % de las URLs auditadas bajo HTTPS, sin versiones HTTP detectadas ni URLs espejo. No se ha podido verificar la presencia de cabeceras de seguridad avanzadas (HSTS, CSP, X-Content-Type-Options, Referrer-Policy), cuyo estado queda como punto a contrastar."),
  H2("Estructura de URL y optimización móvil"),
  P("Las direcciones siguen un patrón legible y jerárquico (/tienda/mujer/bolsos-de-cuero/producto/), con equivalente correcto bajo el prefijo /en/ para la versión en inglés y etiquetas hreflang declaradas para ambos idiomas. La página incorpora la etiqueta viewport y responde a un diseño adaptable, en línea con la indexación mobile-first."),
  H2("Velocidad y Core Web Vitals"),
  P("No se dispone de datos de campo (CrUX) del dominio. Sin embargo, la auditoría on-page ya recopilada señala 237 URLs con tiempos de respuesta lentos durante el rastreo, con varias fichas de producto y páginas de categoría superando los 6-7 segundos de respuesta en la medición registrada. Es, junto con la canibalización de keywords, el hallazgo técnico de mayor impacto potencial detectado."),
  new Paragraph({ children: [new PageBreak()] }),
);

// 4. DATOS ESTRUCTURADOS
children.push(
  H1("4. Datos estructurados (Schema.org)"),
  P("Los datos estructurados son el lenguaje que permite a los buscadores y a los asistentes de IA comprender con precisión el contenido de una página (qué es un producto, su precio, su disponibilidad, o qué preguntas responde). En este apartado, Bell Tower Spain parte de una posición mejor que la de sus dos competidores directos analizados, en los que no se ha detectado ningún marcado JSON-LD."),
  H2("Marcado detectado"),
  bullet([new TextRun({ text: "Product ", bold: true }), new TextRun("en las fichas de producto, con precio (verificado en la ficha del bolso Iris: 126,00 €) y datos del artículo. No se ha podido confirmar la propiedad de disponibilidad (availability) de forma explícita.")]),
  bullet([new TextRun({ text: "FAQPage ", bold: true }), new TextRun("en la página principal, con tres preguntas y respuestas sobre la marroquinería de Ubrique y la oferta de la marca. Es un activo especialmente relevante de cara a los resultados enriquecidos y a la citabilidad en buscadores de IA (ver apartado 8).")]),
  bullet([new TextRun({ text: "Organization ", bold: true }), new TextRun("en la página de contacto, con los datos básicos de la entidad.")]),
  H2("Marcado ausente o incompleto"),
  bullet([new TextRun({ text: "AggregateRating / Review, ", bold: true }), new TextRun("condicionado a la existencia de reseñas reales: las fichas de producto muestran actualmente \"No hay valoraciones aún\".")]),
  bullet([new TextRun({ text: "LocalBusiness / Store, ", bold: true }), new TextRun("con datos de geolocalización, horario y tipo de negocio. El marcado actual (Organization genérico) no aprovecha todo el potencial de SEO local que ofrece contar con una fábrica física en Ubrique con dirección, teléfono y horario ya publicados en la web (Julio Romero de Torres 8B).")]),
  bullet([new TextRun({ text: "BreadcrumbList, ", bold: true }), new TextRun("pese a que las migas de pan ya existen de forma visual en las fichas de producto; no se ha podido confirmar su correspondencia en JSON-LD.")]),
  new Paragraph({ children: [new PageBreak()] }),
);

// 5. ON-PAGE Y CONTENIDO
children.push(
  H1("5. Optimización on-page y contenido"),
  H2("Fortalezas detectadas"),
  bullet("La portada cuenta con título (\"Marroquinería en Ubrique | Bell Tower Spain\") y metadescripción específicos, que incluyen la actividad, la ubicación y el año de fundación (1980)."),
  bullet("Las fichas de producto analizadas superan las 800 palabras de contenido propio, con secciones de personalización y especificaciones, por encima de la ficha de producto WooCommerce estándar."),
  bullet("El blog está activo en ambos idiomas y con publicación reciente (última actualización detectada el 15/07/2026), cubriendo temas de valor como tipos de curtido, cuidado del cuero o guías de regalo."),
  H2("Carencias detectadas"),
  bullet([new TextRun({ text: "Canibalización entre la portada y páginas de aterrizaje dedicadas ", bold: true }), new TextRun("(/bolsos-de-ubrique/, /piel-de-ubrique/, /carteras-ubrique/), descrita en el apartado técnico, que compiten por las mismas intenciones de búsqueda que la propia home.")]),
  bullet([new TextRun({ text: "Brecha de contenido en el clúster de carteras y billeteras de hombre, ", bold: true }), new TextRun("de alto volumen de búsqueda (\"carteras hombre piel\": 3.600 búsquedas/mes; \"cartera piel\": 590; \"carteras de cuero\": 590), donde El Potro posiciona en primeras posiciones y Bell Tower Spain no aparece.")]),
  bullet([new TextRun({ text: "Brecha de contenido en accesorios y cuidado del cuero ", bold: true }), new TextRun("(llaveros de piel, agendas de piel, terminología \"piel vuelta\", guías de limpieza), donde Ferpiel concentra 39 palabras clave adicionales que Bell Tower Spain no cubre.")]),
  bullet([new TextRun({ text: "Traducción incompleta puntual, ", bold: true }), new TextRun("con el H1 en español detectado en la versión inglesa de la política de privacidad.")]),
  new Paragraph({ children: [new PageBreak()] }),
);

// 6. IMAGENES
children.push(
  H1("6. Optimización de imágenes"),
  P("Se ha revisado una muestra representativa de imágenes del sitio —logotipo y ficha de producto—, comprobando formato, peso real y comportamiento de carga mediante peticiones directas al servidor, incluyendo una petición declarando soporte de WebP en la cabecera Accept."),
  H2("Aspectos correctos"),
  bullet([new TextRun({ text: "Carga diferida parcial. ", bold: true }), new TextRun("14 de las 22 imágenes detectadas en la portada incorporan el atributo loading=\"lazy\".")]),
  bullet([new TextRun({ text: "Peso del logotipo contenido. ", bold: true }), new TextRun("El logotipo pesa 51 KB en formato PNG, un tamaño razonable que no compromete por sí solo el rendimiento.")]),
  H2("Deficiencias detectadas"),
  bullet([new TextRun({ text: "Ausencia de formatos de nueva generación (WebP / AVIF). ", bold: true }), new TextRun("El servidor entrega JPG y PNG incluso cuando la petición declara explícitamente soporte de WebP (cabecera Accept: image/webp); no se aprovechan formatos que reducirían el peso de forma sustancial sin pérdida de calidad apreciable.")]),
  bullet([new TextRun({ text: "Texto alternativo poco descriptivo en producto. ", bold: true }), new TextRun("Las imágenes de la ficha de producto revisada usan un alt basado en el nombre de archivo (por ejemplo, \"iris-10-amarilllo-min\") en lugar de una descripción del artículo, lo que limita su potencial en Google Imágenes y en accesibilidad.")]),
  bullet([new TextRun({ text: "8 de 22 imágenes de portada sin carga diferida, ", bold: true }), new TextRun("lo que puede ser correcto si corresponden a la imagen principal visible nada más cargar la página (LCP), pero conviene confirmarlo caso a caso.")]),
  H2("Lectura"),
  P("El sitio no presenta problemas graves de peso de imagen, pero desaprovecha una mejora de rendimiento y de posicionamiento en buscador de imágenes relativamente sencilla de aplicar: la conversión a formatos modernos y la mejora del texto alternativo de producto."),
  new Paragraph({ children: [new PageBreak()] }),
);

// 7. EEAT
children.push(
  H1("7. Señales E-E-A-T (Experiencia, Pericia, Autoridad y Confianza)"),
  P("Google valora las señales que demuestran que detrás de un sitio existe una entidad real, experta y fiable. El siguiente cuadro resume el estado de dichas señales en Bell Tower Spain."),
  table(
    ["Señal", "Estado", "Observación"],
    [
      ["Identidad del negocio (NAP)", E.pass, "Dirección (Julio Romero de Torres 8B, Ubrique), teléfono, correo y horario visibles en la página de contacto"],
      ["Trayectoria / experiencia", E.pass, "Comunicación de marca que sitúa el origen del negocio en 1980, coherente con la cobertura editorial externa encontrada"],
      ["Reseñas / valoraciones en el sitio", E.fail, "\"No hay valoraciones aún\" en las fichas de producto revisadas; sin integración visible de reseñas de Google u otras plataformas"],
      ["Cobertura editorial externa", E.warn, "Varias menciones en blogs y prensa digital, aunque concentradas en un número reducido de dominios de perfil similar al guest-posting"],
      ["Páginas legales", E.pass, "Política de privacidad y aviso legal presentes en ambos idiomas (con la incidencia de traducción señalada en el apartado 5)"],
      ["Autoría / conocimiento", E.warn, "Blog activo con contenido técnico sobre curtidos y cuidado del cuero, sin firma de autor ni credenciales visibles"],
    ],
    [3000, 1700, 4660]
  ),
  P([
    new TextRun({ text: "Lectura. ", bold: true, color: AZUL }),
    new TextRun("Bell Tower Spain dispone de una historia de marca genuina (fábrica familiar desde 1980 en la \"cuna de la piel\") y de un blog activo que podrían sostener un relato de experiencia y pericia sólido, pero ese relato no se apoya todavía en prueba social visible (reseñas) ni en una página \"quiénes somos\" que desarrolle la trayectoria y el equipo."),
  ]),
  new Paragraph({ children: [new PageBreak()] }),
);

// 8. GEO
children.push(
  H1("8. Visibilidad en buscadores con IA (GEO)"),
  P("Los buscadores generativos y asistentes de IA (AI Overviews de Google, ChatGPT, Perplexity) se apoyan en datos estructurados, en menciones de marca y en contenido fácilmente citable. En este terreno, Bell Tower Spain combina un activo relevante (el marcado FAQPage de portada) con carencias de base."),
  bullet([new TextRun("El marcado "), new TextRun({ text: "FAQPage", bold: true }), new TextRun(" de la página principal, con preguntas formuladas de forma natural (\"¿Dónde comprar artículos de cuero en Ubrique?\"), constituye contenido directamente citable por motores de IA, un activo que ni El Potro ni Ferpiel tienen implementado.")]),
  bullet([new TextRun({ text: "No existe un archivo llms.txt ", bold: true }), new TextRun("(la petición devuelve error 404), una práctica emergente para orientar a los rastreadores de IA sobre el contenido prioritario del sitio.")]),
  bullet([new TextRun({ text: "No hay monitorización activa de menciones en IA. ", bold: true }), new TextRun("La herramienta de seguimiento de prompts en LLMs del proyecto no registra ningún prompt trackeado a día de hoy, por lo que no puede confirmarse ni descartarse la aparición de la marca en respuestas de ChatGPT, Perplexity o AI Overviews; es, en la práctica, un punto ciego de medición más que un diagnóstico de ausencia.")]),
  bullet("La cobertura editorial externa detectada (artículos de blog y prensa digital sobre la marca) aporta señales de marca adicionales que los modelos de lenguaje pueden haber indexado durante su entrenamiento."),
  new Paragraph({ children: [new PageBreak()] }),
);

// 9. COMPETIDORES Y GAP
children.push(
  H1("9. Competidores y análisis de deficiencias (gap analysis)"),
  H2("Mapa competitivo"),
  table(
    ["Competidor", "Palabras clave posicionadas", "Tráfico estimado/mes", "Amenaza"],
    [
      ["El Potro", "101", "1.136", { text: "Muy alta", color: ROJO, bold: true }],
      ["Ferpiel", "79", "217", { text: "Alta", color: ROJO, bold: true }],
      ["Barada Bags", "30", "193", { text: "Media", color: NARANJA, bold: true }],
      ["Bell Tower Spain (objetivo)", "70", "129", { text: "—", color: GRIS, bold: true }],
    ],
    [3200, 2400, 2000, 1760]
  ),
  H2("Comparativa de elementos SEO"),
  ...img("04_matriz.png", 420, 336, "Presencia de elementos SEO clave: Bell Tower Spain frente a El Potro y Ferpiel."),
  P("El contraste es revelador: Bell Tower Spain es el único de los tres con metadescripción, Product Schema y FAQPage, pero es también el único sin reseñas de cliente visibles, y el que presenta el perfil de enlaces entrantes y el catálogo más reducidos de los tres."),
  H2("Dónde puede destacar Bell Tower Spain"),
  bullet([new TextRun({ text: "Cola larga de marca y ubicación ", bold: true }), new TextRun("(\"fabrica de bolsos en ubrique\", \"bolso tipo birkin ubrique\"), donde ya posiciona en primeras posiciones (3ª y 4ª respectivamente) y donde su base de datos estructurados le da ventaja frente a El Potro y Ferpiel.")]),
  bullet([new TextRun({ text: "Complementar el catálogo hacia carteras y billeteras de hombre, ", bold: true }), new TextRun("el clúster de mayor volumen de búsqueda hoy dominado por El Potro, en el que Bell Tower Spain no aparece.")]),
  bullet([new TextRun({ text: "Contenido de accesorios y cuidado del cuero, ", bold: true }), new TextRun("terreno hoy ocupado por Ferpiel, coherente con el blog ya existente sobre curtidos y mantenimiento.")]),
  new Paragraph({ children: [new PageBreak()] }),
);

// 10. CONTENIDO Y PROGRAMATICO
children.push(
  H1("10. Contenido y oportunidad de escala (SEO programático)"),
  P("El sitemap revela una estructura de contenido con una proporción de blog muy superior a la del catálogo: 219 entradas de blog frente a 68 fichas de producto, es decir, más de tres artículos de contenido por cada producto en venta. Es un patrón poco habitual en un e-commerce de este tamaño y refleja una apuesta de marketing de contenidos ya consolidada, sobre la que puede apoyarse el resto de la estrategia."),
  P("El aprovechamiento de esta base de contenido está condicionado por dos factores ya descritos: la canibalización de palabras clave entre la portada y las páginas de aterrizaje dedicadas, y la limpieza pendiente del catálogo indexado (el producto de prueba heredado)."),
  H2("Agrupaciones temáticas observadas"),
  bullet([new TextRun({ text: "Producto por género y tipología (transaccional): ", bold: true }), new TextRun("bolsos y carteras de mujer, maletines y mochilas de hombre, bolsos de mimbre y accesorios para instrumentos de viento.")]),
  bullet([new TextRun({ text: "Marca y ubicación (informacional/de marca): ", bold: true }), new TextRun("páginas dedicadas a \"bolsos de ubrique\", \"piel de ubrique\" y \"carteras ubrique\", hoy en competencia interna con la portada.")]),
  bullet([new TextRun({ text: "Cuidado y materiales (informacional): ", bold: true }), new TextRun("curtido al cromo vs. vegetal, cómo hidratar el cuero, tipos de bolso según la ocasión.")]),
  P("Cabe señalar además que, más allá de español e inglés, no se ha detectado expansión a otros mercados (por ejemplo, francés o alemán), pese a que el origen artesanal español es un factor diferencial reconocido en el sector del cuero en esos mercados."),
  new Paragraph({ children: [new PageBreak()] }),
);

// 11. SINTESIS
children.push(
  H1("11. Síntesis de deficiencias por nivel de impacto"),
  P("A modo de cierre, se recoge la distribución de los hallazgos del diagnóstico según su impacto potencial sobre la visibilidad del sitio. La clasificación es informativa y describe la severidad de cada carencia, sin constituir un plan de ejecución."),
  ...img("05_severidad.png", 420, 296, "Distribución de los hallazgos del diagnóstico por nivel de severidad."),
  H2("Carencias de impacto crítico"),
  bullet("Canibalización de palabras clave entre la portada y páginas de aterrizaje dedicadas, detectada en 33 clústeres de búsqueda."),
  bullet("Ausencia de reseñas o valoraciones de cliente visibles en las fichas de producto."),
  bullet("Ausencia de archivo llms.txt y de monitorización de menciones de marca en buscadores de IA."),
  bullet("Perfil de enlaces entrantes débil y concentrado en un número reducido de dominios de contenido patrocinado."),
  bullet("Brecha de contenido en el clúster de carteras y billeteras de hombre, el de mayor volumen de búsqueda entre los analizados."),
  H2("Carencias de impacto alto"),
  bullet("237 URLs con tiempos de respuesta lentos detectados en el rastreo del sitio."),
  bullet("Traducción incompleta de la política de privacidad en inglés (H1 en español)."),
  bullet("Producto de prueba heredado, indexado en la categoría genérica \"sin categorizar\"."),
  bullet("Ausencia de marcado LocalBusiness/Store con datos de geolocalización y horario."),
  bullet("Ausencia de formatos de imagen de nueva generación (WebP/AVIF) pese a que el navegador los admite."),
  bullet("Texto alternativo de imágenes de producto basado en el nombre de archivo, poco descriptivo."),
  H2("Carencias de impacto medio y bajo"),
  bullet("3 títulos, 17 clústeres de H1 y 5 metadescripciones duplicados, concentrados en la paginación del blog."),
  bullet("Brecha de contenido en accesorios y cuidado del cuero frente a Ferpiel."),
  bullet("Sin expansión declarada a mercados más allá de español e inglés."),
  bullet("BreadcrumbList sin confirmar en formato JSON-LD."),
  bullet("Cabeceras de seguridad avanzadas (HSTS, CSP) pendientes de verificación."),
  new Paragraph({ children: [new PageBreak()] }),
);

// 12. CONCLUSION
children.push(
  H1("12. Conclusión"),
  P("Bell Tower Spain parte de una base más sólida de lo habitual para un proyecto de su tamaño: una historia de marca genuina desde 1980, un blog de contenido activo y bilingüe, y una implementación de datos estructurados (Product y FAQPage) que hoy la sitúa por delante de sus dos competidores directos de Ubrique en ese terreno concreto."),
  P("El diagnóstico evidencia, sin embargo, que ese potencial no se traduce todavía en tráfico ni en autoridad: la distancia con El Potro (casi diez veces más tráfico orgánico estimado) responde sobre todo a un perfil de enlaces entrantes más débil, a la ausencia de prueba social visible y a una canibalización interna de palabras clave que dispersa la relevancia entre varias páginas del propio dominio."),
  P("Las áreas que concentran el mayor margen de mejora son tres: la resolución de la canibalización entre la portada y las páginas de aterrizaje de marca/ubicación, la incorporación de prueba social (reseñas) y de marcado LocalBusiness, y el cierre de la brecha de contenido en carteras y billeteras de hombre frente a El Potro. Sobre estos tres ejes pivota la diferencia entre el estado actual y el potencial del proyecto."),
  new Paragraph({ spacing: { before: 400 }, border: { top: { style: BorderStyle.SINGLE, size: 8, color: AZUL, space: 8 } }, children: [new TextRun({ text: "", size: 2 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200 }, children: [new TextRun({ text: "Documento elaborado por ", size: 18, color: GRIS }), new TextRun({ text: "INFO", bold: true, size: 18, color: AZUL }), new TextRun({ text: "SAMA", bold: true, size: 18, color: VERDE }), new TextRun({ text: " · Agencia SEO en Cádiz", size: 18, color: GRIS })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Para métricas exactas de tráfico, posiciones y enlaces se recomienda la conexión de Google Search Console, GA4 y una herramienta de análisis de backlinks.", size: 16, color: GRIS, italics: true })] }),
);

// ---- Build -----------------------------------------------------------------
const doc = new Document({
  creator: "Infosama",
  title: "Informe SEO integral - belltowerspain.com",
  styles: {
    default: { document: { run: { font: "Arial", size: 21, color: CARBON } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 30, bold: true, font: "Arial", color: AZUL },
        paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 0, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "A4D76C", space: 4 } } } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: CARBON },
        paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 21, bold: true, font: "Arial", color: GRIS },
        paragraph: { spacing: { before: 140, after: 80 }, outlineLevel: 2 } },
    ],
  },
  numbering: {
    config: [
      { reference: "bul", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { run: { color: AZUL }, paragraph: { indent: { left: 600, hanging: 280 } } } }] },
    ],
  },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1300, right: 1440, bottom: 1300, left: 1440 } } },
    headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD", space: 4 } }, children: [new TextRun({ text: "Informe SEO · belltowerspain.com", size: 15, color: GRIS })] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, border: { top: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD", space: 4 } }, children: [new TextRun({ text: "Infosama — Agencia SEO en Cádiz   |   Página ", size: 15, color: GRIS }), new TextRun({ children: [PageNumber.CURRENT], size: 15, color: GRIS })] })] }) },
    children,
  }],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(path.join(__dirname, "Informe-SEO-Bell-Tower-Spain.docx"), buffer);
  console.log("DOCX generado OK");
});
