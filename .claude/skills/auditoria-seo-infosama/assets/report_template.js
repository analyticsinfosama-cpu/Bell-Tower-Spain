const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, LevelFormat, HeadingLevel, BorderStyle, WidthType,
  ShadingType, ImageRun, PageBreak, TableOfContents, Footer, Header,
  PageNumber, VerticalAlign,
} = require("docx");

const ASSETS = "F:\\Claude Code\\informe-assets\\";

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

// Logo Infosama en portada (usa la imagen si existe; si no, reserva textual)
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
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 300 }, children: [new TextRun({ text: "motroy.com", bold: true, size: 40, color: AZUL })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 }, children: [new TextRun({ text: "Recambios y accesorios de moto", size: 24, color: GRIS, italics: true })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Documento de diagnóstico · Análisis del estado SEO", size: 22, color: CARBON })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "Fecha de elaboración: 10 de junio de 2026", size: 20, color: GRIS })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Confidencial — preparado por Infosama", size: 18, color: GRIS, italics: true })] }),
  new Paragraph({ children: [new PageBreak()] }),
);

// AVISO METODOLOGICO + TOC
children.push(
  H1("Índice"),
  new TableOfContents("Tabla de contenidos", { hyperlink: true, headingStyleRange: "1-2" }),
  new Paragraph({ children: [new PageBreak()] }),
);

// NOTA METODOLOGICA
children.push(
  H1("Nota metodológica"),
  P("Este documento recoge un diagnóstico del estado de optimización para buscadores (SEO) del sitio web motroy.com. Su finalidad es exclusivamente informativa: describe la situación actual del proyecto, sus fortalezas, sus carencias y su posición frente a la competencia, sin entrar en la ejecución de tareas, que se aborda en un plan de trabajo independiente."),
  P([
    new TextRun({ text: "Fuentes y alcance. ", bold: true, color: AZUL }),
    new TextRun("El análisis se basa en el rastreo real del dominio (página principal, robots.txt, sitemap, fichas de producto) y en investigación competitiva del sector. No se ha dispuesto de acceso a Google Search Console, Google Analytics ni a herramientas de pago de backlinks o tráfico, por lo que determinadas métricas se presentan como estimaciones razonadas y se identifican como tales a lo largo del documento."),
  ]),
  new Paragraph({ children: [new PageBreak()] }),
);

// 1. RESUMEN EJECUTIVO
children.push(
  H1("1. Resumen ejecutivo"),
  P("Motroy es una tienda online joven y de tamaño reducido especializada en recambios y accesorios de moto, construida sobre la plataforma PrestaShop y ubicada físicamente en Ubrique (Cádiz). Resulta significativo que su sede coincida con la localidad de Ubricarmotos, el referente histórico del sector en la zona, con más de 3.300 reseñas y actividad desde 1975."),
  P("El proyecto presenta una base funcional correcta (HTTPS operativo, descripciones de producto de calidad media, migas de pan, robots.txt estándar y sitemap funcional), pero arrastra carencias relevantes que limitan de forma notable su capacidad de posicionamiento: ausencia total de datos estructurados, falta de meta descripciones, slugs de demostración heredados en las URLs de productos reales, duplicación de direcciones y un sitemap no declarado en el archivo robots.txt."),
  H2("Puntuación SEO global"),
  ...img("01_gauge.png", 300, 241, "Puntuación SEO global estimada: 42 sobre 100."),
  P("La puntuación global de 42/100 sitúa al proyecto en una fase inicial: con fundamentos técnicos presentes pero infrautilizados y una autoridad de marca todavía muy baja."),
  ...img("02_categorias.png", 540, 272, "Desglose del diagnóstico por área SEO (0-100)."),
);

// Tabla resumen de areas
children.push(
  H2("Síntesis por áreas"),
  table(
    ["Área", "Estado", "Valoración"],
    [
      ["Autoridad de dominio", E.fail, "12/100 — dominio nuevo, sin perfil de enlaces relevante"],
      ["Técnico (rastreo/indexación)", E.warn, "58/100 — base PrestaShop correcta con fugas de indexación"],
      ["Datos estructurados", E.fail, "10/100 — sin JSON-LD en ningún tipo de página"],
      ["Contenido / E-E-A-T", E.warn, "45/100 — fichas decentes, sin señales de confianza"],
      ["Visibilidad en IA (GEO)", E.fail, "20/100 — marca prácticamente invisible para los motores de IA"],
      ["E-commerce / Shopping", E.fail, "25/100 — sin Product Schema, sin resultados enriquecidos"],
      ["On-page (titles/meta)", E.fail, "30/100 — títulos genéricos y sin meta descripción"],
      ["Competitividad", E.fail, "15/100 — brecha amplia frente a los competidores"],
    ],
    [3400, 1800, 4160]
  ),
  new Paragraph({ children: [new PageBreak()] }),
);

