# Incidente del formulario público — 8 de noviembre de 2026

## Diagnóstico demostrado (solo lectura)

Intento comunicado por el propietario: aproximadamente 20:05 Europe/Madrid (19:05 UTC).

- /contacto/ y su script.js responden 200. FORM_ENDPOINT publicado: https://grindlane-form.felipe-parra1607.workers.dev. El script servido coincide byte por byte con el repositorio al inicio del incidente (SHA-256 83399eefa4d93cdaee432c54735b74618c2c0b950ad3ad6c0d9c680b59e9970c).
- Worker activo: 4975067d-2cb5-4cd9-a084-f5fda9500ea4, 100 %. worker.js y availability.js publicados coinciden con booking/src del repositorio Grindlane Control. workers.dev habilitado; previews deshabilitadas.
- DB sigue vinculada a grindlane_leads; AGENDA_CAPACITY_V2=enabled. Existe el binding secreto RESEND_API_KEY; no se obtuvo su valor.
- DNS del Worker público: 188.114.96.5 y 188.114.97.5. La conexión HTTPS ordinaria desde el equipo agota el tiempo antes de recibir una respuesta HTTP. También falla el dominio workers.dev administrativo; el dominio propio del panel responde 302 normalmente. No se usó el panel para enviar formularios.
- Prueba de transporte sin escrituras: el MISMO hostname público, SNI y certificado validado, conectado puntualmente a la dirección Cloudflare 104.21.48.243 observada en el DNS del panel, devuelve OPTIONS 204 con Access-Control-Allow-Origin correcto, Content-Type permitido y GET/POST/OPTIONS. GET raíz devuelve el contrato esperado «Method not allowed». curl --resolve fue una prueba transitoria, sin modificar DNS, hosts, red, certificados ni configuración del equipo.
- Conclusión: fallo de conectividad hacia las IP actuales de workers.dev en la red probada, anterior a CORS/payload/D1/Resend. No hay evidencia para atribuirlo a un ISP concreto, bloqueo concreto o incidencia mundial. No se prueba que todos los visitantes estén afectados.

## Estado del intento

Consultas SELECT agregadas en D1, ventana 19:55–20:15 de Madrid: cero leads nuevos y cero registros email_log. No se consultaron nombres, emails, mensajes ni tokens de clientes. El Dashboard del Worker mostró «No events found» en la última hora que incluía el intento; la API de observabilidad con OAuth de Wrangler devolvió 403, por lo que se utilizó la consulta existente del Dashboard, sin cambiar observabilidad.

No aparece un lead ni un correo generado por ese intento en la ventana revisada. No se repitió el envío. Desde el 6 de noviembre los registros agregados de correo existentes son cuatro envíos satisfactorios del lote ya conocido, sin nuevos errores registrados. Esto no equivale a probar ahora credenciales o entrega de Resend mediante un nuevo envío; no hay indicios de que Resend llegara a ejecutarse en el incidente.

El Worker publicado contiene validación del nombre/email/mensaje y allowlist de origen; no implementa un limitador propio de formularios con respuesta 429. No se observó HTTP 400/403/429/502 en el intento: no se alcanzó una respuesta HTTP. La UI original ocultaba todas esas diferencias con el mismo texto genérico y una invitación a repetir.

## Corrección local, sin publicar

Rama Web-consultoria-ia: codex/incidente-formulario-contacto, basada en main c7dc773. Se conserva intacta codex/booking-estado-email con 55ae9fc; su corrección independiente de presentación de emails NO forma parte de este candidato. booking.js publicado coincide con main.

