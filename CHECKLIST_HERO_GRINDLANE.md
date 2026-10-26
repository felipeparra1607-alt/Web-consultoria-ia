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
- [x] Commit realizado.
- [x] Push realizado.
- [x] Despliegue y dominio verificados en producción.

## Evidencias de esta revisión

- Imagen final adjunta: PNG de 1672 × 941 px y 2.352.378 bytes. WebP calidad 94, mismas dimensiones, 261.698 bytes. Sin recorte destructivo ni ampliación: images/grindlane-home-office-final.webp.
- Header inicial medido: background rgba(0,0,0,0), sin blur ni sombra; Hero top=0 y altura igual al viewport. Logo original conservado como archivo y geometría; versión blanca mediante CSS únicamente al inicio para legibilidad.
- Scroll comprobado a 337 px: header sticky, fondo normal rgba(243,239,231,0.94), clase inicial retirada. Menú móvil abierto: fondo normal y enlaces oscuros, manteniendo los enlaces existentes.
- Responsive revisado visualmente: 1920×1080, 1366×768, 820×1180 y 390×844. Sin desbordamiento horizontal ni deformación de imagen.
- CTA único dentro de #por-que-grindlane, tras el texto Seguimos a tu lado; navega a /contacto/. Eliminada la sección crema anterior y su frase; no se ha creado ninguna sección nueva.
- Validación: node --check experience.js y git diff --check sin errores. Comparación automática de Home: titular, párrafo, botones originales, header HTML, formulario y demás secciones preservados. Consola del navegador sin errores.
- Evidencias locales: C:/Users/orlan/.codex/visualizations/2026/10/05/01a10c9b-d41e-7fa0-b7ad-120d96c4f084/final-hero-wide.jpg, final-hero-mobile.jpg y final-black-cta-mobile.jpg.
- Commit de implementación: 3fb0b9aa1cacd3b1ece39a650e44c040190c5330, mensaje Refine Grindlane hero header and booking CTA. Push correcto a origin/main, sin force. Solo index.html, experience.css, experience.js, imagen final WebP y este checklist.
- Despliegue de implementación correcto: https://github.com/felipeparra1607-alt/Web-consultoria-ia/actions/runs/40387954564 . Build, deploy y report-build-status completados con success.
- Verificación pública en https://grindlaneconsulting.com/: foto final cargada (1672 px), Hero top=0 y altura=720 en viewport de 720; header transparente rgba(0,0,0,0) al inicio y normal rgba(243,239,231,0.94) tras scroll a 288 px; titular exacto; bloque crema ausente; CTA dentro de por-que-grindlane y click a https://grindlaneconsulting.com/contacto/ confirmado. Consola sin errores.
- Evidencia pública: C:/Users/orlan/.codex/visualizations/2026/10/05/01a10c9b-d41e-7fa0-b7ad-120d96c4f084/final-production-hero.jpg .
- El cierre del checklist se publica como actualización documental sin modificar el código verificado.