// 2. AUTORIDAD
children.push(
  H1("2. Autoridad del proyecto"),
  P("La autoridad de un dominio refleja la confianza acumulada a ojos de los buscadores, fruto principalmente de su antigüedad, su perfil de enlaces entrantes y su reconocimiento de marca. En el caso de Motroy, las señales observadas apuntan a una autoridad muy baja."),
  H2("Observaciones"),
  bullet([new TextRun({ text: "Dominio: ", bold: true }), new TextRun("sin indicios de antigüedad consolidada ni de un perfil de enlaces estable. La indexación es muy limitada (la consulta site:motroy.com devuelve apenas un puñado de direcciones).")]),
  bullet([new TextRun({ text: "Marca: ", bold: true }), new TextRun("escasa notoriedad en buscadores. Al buscar la marca junto a la localidad, los resultados quedan dominados por Ubricarmotos, que acapara la intención de marca local.")]),
  bullet([new TextRun({ text: "Enlaces entrantes (estimación): ", bold: true }), new TextRun("perfil prácticamente inexistente, sin menciones detectadas en directorios sectoriales, prensa de moto ni foros.")]),
  H2("Posición competitiva"),
  P("El proyecto afronta dos frentes desfavorables de forma simultánea. En el plano local, Ubricarmotos cuenta con cinco décadas de trayectoria, más de 3.300 reseñas y su propio comercio electrónico desde 2014. En el plano nacional, operan actores de gran tamaño como Motocard (más de 25.000 productos), Motardinn (grupo Tradeinn), XLMoto (la mayor de Europa) o Motos Garrido (más de 60 años de historia)."),
  ...img("03_autoridad.png", 540, 263, "Autoridad de dominio estimada de Motroy frente a sus competidores (escala 0-100)."),
  P([
    new TextRun({ text: "Lectura. ", bold: true, color: AZUL }),
    new TextRun("La distancia con respecto a los grandes operadores en términos de autoridad hace inviable, a corto plazo, competir por las búsquedas genéricas de mayor volumen. El terreno favorable se encuentra en la búsqueda de cola larga y de nicho por modelo de moto, donde los grandes son menos precisos."),
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
      ["Rastreabilidad", E.warn, "65/100"],
      ["Indexabilidad", E.fail, "45/100"],
      ["Seguridad", E.warn, "70/100"],
      ["Estructura de URL", E.warn, "60/100"],
      ["Optimización móvil", E.pass, "80/100"],
      ["Core Web Vitals", E.nd, "Sin datos de campo (CrUX)"],
      ["Datos estructurados", E.fail, "10/100"],
      ["Renderizado JavaScript", E.pass, "85/100"],
      ["Protocolo IndexNow", E.fail, "No implementado"],
    ],
    [3600, 1800, 3960]
  ),
  H2("Rastreabilidad"),
  P("El archivo robots.txt es el estándar de PrestaShop y bloquea adecuadamente carrito, proceso de compra, cuenta de usuario, búsqueda interna, parámetros de filtrado y directorios de sistema. Se observan, no obstante, dos circunstancias: el sitemap no figura declarado dentro del robots.txt, y la dirección habitual /sitemap.xml devuelve un error 404, ya que el índice válido reside en una ruta no convencional (/1_index_sitemap.xml)."),
  H2("Indexabilidad — el área más sensible"),
  P("Es el punto más delicado del diagnóstico. Se han detectado dos problemas de calidad de indexación:"),
  bullet([new TextRun({ text: "Slugs de demostración heredados en URLs de productos reales. ", bold: true }), new TextRun("Numerosas fichas de producto reales (baterías, pastillas de freno, etc.) conservan en su dirección el slug de los productos de muestra originales de PrestaShop —«mug-the-adventure-begins», «the-best-is-yet-to-come-framed-poster»—. El producto que se muestra es legítimo, pero la URL no se regeneró al editarlo, de modo que la dirección no guarda relación con el contenido. Esto debilita la relevancia (palabra clave en la URL), perjudica el porcentaje de clics y proyecta una imagen poco profesional.")]),
  bullet([new TextRun({ text: "Duplicación por multicategoría. ", bold: true }), new TextRun("Un mismo producto aparece bajo varias rutas distintas (por ejemplo, bajo «baterías», «maletas superiores» o «inicio»), lo que, sin una canonicalización consistente, diluye la autoridad y multiplica el contenido duplicado.")]),
  ...img("06_sitemap.png", 460, 286, "Composición estimada del sitemap: una parte relevante de las URLs presenta un slug de demostración heredado o está duplicada."),
  H2("Seguridad"),
  P("El sitio sirve correctamente bajo HTTPS y no se aprecia contenido mixto. No se ha podido verificar la presencia de cabeceras de seguridad avanzadas (HSTS, CSP, X-Content-Type-Options, Referrer-Policy), cuyo estado queda como punto a contrastar."),
  H2("Estructura de URL"),
  P("Las direcciones son legibles y descriptivas, con el patrón habitual de PrestaShop. El esquema «modelo-de-moto / producto», sin embargo, es el origen de la duplicación señalada al permitir que un mismo artículo cuelgue de múltiples rutas."),
  H2("Optimización móvil y renderizado"),
  P("La página incorpora la etiqueta viewport y responde a un diseño adaptable, en línea con la indexación mobile-first. Al tratarse de PrestaShop, el contenido se sirve renderizado desde el servidor, por lo que es plenamente indexable sin depender de JavaScript."),
  H2("Core Web Vitals"),
  P("No se dispone de datos de campo (CrUX), algo habitual en sitios con poco tráfico. La evaluación de las métricas de experiencia (LCP, INP y CLS) queda pendiente de una medición con datos reales."),
  new Paragraph({ children: [new PageBreak()] }),
);

