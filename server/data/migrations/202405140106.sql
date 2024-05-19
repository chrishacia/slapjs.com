CREATE TABLE `one_time_view_log` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `userId` INT NOT NULL,
  `viewId` INT NOT NULL,
  `viewed_ts` DATETIME NOT NULL,
  PRIMARY KEY (`id`));


CREATE TABLE `one_time_view` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `viewKey` VARCHAR(100) NULL,
  `viewValue` VARCHAR(500) NULL,
  `viewDesc` VARCHAR(500) NULL,
  PRIMARY KEY (`id`));

CREATE TABLE `user_jwt_refresh` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` VARCHAR(255) NOT NULL,
  `refresh_token` TEXT
);

ALTER TABLE `user_information`
DROP COLUMN `last_name`,
CHANGE COLUMN `first_name` `name` VARCHAR(255) NOT NULL ;

ALTER TABLE `user_information`
CHANGE COLUMN `dob` `dob` DATE NULL ;

ALTER TABLE `user_information`
ADD COLUMN `postalCode` VARCHAR(45) NULL DEFAULT NULL AFTER `dob`;

CREATE TABLE `messages` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `msgChainId` CHAR(36) NOT NULL,
  `senderUserId` BIGINT NOT NULL,
  `recipientUserId` BIGINT NOT NULL,
  `isSystemMsg` TINYINT NOT NULL DEFAULT 0,
  `isDeleted` TINYINT NOT NULL DEFAULT 0,
  `isRead` TINYINT NOT NULL DEFAULT 0,
  `msgSubject` VARCHAR(350) NOT NULL,
  `msgBody` TEXT NOT NULL,
  `createdDate` DATETIME NOT NULL,
  `readDate` DATETIME,
  `deletedDate` DATETIME,
  PRIMARY KEY (`id`),
  INDEX `idx_senderUserId` (`senderUserId`),
  INDEX `idx_recipientUserId` (`recipientUserId`),
  INDEX `idx_msgChainId` (`msgChainId`)
);

CREATE TABLE `message_replies` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `originalMessageId` BIGINT NOT NULL,
  `replyMessageId` BIGINT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_originalMessageId` (`originalMessageId`),
  INDEX `idx_replyMessageId` (`replyMessageId`),
  FOREIGN KEY (`originalMessageId`) REFERENCES `messages`(`id`),
  FOREIGN KEY (`replyMessageId`) REFERENCES `messages`(`id`)
);

ALTER TABLE `messages`
ADD COLUMN `metadata` TEXT NULL AFTER `deletedDate`;