ALTER TABLE `login`
ADD COLUMN `failed_attempts` INT NOT NULL DEFAULT 0,
ADD COLUMN `is_locked` TINYINT NOT NULL DEFAULT 0,
ADD COLUMN `last_attempt` DATETIME;

CREATE TABLE `blocked_ips` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `ip_address` VARCHAR(45) NOT NULL,
  `blocked_until` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_ip` (`ip_address`)
);
