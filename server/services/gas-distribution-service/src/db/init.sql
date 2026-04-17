CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gas_connection_type') THEN
		CREATE TYPE gas_connection_type AS ENUM ('domestic', 'commercial');
	END IF;

	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gas_connection_status') THEN
		CREATE TYPE gas_connection_status AS ENUM (
			'pending',
			'submitted',
			'verification',
			'approved',
			'installation_scheduled',
			'active',
			'rejected',
			'suspended',
			'closed'
		);
	END IF;

	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gas_kyc_status') THEN
		CREATE TYPE gas_kyc_status AS ENUM ('pending', 'in_review', 'verified', 'rejected');
	END IF;

	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gas_booking_status') THEN
		CREATE TYPE gas_booking_status AS ENUM (
			'placed',
			'confirmed',
			'out_for_delivery',
			'delivered',
			'cancelled'
		);
	END IF;

	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gas_payment_status') THEN
		CREATE TYPE gas_payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
	END IF;

	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gas_complaint_status') THEN
		CREATE TYPE gas_complaint_status AS ENUM (
			'open',
			'in_progress',
			'resolved',
			'escalated',
			'closed'
		);
	END IF;

	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gas_severity_level') THEN
		CREATE TYPE gas_severity_level AS ENUM ('low', 'medium', 'high', 'emergency');
	END IF;
END $$;

CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = NOW();
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS gas_user_profiles (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	auth_user_id UUID NOT NULL UNIQUE,
	full_name TEXT NOT NULL,
	mobile_number TEXT NOT NULL,
	email TEXT,
	aadhar_ref TEXT,
	profile_state TEXT NOT NULL DEFAULT 'active',
	last_synced_at TIMESTAMPTZ,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS gas_user_profiles_mobile_unique
ON gas_user_profiles (mobile_number);

CREATE INDEX IF NOT EXISTS gas_user_profiles_auth_user_id_idx
ON gas_user_profiles (auth_user_id);

CREATE TABLE IF NOT EXISTS gas_outbox_events (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	aggregate_type TEXT NOT NULL,
	aggregate_id UUID NOT NULL,
	event_type TEXT NOT NULL,
	payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
	status TEXT NOT NULL DEFAULT 'pending',
	retry_count INTEGER NOT NULL DEFAULT 0,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	published_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS gas_outbox_events_status_created_idx
ON gas_outbox_events (status, created_at DESC);

CREATE TABLE IF NOT EXISTS gas_inbox_events (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	source_service TEXT NOT NULL,
	event_key TEXT NOT NULL UNIQUE,
	event_type TEXT NOT NULL,
	payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
	processed_at TIMESTAMPTZ,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS gas_inbox_events_source_created_idx
ON gas_inbox_events (source_service, created_at DESC);

CREATE TABLE IF NOT EXISTS gas_distributors (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	distributor_code TEXT NOT NULL UNIQUE,
	name TEXT NOT NULL,
	phone TEXT,
	email TEXT,
	address_line TEXT NOT NULL,
	city TEXT NOT NULL,
	state TEXT NOT NULL,
	pincode TEXT NOT NULL,
	service_quality_score NUMERIC(4, 2) NOT NULL DEFAULT 0,
	is_active BOOLEAN NOT NULL DEFAULT TRUE,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gas_customers (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	auth_user_id UUID NOT NULL,
	user_profile_id UUID NOT NULL REFERENCES gas_user_profiles(id) ON DELETE RESTRICT,
	customer_number TEXT NOT NULL UNIQUE,
	full_name TEXT NOT NULL,
	mobile_number TEXT NOT NULL,
	email TEXT,
	address_line TEXT NOT NULL,
	pincode TEXT NOT NULL,
	state TEXT NOT NULL,
	aadhaar_ref TEXT,
	subsidy_opt_in BOOLEAN NOT NULL DEFAULT FALSE,
	default_distributor_id UUID REFERENCES gas_distributors(id) ON DELETE SET NULL,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS gas_customers_mobile_address_unique
ON gas_customers (mobile_number, lower(trim(address_line)));

CREATE UNIQUE INDEX IF NOT EXISTS gas_customers_auth_user_unique
ON gas_customers (auth_user_id);

CREATE INDEX IF NOT EXISTS gas_customers_user_profile_idx
ON gas_customers (user_profile_id);

CREATE TABLE IF NOT EXISTS gas_connections (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	customer_id UUID NOT NULL REFERENCES gas_customers(id) ON DELETE CASCADE,
	connection_type gas_connection_type NOT NULL DEFAULT 'domestic',
	distributor_id UUID REFERENCES gas_distributors(id) ON DELETE SET NULL,
	connection_status gas_connection_status NOT NULL DEFAULT 'pending',
	kyc_status gas_kyc_status NOT NULL DEFAULT 'pending',
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS gas_connections_customer_id_idx
ON gas_connections (customer_id);

CREATE INDEX IF NOT EXISTS gas_connections_status_idx
ON gas_connections (connection_status, kyc_status);

CREATE TABLE IF NOT EXISTS gas_booking_orders (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	booking_number TEXT NOT NULL UNIQUE,
	customer_id UUID NOT NULL REFERENCES gas_customers(id) ON DELETE CASCADE,
	connection_id UUID NOT NULL REFERENCES gas_connections(id) ON DELETE CASCADE,
	cylinder_type TEXT NOT NULL,
	payment_mode TEXT NOT NULL,
	payment_status gas_payment_status NOT NULL DEFAULT 'pending',
	booking_status gas_booking_status NOT NULL DEFAULT 'placed',
	expected_delivery_date DATE,
	delivered_at TIMESTAMPTZ,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS gas_booking_orders_customer_created_idx
ON gas_booking_orders (customer_id, created_at DESC);

CREATE INDEX IF NOT EXISTS gas_booking_orders_status_payment_idx
ON gas_booking_orders (booking_status, payment_status);

CREATE TABLE IF NOT EXISTS gas_complaints (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	complaint_number TEXT NOT NULL UNIQUE,
	customer_id UUID NOT NULL REFERENCES gas_customers(id) ON DELETE CASCADE,
	booking_id UUID REFERENCES gas_booking_orders(id) ON DELETE SET NULL,
	complaint_type TEXT NOT NULL,
	severity gas_severity_level NOT NULL,
	description TEXT NOT NULL,
	status gas_complaint_status NOT NULL DEFAULT 'open',
	sla_due_at TIMESTAMPTZ,
	assigned_to_user_profile_id UUID REFERENCES gas_user_profiles(id) ON DELETE SET NULL,
	resolved_at TIMESTAMPTZ,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS gas_complaints_customer_status_idx
ON gas_complaints (customer_id, status);

CREATE INDEX IF NOT EXISTS gas_complaints_sla_due_at_idx
ON gas_complaints (sla_due_at)
WHERE status IN ('open', 'in_progress', 'escalated');

CREATE TABLE IF NOT EXISTS gas_event_log (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	entity_type TEXT NOT NULL,
	entity_id UUID NOT NULL,
	event_type TEXT NOT NULL,
	actor_user_profile_id UUID REFERENCES gas_user_profiles(id) ON DELETE SET NULL,
	auth_user_id UUID,
	payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS gas_event_log_entity_idx
ON gas_event_log (entity_type, entity_id, created_at DESC);

CREATE INDEX IF NOT EXISTS gas_event_log_payload_gin_idx
ON gas_event_log USING GIN (payload_json);

DROP TRIGGER IF EXISTS gas_user_profiles_set_updated_at ON gas_user_profiles;
DROP TRIGGER IF EXISTS gas_distributors_set_updated_at ON gas_distributors;
DROP TRIGGER IF EXISTS gas_customers_set_updated_at ON gas_customers;
DROP TRIGGER IF EXISTS gas_connections_set_updated_at ON gas_connections;
DROP TRIGGER IF EXISTS gas_booking_orders_set_updated_at ON gas_booking_orders;
DROP TRIGGER IF EXISTS gas_complaints_set_updated_at ON gas_complaints;

CREATE TRIGGER gas_user_profiles_set_updated_at
BEFORE UPDATE ON gas_user_profiles
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();

CREATE TRIGGER gas_distributors_set_updated_at
BEFORE UPDATE ON gas_distributors
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();

CREATE TRIGGER gas_customers_set_updated_at
BEFORE UPDATE ON gas_customers
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();

CREATE TRIGGER gas_connections_set_updated_at
BEFORE UPDATE ON gas_connections
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();

CREATE TRIGGER gas_booking_orders_set_updated_at
BEFORE UPDATE ON gas_booking_orders
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();

CREATE TRIGGER gas_complaints_set_updated_at
BEFORE UPDATE ON gas_complaints
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_timestamp();