// 4. DATOS ESTRUCTURADOS
children.push(
  H1("4. Datos estructurados (Schema.org)"),
  P("Los datos estructurados son el lenguaje que permite a los buscadores y a los asistentes de IA comprender con precisión el contenido de una página (qué es un producto, su precio, su disponibilidad, su marca). En un comercio electrónico, son determinantes para optar a resultados enriquecidos."),
  P([
    new TextRun({ text: "Hallazgo principal: ", bold: true, color: ROJO }),
    new TextRun("no se ha detectado ningún marcado JSON-LD en el sitio, ni en la página principal ni en las fichas de producto. Para una tienda online, esta ausencia representa una de las mayores oportunidades sin explotar."),
  ]),
  P("Entre los tipos de marcado ausentes que tendrían mayor relevancia para este proyecto se encuentran:"),
  bullet([new TextRun({ text: "Product", bold: true }), new TextRun(" (con precio, divisa, disponibilidad, marca y referencia), base para los resultados enriquecidos de precio y stock. Resulta llamativo que estos datos ya son visibles en la página, pero no están marcados.")]),
  bullet([new TextRun({ text: "BreadcrumbList", bold: true }), new TextRun(", pese a que las migas de pan ya existen de forma visual.")]),
  bullet([new TextRun({ text: "Organization y LocalBusiness", bold: true }), new TextRun(", que reforzarían la identidad del negocio y su SEO local con los datos de contacto de Ubrique.")]),
  bullet([new TextRun({ text: "AggregateRating / Review", bold: true }), new TextRun(", condicionado a la existencia de reseñas reales, hoy inexistentes.")]),
  new Paragraph({ children: [new PageBreak()] }),
);

