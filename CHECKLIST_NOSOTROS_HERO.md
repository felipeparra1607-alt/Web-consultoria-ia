# Hero de Nosotros — checklist

26 de octubre de 2026. Alcance: primera sección de /nosotros/, imagen adjunta y reutilización del header fotográfico existente. Sin cambios de contenido en el resto de la página ni en otras páginas.

- [x] Imagen elegida instalada.
- [x] Calidad optimizada sin pérdida excesiva.
- [x] Hero a pantalla completa.
- [x] Imagen detrás del header.
- [x] Header transparente inicialmente.
- [x] Header sólido al hacer scroll.
- [x] Titular original conservado.
- [x] Párrafo original conservado.
- [x] Botón original conservado y operativo.
- [x] Fotografía bien encuadrada.
- [x] Responsive comprobado.
- [x] Resto de la página intacto.
- [x] Otras páginas intactas.
- [x] Comprobaciones superadas.
- [x] Commit realizado.
- [x] Push realizado.
- [x] Despliegue correcto.
- [x] Página publicada verificada.

## Evidencias

- Git limpio al comenzar; rama de producción main.
- Imagen adjunta conservada sin regenerar ni ampliar: 1844 × 853 px, PNG original de 2.563.046 bytes; WebP calidad 94 de 325.594 bytes, mismas dimensiones. Archivo images/grindlane-nosotros-hero.webp.
- Hero con imagen en object-fit: cover, top=0 y altura igual al viewport. Verificación visual en 1920×1080, 1366×768, 820×1180 y 390×844; sin desbordamiento horizontal. En móvil, caras libres de texto y botón dentro del primer viewport (bottom=812 en 844 px).
- Header compartido con Home: selectores CSS ampliados sin cambiar sus propiedades; mismo controlador de scroll. Nosotros solo ejecuta ese controlador y no las animaciones exclusivas de Home. Regresión de Home comprobada: fondo transparente al inicio y rgba(243,239,231,0.94) tras scroll; titular intacto.
- Header de Nosotros: fondo transparente al inicio; sticky y fondo normal tras scroll. Menú móvil abierto con fondo claro y enlaces legibles.
- Conoce al equipo: click comprobado a /nosotros/#equipo; destino visible bajo el header (top≈98 px). Sin cambios en su enlace.
- Comparación automática con HEAD: titular, párrafo y texto de botón idénticos; header HTML, footer y todo el contenido posterior al Hero idénticos. Home HTML idéntico. Ningún formulario cambiado.
- node --check experience.js y git diff --check correctos. Consola sin errores.
- Capturas locales: C:/Users/orlan/.codex/visualizations/2026/10/05/01a10c9b-d41e-7fa0-b7ad-120d96c4f084/nosotros-hero-wide.jpg y nosotros-hero-mobile.jpg.
- Commit de implementación: 68cdd4ffd30464a8503ea4d3100ca04db2984d0d, mensaje Redesign Nosotros hero with full-screen team image. Push correcto a origin/main, sin force; solo los cinco archivos de este encargo.
- Despliegue correcto del código: https://github.com/felipeparra1607-alt/Web-consultoria-ia/actions/runs/40396316136 (completed/success).
- Página verificada en navegador: https://grindlaneconsulting.com/nosotros/ . Imagen WebP nueva cargada con naturalWidth=1844; Hero top=0 y altura=720 en viewport de 720; header transparente. Titular original, párrafo y botón visibles.
- Click público a #equipo verificado: https://grindlaneconsulting.com/nosotros/#equipo . Header sticky con fondo normal rgba(243,239,231,0.94); destino visible bajo el header. Consola sin errores.
- Evidencia pública: C:/Users/orlan/.codex/visualizations/2026/10/05/01a10c9b-d41e-7fa0-b7ad-120d96c4f084/nosotros-hero-production.jpg .
- El cierre posterior del checklist modifica solo este documento; no altera el código publicado y verificado.