- script.js: propone FORM_ENDPOINT=https://api.grindlaneconsulting.com y conserva payload/contrato. Diferencia respuesta aceptada, rechazo conocido, lead registrado sin correo confirmado y resultado incierto. No muestra respuestas internas/tokens. No reintenta automáticamente ni cambia a otro endpoint; mantiene datos y bloquea reenvíos desde el formulario si el resultado es incierto o el lead ya existe.
- reservar/booking.js: solo cambia el hostname de options y confirm al mismo dominio propuesto. Sin cambios de disponibilidad, confirmación, emails ni presentación. Dejarlo apuntando a workers.dev mantendría el fallo después de recibir el enlace.
- Las 25 páginas que comparten script.js y reservar/index.html: únicamente versiones de caché de sus scripts. Comprobación local de que el resto del HTML no cambia y que todas referencian la versión nueva.
- qa/contact-incident.test.cjs: pruebas en memoria del transporte y del manejador real de submit, con datos sintéticos y fetch interceptado. Sin llamadas productivas ni D1.
- Grindlane Control: booking/wrangler.agenda.example.jsonc, copia de la configuración actual con la única diferencia routes=[{pattern:api.grindlaneconsulting.com,custom_domain:true}]. Código del Worker, bindings, variables, compatibilidad, observabilidad, secreto requerido, cron y workers.dev conservados.

El propietario autorizó api.grindlaneconsulting.com. Antes del alta se verificó en el Dashboard DNS que no había registros y por API que no existían asociaciones incompatibles. El Custom Domain se añadió al Worker existente y se verificó con DNS normal: HTTPS válido, OPTIONS 204 con CORS correcto y GET 405 con el contrato esperado. El Worker mantiene la versión 4975067d-2cb5-4cd9-a084-f5fda9500ea4 y su configuración; no se desplegó código del Worker. Este informe registra la preparación antes del push de la web; el resultado final queda en docs/RESULTADO-DOMINIO-API-FORMULARIO.md del repositorio Grindlane Control.

## Validación realizada

19 pruebas locales del formulario aprobadas; comprobación de sintaxis de script.js y reservar/booking.js correcta. Cubren estados de correo enviados, 400, 429, 502 con lead persistido, fallo parcial de correo, 500, 403, respuestas incompletas/no JSON, red/timeout, conservación de datos y prevención de duplicados en el manejador submit. No se repitieron pruebas de agendas, onboarding o reservas. El cambio de dominio elimina la dependencia de esa ruta workers.dev, pero su conectividad efectiva solo podrá comprobarse después de activarlo.

## Publicación autorizada — registro de preparación

1. Verificar en Cloudflare DNS y Workers Domains que api.grindlaneconsulting.com está libre y pertenece a la zona activa. No sobrescribir registros existentes.
2. Añadir ese Custom Domain al MISMO Worker grindlane-form. Cloudflare gestionará el DNS y certificado correspondientes. No cambiar el DNS de la web principal ni Access/Auth0. Si se aplica mediante Wrangler, revisar y desplegar exclusivamente booking/wrangler.agenda.example.jsonc desde el entorno del proyecto que contiene Wrangler. No ejecutar migraciones.
3. Con resolución DNS normal, verificar TLS y OPTIONS desde el origen real y GET seguro. Si hay timeout, protección inesperada, configuración diferente o respuesta incierta: detenerse antes de publicar la web. No utilizar un override de IP como criterio de aceptación productiva.
4. Publicar únicamente el diff de esta rama de la web; no fusionar automáticamente la rama pendiente booking-estado-email. Volver a leer los scripts públicos y sus endpoints. No sustituir datos ni crear tokens para esta comprobación.
5. Solo si se necesita una prueba completa, solicitar autorización para UN envío con nombre claramente de prueba y un alias de correo controlado elegido por el propietario, con un lead y los dos correos previstos (interno y enlace personal). Verificar lead/email_log antes de cualquier nuevo intento. No confirmar una reserva ni limpiar con SQL.

Antes de publicar la web solo se ejecutó el alta del dominio expresamente autorizado; no hubo POST de formulario, correos nuevos, migraciones, despliegue de código del Worker ni cambios de reservas/horarios/trabajadores, Access o Auth0. Las siguientes etapas deben respetar las condiciones de parada. El propietario excluyó expresamente los envíos de prueba.

Referencia oficial: https://developers.cloudflare.com/workers/configuration/routing/ recomienda rutas o dominio propio para Workers de producción. https://developers.cloudflare.com/workers/configuration/routing/custom-domains/ describe creación automática de DNS y certificado para el Custom Domain.