// 5. ON-PAGE Y CONTENIDO
children.push(
  H1("5. Optimización on-page y contenido"),
  H2("Fortalezas detectadas"),
  bullet("Las descripciones de producto rondan las 280-320 palabras e incluyen beneficios, aplicaciones y modo de uso, por encima de muchas fichas que se limitan a replicar la información del fabricante."),
  bullet("Las migas de pan y el encabezado principal (H1) coinciden con el nombre del producto, de forma correcta."),
  bullet("El precio, el descuento y el estado de stock se muestran con claridad."),
  H2("Carencias detectadas"),
  bullet([new TextRun({ text: "Título de la página principal genérico", bold: true }), new TextRun(" («Motroy recambios y accesorios»), sin palabras clave ni propuesta de valor.")]),
  bullet([new TextRun({ text: "Ausencia de meta descripciones", bold: true }), new TextRun(", lo que deja en manos del buscador la generación del fragmento que se muestra en los resultados, en detrimento del porcentaje de clics.")]),
  bullet([new TextRun({ text: "Ausencia de etiquetas Open Graph", bold: true }), new TextRun(", por lo que al compartir las páginas en redes o mensajería no se genera una tarjeta enriquecida.")]),
  bullet([new TextRun({ text: "Canonical no confirmado", bold: true }), new TextRun(" en las fichas, aspecto relevante dada la duplicación por multicategoría.")]),
  new Paragraph({ children: [new PageBreak()] }),
);

// 6. IMAGENES
children.push(
  H1("6. Optimización de imágenes"),
  P("Las imágenes influyen tanto en el SEO (a través del texto alternativo, el nombre de archivo y su indexación en Google Imágenes) como en el rendimiento de la página (su peso afecta directamente a la velocidad de carga y a las métricas de experiencia). Se ha realizado una revisión de una muestra representativa de imágenes del sitio —logotipo, banners promocionales y fichas de producto—, comprobando su formato, peso real, texto alternativo y nomenclatura mediante peticiones directas al servidor."),
  H2("Aspectos correctos"),
  bullet([new TextRun({ text: "Texto alternativo descriptivo en las fichas de producto. ", bold: true }), new TextRun("Las imágenes de producto incorporan un atributo alt que coincide con el nombre del artículo (por ejemplo, «Refrigerante Castrol Coolant 1L»), buena práctica tanto para accesibilidad como para el posicionamiento en Google Imágenes.")]),
  bullet([new TextRun({ text: "Nombres de archivo optimizados. ", bold: true }), new TextRun("Los archivos de producto utilizan nombres descriptivos, separados por guiones y ricos en palabras clave (por ejemplo, filtro-de-aceite-bmw-r1250-gs-2019-2024-hiflofiltro-hf160.jpg), lo que refuerza la relevancia temática.")]),
  bullet([new TextRun({ text: "Peso contenido en las imágenes de producto. ", bold: true }), new TextRun("Los archivos de catálogo presentan un peso razonable (entre 11 y 40 KB según el tamaño), por lo que no suponen un problema de rendimiento.")]),
  H2("Deficiencias detectadas"),
  bullet([new TextRun({ text: "Logotipo con un peso desproporcionado. ", bold: true }), new TextRun("El logo se sirve como PNG de aproximadamente 917 KB (cerca de 1 MB) y se carga en todas las páginas del sitio. Es, con diferencia, el activo de imagen más pesado detectado y penaliza la velocidad de carga, especialmente en dispositivos móviles y conexiones lentas, repercutiendo en la métrica de experiencia LCP.")]),
  bullet([new TextRun({ text: "Ausencia de formatos de nueva generación (WebP / AVIF). ", bold: true }), new TextRun("El servidor entrega los archivos en JPEG y PNG incluso cuando el navegador declara explícitamente que admite WebP. No se aprovechan los formatos modernos, que reducen el peso de forma sustancial sin pérdida de calidad apreciable.")]),
  bullet([new TextRun({ text: "Ausencia de imágenes adaptativas (responsive). ", bold: true }), new TextRun("No se utiliza el atributo srcset, de modo que se entrega el mismo archivo a todos los dispositivos en lugar de servir una versión ajustada al tamaño real de pantalla.")]),
  bullet([new TextRun({ text: "Sin carga diferida (lazy loading). ", bold: true }), new TextRun("No se ha detectado el atributo loading=\"lazy\" en la maquetación, lo que implica que las imágenes situadas fuera de la pantalla inicial también se descargan de inmediato.")]),
  bullet([new TextRun({ text: "Iconos y banners en formato PNG. ", bold: true }), new TextRun("Los elementos promocionales (envío gratis, click&collect, etc.) y el propio logotipo emplean PNG, cuando para gráficos planos e iconografía el formato SVG ofrece mejor calidad y menor peso.")]),
  bullet([new TextRun({ text: "Slider con texto alternativo genérico. ", bold: true }), new TextRun("Las diapositivas del carrusel principal usan un alt genérico del tipo «Slide 1» / «Slide 2», sin valor descriptivo.")]),
  bullet([new TextRun({ text: "Nombre de archivo del logotipo no descriptivo. ", bold: true }), new TextRun("El logotipo se sirve bajo un nombre numérico (1764678394.png) que no aporta contexto semántico.")]),
  H2("Muestra auditada"),
  table(
    ["Imagen", "Formato", "Peso real", "Texto alternativo", "Nombre de archivo"],
    [
      ["Logotipo (todas las páginas)", "PNG", { text: "~917 KB", color: ROJO, bold: true }, "Correcto", "No descriptivo (numérico)"],
      ["Banner «Envío gratis»", "PNG", "~24 KB", "Correcto", "Descriptivo"],
      ["Producto — tamaño medio", "JPG", "~18 KB", "Descriptivo", "Descriptivo"],
      ["Producto — tamaño grande", "JPG", "~40 KB", "Descriptivo", "Descriptivo"],
      ["Producto — miniatura", "JPG", "~11 KB", "Descriptivo", "Descriptivo"],
    ],
    [2600, 1200, 1300, 2360, 1900]
  ),
  ...img("07_imagenes.png", 540, 277, "Comparativa de peso de las imágenes: el logotipo (~917 KB) supera en más de veinte veces a la mayor imagen de producto y se carga en todas las páginas del sitio."),
  H2("Lectura"),
  P([
    new TextRun({ text: "La base de imágenes de producto está razonablemente cuidada ", }),
    new TextRun("—con buen texto alternativo, nombres de archivo optimizados y un peso adecuado—, lo que constituye una fortaleza poco habitual. El margen de mejora se concentra en dos frentes: el peso del logotipo, que lastra el rendimiento de todo el sitio, y la falta de técnicas modernas de entrega de imágenes (formatos de nueva generación, imágenes adaptativas y carga diferida), cuya ausencia limita la velocidad de carga y la puntuación en las métricas de experiencia."),
  ]),
  new Paragraph({ children: [new PageBreak()] }),
);

