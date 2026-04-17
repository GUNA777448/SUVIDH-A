DROP INDEX IF EXISTS idx_payment_outbox_status_created;
DROP TABLE IF EXISTS payment_outbox_events;

DROP INDEX IF EXISTS idx_payment_intents_domain;
DROP INDEX IF EXISTS idx_payment_intents_auth_user_id;
DROP TABLE IF EXISTS payment_intents;
