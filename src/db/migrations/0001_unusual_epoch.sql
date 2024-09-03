CREATE TABLE IF NOT EXISTS "users" (
	"user_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id_dk" uuid,
	"email" varchar(150) NOT NULL,
	"password" varchar NOT NULL,
	"first_name" varchar NOT NULL,
	"middle_name" varchar NOT NULL,
	"last_name" varchar NOT NULL,
	"avatar_url" text,
	"last_sign_in_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_client_id_dk_clients_client_id_fk" FOREIGN KEY ("client_id_dk") REFERENCES "public"."clients"("client_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
