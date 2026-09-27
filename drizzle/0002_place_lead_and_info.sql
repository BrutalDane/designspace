ALTER TABLE "entry_revision" ADD COLUMN "lead" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "entry_revision" ADD COLUMN "info" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
-- "Summary" is called "Lead" in the reference; carry existing text across before the old column is dropped.
UPDATE "entry_revision" SET "lead" = "summary";
