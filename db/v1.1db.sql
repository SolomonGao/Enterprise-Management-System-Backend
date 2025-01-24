-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema erpv1.0
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema erpv1.0
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `erpv1.0` DEFAULT CHARACTER SET utf8mb3 ;
USE `erpv1.0` ;

-- -----------------------------------------------------
-- Table `erpv1.0`.`root_materials`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `erpv1.0`.`root_materials` (
  `idroot_material` INT NOT NULL AUTO_INCREMENT,
  `root_name` VARCHAR(45) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `version` INT NOT NULL DEFAULT '0',
  PRIMARY KEY (`idroot_material`),
  UNIQUE INDEX `root_name` (`root_name` ASC) VISIBLE)
ENGINE = InnoDB
AUTO_INCREMENT = 13
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `erpv1.0`.`leaf_materials`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `erpv1.0`.`leaf_materials` (
  `drawing_no_id` VARCHAR(50) NOT NULL,
  `model_name` VARCHAR(45) NULL DEFAULT NULL,
  `name` VARCHAR(45) NOT NULL,
  `row_materials` VARCHAR(45) NOT NULL,
  `comments` VARCHAR(255) NULL DEFAULT NULL,
  `counts` INT NOT NULL,
  `purchasing` INT NULL DEFAULT '0',
  `specification` VARCHAR(100) NULL DEFAULT NULL,
  `root_materials_idroot_materials` INT NOT NULL,
  `drawing_no_public_id` VARCHAR(255) NULL DEFAULT NULL,
  `drawing_no_secure_url` VARCHAR(255) NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `version` INT NOT NULL DEFAULT '0',
  PRIMARY KEY (`drawing_no_id`),
  UNIQUE INDEX `drawing_no_id_UNIQUE` (`drawing_no_id` ASC) VISIBLE,
  INDEX `fk_leaf_materials_root_materials_idx` (`root_materials_idroot_materials` ASC) VISIBLE,
  CONSTRAINT `fk_leaf_materials_root_materials`
    FOREIGN KEY (`root_materials_idroot_materials`)
    REFERENCES `erpv1.0`.`root_materials` (`idroot_material`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `erpv1.0`.`products`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `erpv1.0`.`products` (
  `idproduct` VARCHAR(50) NOT NULL,
  `model_name` VARCHAR(45) NULL DEFAULT NULL,
  `pump_model` VARCHAR(45) NULL DEFAULT NULL,
  `drawing_no_id` VARCHAR(45) NULL DEFAULT NULL,
  `manufacturer` VARCHAR(45) NULL DEFAULT NULL,
  `drawing_no_public_id` VARCHAR(255) NULL DEFAULT NULL,
  `drawing_no_secure_url` VARCHAR(255) NULL DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `version` INT NOT NULL DEFAULT '0',
  `finished_products` INT NULL DEFAULT '0',
  PRIMARY KEY (`idproduct`),
  UNIQUE INDEX `drawing_no_id_UNIQUE` (`drawing_no_id` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


-- -----------------------------------------------------
-- Table `erpv1.0`.`products_to_materials`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `erpv1.0`.`products_to_materials` (
  `products_idproduct` VARCHAR(50) NOT NULL,
  `leaf_materials_drawing_no` VARCHAR(45) NOT NULL,
  `material_counts` INT NOT NULL,
  INDEX `fk_prodcuts_to_materials_products1_idx` (`products_idproduct` ASC) VISIBLE,
  INDEX `fk_prodcuts_to_materials_leaf_materials1_idx` (`leaf_materials_drawing_no` ASC) VISIBLE,
  CONSTRAINT `fk_prodcuts_to_materials_leaf_materials1`
    FOREIGN KEY (`leaf_materials_drawing_no`)
    REFERENCES `erpv1.0`.`leaf_materials` (`drawing_no_id`)
    ON DELETE CASCADE,
  CONSTRAINT `fk_prodcuts_to_materials_products1`
    FOREIGN KEY (`products_idproduct`)
    REFERENCES `erpv1.0`.`products` (`idproduct`)
    ON DELETE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb3;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
