CREATE TABLE `acme_v3_email_verification_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` varchar(21) NOT NULL,
	`email` varchar(255) NOT NULL,
	`code` varchar(8) NOT NULL,
	`expires_at` datetime NOT NULL,
	CONSTRAINT `acme_v3_email_verification_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `acme_v3_email_verification_codes_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `acme_v3_password_reset_tokens` (
	`id` varchar(40) NOT NULL,
	`user_id` varchar(21) NOT NULL,
	`expires_at` datetime NOT NULL,
	CONSTRAINT `acme_v3_password_reset_tokens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `acme_v3_posts` (
	`id` varchar(15) NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`title` varchar(255) NOT NULL,
	`excerpt` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`status` varchar(10) NOT NULL DEFAULT 'draft',
	`tags` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `acme_v3_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `acme_v3_sessions` (
	`id` varchar(255) NOT NULL,
	`user_id` varchar(21) NOT NULL,
	`expires_at` datetime NOT NULL,
	CONSTRAINT `acme_v3_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `acme_v3_users` (
	`id` varchar(21) NOT NULL,
	`discord_id` varchar(255),
	`email` varchar(255) NOT NULL,
	`email_verified` boolean NOT NULL DEFAULT false,
	`hashed_password` varchar(255),
	`avatar` varchar(255),
	`stripe_subscription_id` varchar(191),
	`stripe_price_id` varchar(191),
	`stripe_customer_id` varchar(191),
	`stripe_current_period_end` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `acme_v3_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `acme_v3_users_discord_id_unique` UNIQUE(`discord_id`),
	CONSTRAINT `acme_v3_users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE INDEX `user_idx` ON `acme_v3_email_verification_codes` (`user_id`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `acme_v3_email_verification_codes` (`email`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `acme_v3_password_reset_tokens` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `acme_v3_posts` (`user_id`);--> statement-breakpoint
CREATE INDEX `post_created_at_idx` ON `acme_v3_posts` (`created_at`);--> statement-breakpoint
CREATE INDEX `user_idx` ON `acme_v3_sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `acme_v3_users` (`email`);--> statement-breakpoint
CREATE INDEX `discord_idx` ON `acme_v3_users` (`discord_id`);