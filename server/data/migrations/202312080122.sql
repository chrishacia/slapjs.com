DROP TABLE IF EXISTS `user_verification`;

CREATE TABLE `user_verification` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `isUsed` tinyint NOT NULL DEFAULT '0',
  `issuedAt` datetime DEFAULT NULL,
  `hashy` varchar(260) DEFAULT NULL,
  `vType` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

LOCK TABLES `user_verification` WRITE;
/*!40000 ALTER TABLE `user_verification` DISABLE KEYS */;

INSERT INTO `user_verification` (`user_id`, `isUsed`, `issuedAt`, `hashy`, `vType`)
VALUES
	(1,0,'2021-02-08 04:14:20','c77c6a2ae68361d4e51f37839bcf2c441a3cd2eb','reg');

    INSERT INTO `user_verification` (`user_id`, `isUsed`, `issuedAt`, `hashy`, `vType`)
VALUES
	(1,0,'2021-03-08 04:14:20','c77c6a2ae68361d4e51f37839bcf2c441a3cd2eb','vfp');

/*!40000 ALTER TABLE `user_verification` ENABLE KEYS */;
UNLOCK TABLES;

DROP TABLE IF EXISTS `user_privs`;

CREATE TABLE `user_privs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `isActive` int DEFAULT NULL,
  `user_id` bigint unsigned NOT NULL DEFAULT '0',
  `priv_key` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `priv_mapping`;

CREATE TABLE `priv_mapping` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `isActive` int DEFAULT NULL,
  `name` varchar(256) DEFAULT '',
  `description` varchar(512) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;