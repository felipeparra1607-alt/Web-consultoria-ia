# Heroes de Grindlane V2

26 de octubre de 2026. Alcance: Hero de /por-que-automatizar/ y animaciones del Hero de /nosotros/. Se conserva la recepción actual de Nosotros, conforme a la última confirmación del usuario.

- [x] Nueva fotografía instalada en Por qué automatizar.
- [x] Calidad de imagen conservada.
- [x] Hero fotográfico a pantalla completa.
- [x] Header transparente al comienzo.
- [x] Header sólido al hacer scroll.
- [x] Titular y contenido originales conservados.
- [x] Animación de entrada del nuevo Hero.
- [x] Fotografía de Nosotros conservada.
- [x] Movimiento cinematográfico en la fotografía de Nosotros.
- [x] Titular de Nosotros animado.
- [x] Párrafo de Nosotros animado.
- [x] Botón de Nosotros animado.
- [x] Animaciones accesibles.
- [x] Responsive comprobado.
- [x] Rendimiento aceptable.
- [x] Resto de la web intacto.
- [x] Validaciones completadas.
- [ ] Commit realizado.
- [ ] Push realizado.
- [ ] Despliegue completado.
- [ ] Ambas páginas verificadas en producción.
- [ ] Home comprobada sin regresiones.

## Evidencias

- Estado inicial de Git: limpio.
- Imagen adjunta original 2048 × 768 px, PNG de 2.559.998 bytes; WebP calidad 94 de 398.198 bytes. Sin ampliación ni regeneración. Archivo images/grindlane-automation-hero.webp.
- Se conserva exactamente images/grindlane-nosotros-reception.webp y sus dimensiones; no se vuelve a la fotografía anterior de personas.
- Movimiento de imagen: fade y escala 1.06→1.00 durante 1.8 s, una sola vez; encuadre final original. Sin deriva infinita ni librerías nuevas.
- Nosotros: líneas naturales medidas al cargar, revelado de 750 ms con retrasos de 180/330/480 ms (1440 px); párrafo a 1.33 s y botón a 1.53 s. Adaptación de líneas al redimensionar sin repetir la entrada. Texto visible tras bajar y volver arriba.
- Por qué automatizar: foto cinematográfica; título en dos líneas a 180/330 ms, párrafo y CTA posteriores. Todo el contenido HTML original y destinos conservados.
- Responsive: ambas páginas medidas en 1920×1080, 1440×900, 820×1180, 390×844 y 320×740; Hero igual a altura visible en todos los casos, sin overflow horizontal y titulares dentro de su ancho. Capturas revisadas de escritorio y móvil.
- Accesibilidad: simulación de prefers-reduced-motion=reduce en ambas páginas, imagen animation=none y opacity=1; titular, párrafo y botón visibles. JavaScript desactivado mediante DevTools: todos esos elementos permanecen visibles y los enlaces conservan #impacto y #equipo. Simulaciones restauradas.
- CTA comprobados localmente: /por-que-automatizar/#impacto y /nosotros/#equipo. Header transparente al inicio y sticky con fondo normal tras scroll. Consola sin errores.
- Comparación contra HEAD: titular, descripción, CTA, navegación, footer, formularios y todo el contenido posterior al Hero intactos en ambas páginas. Home HTML e imagen actual de Nosotros idénticos byte a byte.
- Comprobaciones: node --check experience.js y git diff --check correctos; sin dependencias nuevas. Animaciones limitadas a transform y opacity; líneas medidas solo al inicio y en resize, no durante el scroll.
- Evidencias en C:/Users/orlan/.codex/visualizations/2026/10/05/01a10c9b-d41e-7fa0-b7ad-120d96c4f084/: automation-before-v2.jpg (antes), automation-v2-wide.png, about-v2-wide.png, automation-v2-mobile.png, about-v2-mobile.png, automation-v2-small.png. El estado previo de Nosotros consta también en nosotros-reception-production.jpg.
- Pendiente: publicación y verificación pública, incluida regresión de Home.