// 7. EEAT
children.push(
  H1("7. Señales E-E-A-T (Experiencia, Pericia, Autoridad y Confianza)"),
  P("Google valora las señales que demuestran que detrás de un sitio existe una entidad real, experta y fiable. El siguiente cuadro resume el estado de dichas señales en Motroy."),
  table(
    ["Señal", "Estado", "Observación"],
    [
      ["Identidad del negocio (NAP)", E.pass, "Dirección, teléfonos, correo y horario visibles en la página principal"],
      ["Página «Quiénes somos»", E.warn, "Existe en /content/4-sobre-nosotros, pero breve (~150 palabras): cita +10 años de experiencia y personal especializado, sin historia ni equipo"],
      ["Reseñas / valoraciones", E.fail, "«No hay reseñas»; sin prueba social frente a los 3.300 de la competencia"],
      ["Páginas legales", E.warn, "Existen aviso legal (con identificación fiscal), cookies y términos; falta privacidad RGPD independiente y devoluciones/desistimiento"],
      ["Señales de garantía", E.warn, "Mensajes de envío gratis, igualación de precio y click&collect, sin sellos externos"],
      ["Autoría / conocimiento", E.fail, "Sin blog ni contenido que evidencie conocimiento técnico"],
    ],
    [3000, 1700, 4660]
  ),
  P([
    new TextRun({ text: "Lectura. ", bold: true, color: AZUL }),
    new TextRun("El sitio cuenta con una página «Sobre nosotros» que menciona más de diez años de experiencia y personal especializado, pero resulta breve y no desarrolla la historia del negocio ni a su equipo, desaprovechando parte de su potencial como palanca de experiencia y confianza."),
  ]),
  new Paragraph({ children: [new PageBreak()] }),
);

