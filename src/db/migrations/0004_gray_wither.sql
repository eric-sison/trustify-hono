ALTER TABLE "clients" ADD COLUMN "response_types" text[] DEFAULT ARRAY[]::text[] NOT NULL;