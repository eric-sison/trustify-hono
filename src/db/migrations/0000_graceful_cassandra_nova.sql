CREATE TABLE IF NOT EXISTS "clients" (
	"client_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_name" varchar(100) NOT NULL,
	"description" text,
	"logo_url" text,
	"client_secret" varchar(255) NOT NULL,
	"redirect_uris" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	CONSTRAINT "clients_client_name_unique" UNIQUE("client_name"),
	CONSTRAINT "clients_client_secret_unique" UNIQUE("client_secret")
);
