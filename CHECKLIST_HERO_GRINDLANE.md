# Checklist del Hero de Grindlane — ajustes finales

Encargo: 26 de octubre de 2026. Nueva imagen adjunta, header transparente al inicio y CTA dentro de la sección negra. Esta revisión sustituye los criterios del encargo anterior.

## Comprobaciones de esta revisión

- [x] Imagen final adjunta instalada correctamente.
- [x] Imagen mostrada con la máxima calidad posible, sin ampliación artificial.
- [x] Hero usando la nueva imagen.
- [x] Hero ocupando correctamente la primera pantalla.
- [x] Sin franja clara visible al inicio.
- [x] Header transparente y superpuesto al comienzo.
- [x] Header normal reaparece al hacer scroll.
- [x] Titular exacto conservado.
- [x] Párrafo y botones del Hero conservados.
- [x] Bloque crema añadido anteriormente eliminado.
- [x] No se creó ninguna nueva sección para «Pide cita».
- [x] Botón «Pide cita» añadido solo dentro de la sección negra existente.
- [x] Botón enlazado correctamente.
- [x] Resto de la web intacto.
- [x] Responsive revisado: escritorio grande, portátil, tablet y móvil.
- [x] Comprobación rápida sin errores.
- [ ] Commit realizado.
- [ ] Push realizado.
- [ ] Despliegue y dominio verificados en producción.

## Evidencias de esta revisión

- Imagen final adjunta: PNG de 1672 × 941 px y 2.352.378 bytes. WebP calidad 94, mismas dimensiones, 261.698 bytes. Sin recorte destructivo ni ampliación: images/grindlane-home-office-final.webp.
- Header inicial medido: background rgba(0,0,0,0), sin blur ni sombra; Hero top=0 y altura igual al viewport. Logo original conservado como archivo y geometría; versión blanca mediante CSS únicamente al inicio para legibilidad.
- Scroll comprobado a 337 px: header sticky, fondo normal rgba(243,239,231,0.94), clase inicial retirada. Menú móvil abierto: fondo normal y enlaces oscuros, manteniendo los enlaces existentes.
- Responsive revisado visualmente: 1920×1080, 1366×768, 820×1180 y 390×844. Sin desbordamiento horizontal ni deformación de imagen.
- CTA único dentro de #por-que-grindlane, tras el texto Seguimos a tu lado; navega a /contacto/. Eliminada la sección crema anterior y su frase; no se ha creado ninguna sección nueva.
- Validación: node --check experience.js y git diff --check sin errores. Comparación automática de Home: titular, párrafo, botones originales, header HTML, formulario y demás secciones preservados. Consola del navegador sin errores.
- Evidencias locales: C:/Users/orlan/.codex/visualizations/2026/10/05/01a10c9b-d41e-7fa0-b7ad-120d96c4f084/final-hero-wide.jpg, final-hero-mobile.jpg y final-black-cta-mobile.jpg.
- Pendiente: commit, push y comprobación del dominio público.
