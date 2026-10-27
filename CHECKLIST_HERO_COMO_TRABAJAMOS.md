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
- [x] Commit realizado.
- [x] Push realizado.
- [x] Despliegue completado.
- [x] Página pública verificada.

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
- Implementación: commit 79ddb0654365d8a955839483e4798609688156b2, mensaje Add cinematic centered hero to how we work page. Push correcto a origin/main, sin force; solo los cinco archivos del encargo.
- Despliegue de implementación correcto: https://github.com/felipeparra1607-alt/Web-consultoria-ia/actions/runs/40526992794 . Build, deploy y report-build-status completados con success.
- Página pública abierta desde el enlace real Cómo trabajamos de la navegación de Home: https://grindlaneconsulting.com/como-trabajamos/ . Imagen nueva cargada (1672 px), titular y descripción exactos, Hero igual al viewport; centrado horizontal con desviación inferior a 0.001 px y vertical inferior a 0.01 px también en dominio real. cinematic-ready activo y fotografía con animación de 1.8 s.
- Header público transparente al inicio y sticky con fondo normal rgba(243,239,231,0.94) tras scroll. Consola sin errores.
- Regresión pública: Home, Nosotros, Por qué automatizar y Soluciones conservan sus imágenes y titulares; fotografías cargadas, header transparente y sin errores de consola en las cuatro páginas.
- Evidencia pública: C:/Users/orlan/.codex/visualizations/2026/10/05/01a10c9b-d41e-7fa0-b7ad-120d96c4f084/method-hero-production.png .
- El cierre posterior del checklist modifica solo documentación, sin alterar el código ya verificado.
