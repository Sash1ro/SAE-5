\set ON_ERROR_STOP on

BEGIN;

DROP TABLE IF EXISTS history;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    image_64 TEXT NOT NULL, 
    universe_name TEXT NOT NULL,
    universe_volume FLOAT NOT NULL CHECK (universe_volume >= 0), 
    ia_confidence FLOAT NOT NULL CHECK (ia_confidence >= 0 AND ia_confidence <= 1),
    ia_similarity FLOAT NOT NULL CHECK (ia_similarity >= 0 AND ia_similarity <= 1), 
    history_result TEXT NOT NULL CHECK (history_result IN ('failed', 'success')), 
    history_type TEXT NOT NULL CHECK (history_type IN ('detection', 'contribution')), 
    created_at TIMESTAMPTZ NOT NULL DEFAULT now() 
);

COMMIT;