// 7. GEO
children.push(
  H1("8. Visibilidad en buscadores con IA (GEO)"),
  P("Los buscadores generativos y asistentes de IA (AI Overviews de Google, ChatGPT, Perplexity) se apoyan en datos estructurados, en menciones de marca y en contenido fácilmente citable. En este terreno, Motroy presenta una visibilidad muy débil."),
  bullet("La ausencia de datos estructurados impide que los modelos de IA extraigan con fiabilidad información de producto, precio o marca."),
  bullet("No existe un archivo llms.txt (devuelve error 404)."),
  bullet("La escasez de menciones externas hace que la marca sea, en la práctica, desconocida para los modelos."),
  bullet([new TextRun("En el lado positivo, el robots.txt no bloquea los rastreadores de IA (GPTBot, ClaudeBot, PerplexityBot), lo que "), new TextRun({ text: "favorece", bold: true }), new TextRun(" su futura visibilidad en estos sistemas.")]),
  new Paragraph({ children: [new PageBreak()] }),
);

// 8. COMPETIDORES Y GAP
children.push(
  H1("9. Competidores y análisis de deficiencias (gap analysis)"),
  H2("Mapa competitivo"),
  table(
    ["Competidor", "Tipo", "Fortaleza", "Amenaza"],
    [
      ["Ubricarmotos", "Local (Ubrique)", "50 años, 3.300 reseñas, marca local", { text: "Muy alta", color: ROJO, bold: true }],
      ["Motocard", "Nacional", "+25.000 productos, marca líder", { text: "Alta", color: ROJO, bold: true }],
      ["Motardinn (Tradeinn)", "Nacional / UE", "Precio, logística, dominio fuerte", { text: "Alta", color: ROJO, bold: true }],
      ["XLMoto", "Europeo", "La mayor tienda de Europa", { text: "Media", color: NARANJA, bold: true }],
      ["Motos Garrido", "Nacional", "Catálogo y antigüedad (+60 años)", { text: "Media", color: NARANJA, bold: true }],
    ],
    [2500, 1900, 3360, 1600]
  ),
  H2("Comparativa de elementos SEO"),
  ...img("04_matriz.png", 420, 320, "Presencia de elementos SEO clave: Motroy frente a la competencia."),
  H2("Dónde puede destacar Motroy"),
  bullet([new TextRun({ text: "Recambios por modelo concreto", bold: true }), new TextRun(" (cola larga, por ejemplo «filtro aceite BMW K1200 GT HF163»), donde la competencia genérica es menos precisa y donde el sitio ya está parcialmente posicionado.")]),
  bullet([new TextRun({ text: "SEO local en Cádiz y la Sierra", bold: true }), new TextRun(", como complemento al comercio electrónico, apoyándose en el taller físico y el click&collect.")]),
  bullet([new TextRun({ text: "Especialización trail / adventure", bold: true }), new TextRun(" (modelos R1300GS, F900GS o Valico 900 DSX presentes en su estructura), un nicho premium con margen.")]),
  new Paragraph({ children: [new PageBreak()] }),
);

// 9. CONTENIDO Y PROGRAMATICO (informativo)
children.push(
  H1("10. Contenido y oportunidad de escala (SEO programático)"),
  P("El sitio ya presenta el patrón idóneo para una estrategia de páginas a escala: la combinación «modelo de moto / recambio». Bien gobernada, esta estructura podría generar un volumen amplio de páginas de alto valor orientadas a búsquedas de cola larga, segmentadas por marca, modelo y año."),
  P("Conviene señalar, no obstante, que el aprovechamiento de esta oportunidad está condicionado por las carencias de indexabilidad ya descritas: los slugs de demostración heredados en las URLs y la duplicación de direcciones restan calidad al conjunto y deben considerarse al valorar cualquier escalado."),
  H2("Agrupaciones temáticas observadas"),
  bullet([new TextRun({ text: "Recambios por modelo (transaccional): ", bold: true }), new TextRun("filtros, pastillas, aceite o baterías asociados a cada modelo concreto.")]),
  bullet([new TextRun({ text: "Mantenimiento y guías (informacional): ", bold: true }), new TextRun("dudas frecuentes como la frecuencia de cambio de aceite o la elección de refrigerante o intercomunicador.")]),
  bullet([new TextRun({ text: "Equipación trail/adventure (comercial): ", bold: true }), new TextRun("comparativas de maletas y accesorios para los modelos de aventura.")]),
  new Paragraph({ children: [new PageBreak()] }),
);

