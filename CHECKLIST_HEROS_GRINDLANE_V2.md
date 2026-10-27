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
- [x] Commit realizado.
- [x] Push realizado.
- [x] Despliegue completado.
- [x] Ambas páginas verificadas en producción.
- [x] Home comprobada sin regresiones.

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
- Implementación: commit 532e26489434e224433d31387efb2b891e307e22, mensaje Enhance automation and about page hero animations. Push correcto a origin/main sin force; solo los seis archivos del encargo.
- Despliegue de implementación: https://github.com/felipeparra1607-alt/Web-consultoria-ia/actions/runs/40473750250 ; build, deploy y report-build-status completados con success.
- Verificación pública: https://grindlaneconsulting.com/por-que-automatizar/ carga grindlane-automation-hero.webp (2048 px), Hero a pantalla completa, header transparente y gl-hero-camera de 1.8 s; CTA confirmado hacia #impacto y header sólido tras scroll.
- Verificación pública: https://grindlaneconsulting.com/nosotros/ conserva grindlane-nosotros-reception.webp (1896 px), titular exacto, animación de imagen 1.8 s y revelado de líneas; CTA confirmado hacia #equipo. Consola de ambas páginas sin errores.
- Home pública verificada: fotografía grindlane-home-office-final.webp cargada, titular Automatizamos procesos. Impulsamos tu negocio., CTA /contacto/, sin las clases nuevas de animación. Header transparente al inicio y sólido/sticky tras scroll. Consola sin errores.
- Evidencias públicas: automation-v2-production.png y about-v2-production.png en la carpeta de capturas indicada arriba. Recursos CSS/JS con versión heros-v2 comprobados mediante las animaciones nuevas efectivas; sin recurrir a una copia local para afirmar publicación.
- Simulaciones de DevTools restauradas (JavaScript, media y métricas de dispositivo). El cierre posterior del checklist solo modifica documentación, sin alterar el código publicado.
