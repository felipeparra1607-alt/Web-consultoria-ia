# Hero de Cómo trabajamos

27 de octubre de 2026. Alcance: únicamente el Hero de /como-trabajamos/, con textos originales centrados y fotografía adjunta. Reutilización del header y animaciones existentes sin alterar otras páginas.

- [x] Imagen adjunta instalada.
- [x] Calidad original conservada.
- [x] Hero a pantalla completa.
- [x] Header transparente al inicio.
- [x] Header sólido al hacer scroll.
- [x] Titular EXACTAMENTE centrado.
- [x] Descripción centrada debajo.
- [x] Textos originales conservados.
- [x] Animación cinematográfica de imagen.
- [x] Animación de titular.
- [x] Animación de descripción.
- [x] Responsive correcto.
- [x] Accesibilidad y movimiento reducido.
- [x] Resto de la web intacto.
- [x] Comprobaciones superadas.
- [ ] Commit realizado.
- [ ] Push realizado.
- [ ] Despliegue completado.
- [ ] Página pública verificada.

## Evidencias

- Git limpio al comenzar; rama de producción main.
- Imagen exacta adjunta: 1672 × 941 px, PNG de 2.401.556 bytes. WebP calidad 94 de 261.766 bytes, mismas dimensiones; sin ampliación ni regeneración. Archivo images/grindlane-method-hero.webp.
- Centrado medido en 1920×1080, 1440×900, 820×1180, 390×844 y 320×740: desviación horizontal del titular y párrafo inferior a 0.001 px; centro vertical del conjunto inferior a 0.01 px de desviación. Text-align: center y márgenes automáticos. Hero de altura igual al viewport en los cinco tamaños; sin overflow horizontal ni recortes de texto; sin solapamiento con el header.
- Fotografía en cover y encuadre específico para tablet/móvil; degradado radial central y vertical para lectura sin sustituir la escena. Capturas revisadas de monitor, tablet y móviles.
- Animación reutilizada: fotografía con fade y escala 1.06→1.00 en 1.8 s; líneas del titular a 180/330/480 ms, duración 750 ms; párrafo posterior. Una sola entrada, sin bucles ni librerías nuevas; no se añadió CTA porque el Hero original no tenía uno.
- Movimiento reducido simulado: animation=none, imagen y textos con opacity=1. JavaScript desactivado: fotografía, titular y descripción visibles y centrados. Emulaciones restauradas.
- Header transparente al inicio, sticky con fondo rgba(243,239,231,0.94) tras scroll. Menú móvil abierto con fondo normal. Consola sin errores.
- Comparación automática con HEAD: textos exactos del Hero, enlaces, navegación, footer y todo el contenido posterior al Hero intactos. Misma cantidad de secciones. Home, Nosotros, Por qué automatizar, Soluciones y Contacto con HTML idéntico.
- Validaciones: node --check experience.js y git diff --check correctos. Git diff revisado: únicamente nuevo Hero y extensión de selectores/controlador compartidos mediante la clase method-hero-page.
- Evidencias locales en C:/Users/orlan/.codex/visualizations/2026/10/05/01a10c9b-d41e-7fa0-b7ad-120d96c4f084/: method-hero-wide.png, method-hero-mobile.png, method-hero-tablet.png y method-hero-small.png.
- Pendiente: commit, push, despliegue, verificación pública desde el menú y regresión pública de otras páginas.
