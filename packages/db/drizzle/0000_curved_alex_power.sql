CREATE TABLE `admin_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `gift_recipients` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`gift_id` text NOT NULL,
	`recipient_name` text NOT NULL,
	`recipient_email` text NOT NULL,
	`recipient_phone` text,
	`reveal_token` text NOT NULL,
	`seed_hash` text NOT NULL,
	`is_revealed` integer DEFAULT 0 NOT NULL,
	`revealed_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `gift_recipients_reveal_token_unique` ON `gift_recipients` (`reveal_token`);--> statement-breakpoint
CREATE UNIQUE INDEX `gift_recipient_unique` ON `gift_recipients` (`gift_id`,`recipient_email`);--> statement-breakpoint
CREATE TABLE `gifts` (
	`id` text PRIMARY KEY NOT NULL,
	`game_id` text NOT NULL,
	`occasion_key` text NOT NULL,
	`message` text DEFAULT '',
	`sender_name` text NOT NULL,
	`sender_email` text NOT NULL,
	`amount_paid_cents` integer DEFAULT 0 NOT NULL,
	`stripe_session_id` text,
	`stripe_payment_status` text DEFAULT 'free' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `gifts_stripe_session_id_unique` ON `gifts` (`stripe_session_id`);--> statement-breakpoint
CREATE TABLE `lottery_games` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`game_id` text NOT NULL,
	`name` text NOT NULL,
	`main_count` integer NOT NULL,
	`main_min` integer NOT NULL,
	`main_max` integer NOT NULL,
	`bonus_count` integer DEFAULT 0 NOT NULL,
	`bonus_min` integer,
	`bonus_max` integer,
	`bonus_name` text,
	`notes` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `lottery_games_game_id_unique` ON `lottery_games` (`game_id`);--> statement-breakpoint
CREATE TABLE `message_templates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`occasion_key` text NOT NULL,
	`display_name` text NOT NULL,
	`emoji` text NOT NULL,
	`default_message` text NOT NULL,
	`greeting_html` text NOT NULL,
	`reveal_button_text` text NOT NULL,
	`gradient_colors` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `message_templates_occasion_key_unique` ON `message_templates` (`occasion_key`);--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`key` text NOT NULL,
	`value` text NOT NULL,
	`description` text,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `settings_key_unique` ON `settings` (`key`);