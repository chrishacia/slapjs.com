CREATE TABLE `slapjs`.`login` (
  `create_ts` DATETIME NOT NULL,
  `email` VARCHAR(260) NULL,
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `pass` VARCHAR(256) NULL,
  `salt` VARCHAR(256) NULL,
  `status` TINYINT NOT NULL,
  `verified` TINYINT NOT NULL,
  PRIMARY KEY (`id`));
