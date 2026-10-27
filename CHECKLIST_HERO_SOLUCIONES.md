# Hero de Soluciones

27 de octubre de 2026. Alcance: únicamente el Hero de /soluciones/, reutilizando el header y las animaciones existentes sin alterar otras páginas.

- [x] Imagen adjunta instalada correctamente.
- [x] Calidad máxima disponible conservada.
- [x] Hero a pantalla completa.
- [x] Imagen visible detrás del menú.
- [x] Header transparente al entrar.
- [x] Header sólido al hacer scroll.
- [x] Titular original conservado.
- [x] Párrafo original conservado.
- [x] Textos legibles sobre la fotografía.
- [x] Animación cinematográfica de fotografía.
- [x] Animación escalonada del titular.
- [x] Animación del párrafo.
- [x] Movimiento reducido respetado.
- [x] Diseño responsive comprobado.
- [x] Resto de la página intacto.
- [ ] Otras páginas sin regresiones.
- [x] Comprobaciones superadas.
- [ ] Commit realizado.
- [ ] Push realizado.
- [ ] Despliegue completado correctamente.
- [ ] Página pública verificada.

## Evidencias

- Git limpio al comenzar, rama main.
- Imagen exacta adjunta: 1672 × 941 px, PNG original de 2.066.523 bytes conservado idéntico en images/originals/grindlane-solutions-hero.png. Recurso servido: images/grindlane-solutions-hero.webp, calidad 94 y 143.922 bytes, mismas dimensiones. Sin recorte destructivo, regeneración ni ampliación.
- Hero fotográfico en cover, primera pantalla completa y contacto de las manos visible. Revisión en 1920×1080, 1440×900, 820×1180, 390×844 y 320×740: altura igual al viewport, título dentro de su ancho, párrafo dentro de la primera pantalla y sin overflow horizontal.
- Se reutilizan el header y las animaciones mediante la clase solutions-hero-page; no se duplican controladores ni se añaden dependencias. Imagen: fade y escala 1.06→1.00 en 1.8 s; título: líneas naturales de 750 ms, separadas 150 ms; párrafo posterior. Sin animaciones infinitas ni reproducción al volver arriba.
- Movimiento reducido simulado: animation=none, ready=false, foto y textos con opacity=1. JavaScript desactivado: imagen, titular y párrafo visibles; simulaciones restauradas.
- Header transparente al inicio y sticky con fondo rgba(243,239,231,0.94) al bajar a 422 px. Menú móvil abierto con fondo normal y enlaces oscuros; consola sin errores.
- Comparación contra HEAD: titular y párrafo exactos; header HTML, footer, enlaces y contenido posterior al Hero idénticos. Misma cantidad de secciones; no se añadió ningún botón porque el Hero original no tenía ninguno. HTML de Home, Nosotros, Por qué automatizar, Cómo trabajamos y Contacto idénticos.
- Validaciones: node --check experience.js y git diff --check correctos. Git diff revisado: únicamente el Hero de Soluciones, extensión de selectores compartidos con la nueva clase, imagen y checklist.
- Capturas locales en C:/Users/orlan/.codex/visualizations/2026/10/05/01a10c9b-d41e-7fa0-b7ad-120d96c4f084/: solutions-hero-wide.png, solutions-hero-mobile.png, solutions-hero-tablet.png y solutions-hero-small.png.
- Pendiente: commit, push, despliegue, dominio real y regresión pública de las páginas previas.
