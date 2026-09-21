CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE request_reason AS ENUM (
  'DAMAGED',
  'WRONG_ITEM',
  'SIZE_ISSUE',
  'NOT_AS_DESCRIBED',
  'CHANGED_MIND'
);

CREATE TYPE request_status AS ENUM (
  'OPEN',
  'IN_REVIEW',
  'APPROVED',
  'REJECTED',
  'COMPLETED'
);

CREATE TYPE request_resolution AS ENUM (
  'REFUND',
  'REPLACEMENT',
  'STORE_CREDIT'
);

CREATE SEQUENCE request_reference_seq
  START WITH 1
  INCREMENT BY 1;

CREATE TABLE requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  reference_number TEXT NOT NULL UNIQUE
    DEFAULT (
      'RD-' || LPAD(nextval('request_reference_seq')::text, 6, '0')
    ),

  customer_name TEXT NOT NULL,
  customer_contact TEXT NOT NULL,
  order_number TEXT NOT NULL,
  item TEXT NOT NULL,

  quantity INTEGER NOT NULL
    CHECK (quantity > 0),

  reason request_reason NOT NULL,

  status request_status NOT NULL DEFAULT 'OPEN',

  resolution request_resolution,

  refund_amount INTEGER,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  removed_at TIMESTAMPTZ,

  CHECK (
    (resolution = 'REFUND' AND refund_amount IS NOT NULL AND refund_amount > 0)
    OR
    (resolution IN ('REPLACEMENT', 'STORE_CREDIT') AND refund_amount IS NULL)
    OR
    (resolution IS NULL AND refund_amount IS NULL)
  )
);

CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  request_id UUID NOT NULL
    REFERENCES requests(id),

  content TEXT NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX notes_request_id_created_at_idx
  ON notes (request_id, created_at);

CREATE INDEX requests_order_number_idx
  ON requests (order_number);

CREATE UNIQUE INDEX requests_one_live_order_item_idx
  ON requests (order_number, item)
  WHERE status NOT IN ('REJECTED', 'COMPLETED');
