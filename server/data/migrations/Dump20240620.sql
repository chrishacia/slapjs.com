CREATE DATABASE  IF NOT EXISTS `slapjs` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `slapjs`;
-- MySQL dump 10.13  Distrib 8.0.34, for macos13 (x86_64)
--
-- Host: localhost    Database: slapjs
-- ------------------------------------------------------
-- Server version	8.2.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `geolocation`
--

DROP TABLE IF EXISTS `geolocation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `geolocation` (
  `country` varchar(2) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `city` varchar(180) DEFAULT NULL,
  `state_full` varchar(100) DEFAULT NULL,
  `state_abbr` varchar(20) DEFAULT NULL,
  `county` varchar(100) DEFAULT NULL,
  `county_code` varchar(20) DEFAULT NULL,
  `community_name` varchar(100) DEFAULT NULL,
  `community_code` varchar(20) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `accuracy` int DEFAULT NULL,
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=41471 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `login`
--

DROP TABLE IF EXISTS `login`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `login` (
  `create_ts` datetime NOT NULL,
  `email` varchar(260) DEFAULT NULL,
  `id` bigint NOT NULL AUTO_INCREMENT,
  `pass` varchar(256) DEFAULT NULL,
  `salt` varchar(256) DEFAULT NULL,
  `status` tinyint NOT NULL,
  `verified` tinyint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `message_replies`
--

DROP TABLE IF EXISTS `message_replies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `message_replies` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `originalMessageId` char(36) NOT NULL,
  `replyMessageId` char(36) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `msgChainId` char(36) NOT NULL,
  `senderUserId` bigint NOT NULL,
  `recipientUserId` bigint NOT NULL,
  `isSystemMsg` tinyint NOT NULL DEFAULT '0',
  `msgSubject` varchar(350) NOT NULL,
  `msgBody` text NOT NULL,
  `createdDate` datetime NOT NULL,
  `readDate` datetime DEFAULT NULL,
  `deletedDate` datetime DEFAULT NULL,
  `metadata` text,
  `msgId` char(36) DEFAULT NULL,
  `isReadSender` tinyint DEFAULT NULL,
  `isReadRecipient` tinyint DEFAULT NULL,
  `isDeletedSender` tinyint DEFAULT NULL,
  `isDeletedRecipient` tinyint DEFAULT NULL,
  `dateReadSender` datetime DEFAULT NULL,
  `dateReadRecipient` datetime DEFAULT NULL,
  `dateDeletedSender` datetime DEFAULT NULL,
  `dateDeletedRecipient` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_senderUserId` (`senderUserId`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `one_time_view`
--

DROP TABLE IF EXISTS `one_time_view`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `one_time_view` (
  `id` int NOT NULL AUTO_INCREMENT,
  `viewKey` varchar(100) DEFAULT NULL,
  `viewValue` varchar(500) DEFAULT NULL,
  `viewDesc` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `one_time_view_log`
--

DROP TABLE IF EXISTS `one_time_view_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `one_time_view_log` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `viewId` int NOT NULL,
  `viewed_ts` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_information`
--

DROP TABLE IF EXISTS `user_information`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_information` (
  `user_id` bigint NOT NULL,
  `name` varchar(255) NOT NULL,
  `profile_img` varchar(255) NOT NULL,
  `dob` date DEFAULT NULL,
  `postalCode` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_jwt_refresh`
--

DROP TABLE IF EXISTS `user_jwt_refresh`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_jwt_refresh` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` varchar(255) NOT NULL,
  `refresh_token` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=119 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_locations`
--

DROP TABLE IF EXISTS `user_locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_locations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `geo_id` bigint NOT NULL,
  `team_id` int NOT NULL,
  `isPrimary` tinyint NOT NULL,
  `isActive` tinyint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_privs`
--

DROP TABLE IF EXISTS `user_privs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_privs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `isActive` int DEFAULT NULL,
  `user_id` bigint unsigned NOT NULL DEFAULT '0',
  `priv_key` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_verification`
--

DROP TABLE IF EXISTS `user_verification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_verification` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `isUsed` tinyint NOT NULL DEFAULT '0',
  `issuedAt` datetime DEFAULT NULL,
  `hashy` varchar(260) DEFAULT NULL,
  `vType` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-06-20 16:54:50
