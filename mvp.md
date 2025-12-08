- [x] Persistencia consolidada: repos de identidad Drizzle (cuentas, identidades, verificaciones) con JWT_SECRET/JWT_EXPIRES_IN en config y fallback a memoria en dev.
- [x] Repos WhatsApp con Drizzle y fallback a memoria en dev; eliminación de DDL en repos.
- [x] API/WS básicos (MVP una sesión): endpoints y gateway WS para sesiones (crear/estado/QR) y mensajes (send/stream/ack/history) con DTO limpio; sin lógica en controllers.
- [x] Tipos de mensaje y acks esenciales: texto + media (imagen/doc/audio/video/sticker/audio/contact/location/reaction) con S3/MinIO y metadatos en Postgres; estados pending/sent/delivered/read vía use case de status.
- [x] Eventos Baileys mínimos: `messages.upsert/update`, presence/typing básico, reconexiones con backoff/códigos; QR/connection state en WS con rate-limit.
- [x] Idempotencia y dedupe: tokens Redis para entrantes/salientes, `ON CONFLICT DO UPDATE` por keyId, y reintentos/backoff en envío/recepción.
- [x] Auth state resiliente (single sesión): restaurar Postgres→Redis al boot; watchdog de expiración/relogin; snapshots periódicos.
- [ ] Observabilidad mínima: health/readiness (Postgres/Redis/Baileys), logs estructurados, métricas básicas (mensajes, reconexiones).
- [ ] Media/storage y limpieza: URLs firmadas expuestas en DTO, políticas de retención/limpieza y expiración de objetos pendientes.
- [ ] Seguridad básica: namespacing, auth/roles en endpoints/WS, rate limits por sesión/usuario.
- [ ] CI/CD y pruebas MVP: Drizzle en pipeline, e2e de login + ciclo de mensaje (una sesión), pruebas de reconexión/dedupe.
- [ ] Orquestación multi-worker (multi-sesión): lock/lease de sesión en Redis, registro de dueño, routing de comandos, takeover en fallas.
- [ ] Outbox/cola y eventos: outbox en DB + productor Kafka/Redis Streams; cola de envíos/acks tolerante a fallas; idempotencia reforzada.
- [ ] Paridad avanzada: history sync (chats/contacts upsert/update), presence completa, tipos adicionales (reaction/quoted), llamadas si aplican.
- [ ] Seguridad/multi-tenant avanzada: namespacing por cliente, rotación de secrets, cifrado de snapshots, límites por tenant.
- [ ] Observabilidad/operación avanzada: métricas de tráfico/latencias/reintentos/reconexiones, logs con correlation IDs, alertas.
- [ ] CI/CD y pruebas avanzadas: e2e multi-sesión, pruebas de takeover/locks, estrés de reintentos y dedupe.
- [ ] Siguiente foco sugerido: Observabilidad mínima (health/readiness, métricas básicas, logs estructurados) y seguridad básica (roles/rate limits) antes de escalar a multi-sesión.

Objetivo: backend multicliente de WhatsApp con paridad funcional a WhatsApp Web, soportando múltiples sesiones concurrentes con resiliencia (locks, reintentos, snapshots), entrega en tiempo real vía API/WS, idempotencia estricta, manejo completo de eventos y medios, y observabilidad/seguridad listas para producción.
