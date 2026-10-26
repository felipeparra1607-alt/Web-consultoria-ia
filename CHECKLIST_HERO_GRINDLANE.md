# Checklist del Hero de Grindlane

Encargo: 26 de octubre de 2026. Cambios limitados a la Home y sus estilos exclusivos.

- [x] Fotografía actual conservada.
- [x] Mejor calidad de imagen disponible: inspeccionar dimensiones y buscar una fuente mayor, sin ampliar artificialmente.
- [x] Hero ocupando toda la primera pantalla, incluido el header, con imagen en cover.
- [x] Fotografía visible detrás del menú superior, sin cortes ni duplicaciones.
- [x] Header crema translúcido, legible y superpuesto; mantener sticky, logo y navegación.
- [x] Encuadre responsive correcto en escritorio, tablet y móvil, sin desbordamiento horizontal.
- [x] Titular exacto: «Automatizamos procesos. Impulsamos tu negocio.».
- [x] Párrafo y botones originales conservados, incluidos sus enlaces.
- [x] Bloque «Pide cita» añadido inmediatamente después de «Por qué Grindlane», sin texto adicional.
- [x] Botón conectado al flujo real de contacto existente.
- [x] Resto de la web, formulario y funcionalidades intactos; sin dependencias nuevas.
- [x] Comprobaciones rápidas y revisión visual superadas.
- [ ] Commit realizado únicamente con archivos del encargo y este checklist; mensaje requerido.
- [ ] Push sin force a la rama de producción.
- [ ] Despliegue automático comprobado.
- [ ] Los tres cambios verificados en https://grindlaneconsulting.com/.

## Evidencias

- Estado inicial de Git: limpio.
- Imagen conservada: `images/grindlane-home-office-sunset.webp`, 1717 × 916 px, 95.126 bytes. El PNG original adjunto tiene las mismas dimensiones (2.012.489 bytes). No hay otra fuente de esta fotografía con mayor resolución en el proyecto; no se ha reescalado ni regenerado.
- Implementación: `index.html` y reglas exclusivas de `.home-page` en `experience.css`. CTA a `/contacto/`; imagen, logo, navegación, formulario y scripts originales conservados.
- Comprobaciones locales: Hero con top=0 y altura igual al viewport en 1440×900, 820×1180, 390×844 y 320×740; sin desbordamiento horizontal. Imagen en object-fit: cover; header sticky con top=0 también tras scroll. Titular legible; foto única y continua.
- CTA: texto exacto y sin párrafos adicionales; entre #por-que-grindlane y #que-automatizamos. Click verificado hacia /contacto/, que muestra el formulario existente; no se envió el formulario.
- Validación: git diff --check y node --check en script.js y experience.js sin errores. Comparación automática de Home contra HEAD: ningún cambio fuera del titular, versión de CSS y nuevo CTA; header HTML, imagen, formulario y botones originales idénticos. Consola del navegador sin errores.
- Capturas locales en C:/Users/orlan/.codex/visualizations/2026/10/05/01a10c9b-d41e-7fa0-b7ad-120d96c4f084/: landing-full-desktop.jpg, landing-full-tablet.jpg, landing-full-mobile.jpg y landing-cta-desktop.jpg.
- Pendiente: commit, push y verificación de producción.
