CREATE TABLE IF NOT EXISTS pricing_plans (
                                             id BIGSERIAL PRIMARY KEY,
                                             plan_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price_per_hour DECIMAL(12,2) NOT NULL DEFAULT 0,
    price_per_day DECIMAL(12,2) NOT NULL DEFAULT 0,
    deposit_rate DECIMAL(5,2) NOT NULL DEFAULT 0.30,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
    );

ALTER TABLE vehicles
    ADD COLUMN IF NOT EXISTS pricing_plan_id BIGINT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_vehicles_pricing_plan'
      AND table_name = 'vehicles'
  ) THEN
ALTER TABLE vehicles
    ADD CONSTRAINT fk_vehicles_pricing_plan
        FOREIGN KEY (pricing_plan_id) REFERENCES pricing_plans(id)
            ON UPDATE NO ACTION ON DELETE SET NULL;
END IF;
END $$;

CREATE TABLE IF NOT EXISTS invoices (
                                        id BIGSERIAL PRIMARY KEY,
                                        invoice_code VARCHAR(50) NOT NULL UNIQUE,
    booking_id BIGINT NOT NULL UNIQUE,
    staff_user_id BIGINT NULL,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    extra_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
    penalty_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    final_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    payment_status VARCHAR(30) NOT NULL DEFAULT 'unpaid',
    note TEXT NULL,
    issued_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT NOW()
    );

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_invoices_booking'
      AND table_name = 'invoices'
  ) THEN
ALTER TABLE invoices
    ADD CONSTRAINT fk_invoices_booking
        FOREIGN KEY (booking_id) REFERENCES bookings(id)
            ON UPDATE NO ACTION ON DELETE RESTRICT;
END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_invoices_staff_user'
      AND table_name = 'invoices'
  ) THEN
ALTER TABLE invoices
    ADD CONSTRAINT fk_invoices_staff_user
        FOREIGN KEY (staff_user_id) REFERENCES users(id)
            ON UPDATE NO ACTION ON DELETE SET NULL;
END IF;
END $$;