// 10. SINTESIS DE DEFICIENCIAS POR IMPACTO
children.push(
  H1("11. Síntesis de deficiencias por nivel de impacto"),
  P("A modo de cierre, se recoge la distribución de los hallazgos del diagnóstico según su impacto potencial sobre la visibilidad del sitio. La clasificación es informativa y describe la severidad de cada carencia, sin constituir un plan de ejecución."),
  ...img("05_severidad.png", 420, 286, "Distribución de los hallazgos del diagnóstico por nivel de severidad."),
  H2("Carencias de impacto crítico"),
  bullet("Slugs de demostración heredados en las URLs de productos reales (direcciones que no corresponden al contenido)."),
  bullet("Ausencia total de datos estructurados de producto."),
  bullet("Duplicación de direcciones por multicategoría sin canonicalización consistente."),
  bullet("Ausencia de meta descripciones en las páginas principales."),
  bullet("Sitemap no declarado en robots.txt y dirección /sitemap.xml inexistente (404)."),
  H2("Carencias de impacto alto"),
  bullet("Ausencia de marcado Organization, LocalBusiness y BreadcrumbList."),
  bullet("Título de la página principal genérico y poco optimizado."),
  bullet("Ausencia de etiquetas Open Graph para compartir en redes."),
  bullet("Falta de una página «Quiénes somos» que refleje la experiencia del taller."),
  bullet("Perfil de enlaces entrantes prácticamente inexistente."),
  bullet("Métricas de experiencia (Core Web Vitals) sin medición con datos reales."),
  H2("Carencias de impacto medio y bajo"),
  bullet("Ausencia de reseñas verificadas y de valoraciones de producto."),
  bullet("Ausencia de blog o contenido que demuestre conocimiento técnico."),
  bullet("Páginas de categoría sin texto introductorio optimizado."),
  bullet("Protocolo IndexNow no implementado y archivo llms.txt inexistente."),
  bullet("Cabeceras de seguridad avanzadas pendientes de verificación."),
  new Paragraph({ children: [new PageBreak()] }),
);

// 11. CONCLUSION
children.push(
  H1("12. Conclusión"),
  P("Motroy parte de una base de producto sólida —descripciones cuidadas, datos de precio y stock disponibles y un taller físico real en Ubrique— pero con un potencial SEO claramente infrautilizado que, en su estado actual, limita su capacidad de competir."),
  P("El diagnóstico evidencia que el proyecto no se encuentra hoy en condiciones de disputar de frente las búsquedas genéricas a su competidor local ni a los grandes operadores nacionales. Su recorrido natural se sitúa en la cola larga por modelo de moto, un terreno donde su estructura actual ya muestra señales favorables y donde la competencia es menos precisa."),
  P("Las áreas que concentran el mayor margen de mejora son tres: la limpieza y saneamiento de la indexación, la incorporación de datos estructurados de producto y el aprovechamiento ordenado de la estructura por modelo de moto. Sobre estos tres ejes pivota la diferencia entre el estado actual y el potencial del proyecto."),
  new Paragraph({ spacing: { before: 400 }, border: { top: { style: BorderStyle.SINGLE, size: 8, color: AZUL, space: 8 } }, children: [new TextRun({ text: "", size: 2 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200 }, children: [new TextRun({ text: "Documento elaborado por ", size: 18, color: GRIS }), new TextRun({ text: "INFO", bold: true, size: 18, color: AZUL }), new TextRun({ text: "SAMA", bold: true, size: 18, color: VERDE }), new TextRun({ text: " · Agencia SEO en Cádiz", size: 18, color: GRIS })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Para métricas exactas de tráfico, posiciones y enlaces se recomienda la conexión de Google Search Console, GA4 y una herramienta de análisis de backlinks.", size: 16, color: GRIS, italics: true })] }),
);

// ---- Build -----------------------------------------------------------------
const doc = new Document({
  creator: "Infosama",
  title: "Informe SEO integral - motroy.com",
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
    headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD", space: 4 } }, children: [new TextRun({ text: "Informe SEO · motroy.com", size: 15, color: GRIS })] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, border: { top: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD", space: 4 } }, children: [new TextRun({ text: "Infosama — Agencia SEO en Cádiz   |   Página ", size: 15, color: GRIS }), new TextRun({ children: [PageNumber.CURRENT], size: 15, color: GRIS })] })] }) },
    children,
  }],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync("F:\\Claude Code\\Informe-SEO-Motroy.docx", buffer);
  console.log("DOCX generado OK");
});
