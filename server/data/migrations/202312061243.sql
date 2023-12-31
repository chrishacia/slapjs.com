CREATE TABLE `slapjs`.`user_information` (
  `user_id` BIGINT NOT NULL,
  `first_name` VARCHAR(255) NOT NULL,
  `last_name` VARCHAR(255) NOT NULL,
  `profile_img` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`user_id`));

CREATE TABLE slapjs.`user_locations` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `geo_id` BIGINT NOT NULL,
  `team_id` INT NOT NULL,
  `isPrimary` TINYINT NOT NULL,
  `isActive` TINYINT NOT NULL,
  PRIMARY KEY (`id`));
