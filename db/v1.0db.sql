-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema erpv1.1
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema erpv1.1
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `erpv1.0` DEFAULT CHARACTER SET utf8 ;
USE `erpv1.0` ;

-- -----------------------------------------------------
-- Table `erpv1.0`.`products`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `erpv1.0`.`products` (
  `idproduct` VARCHAR(50) NOT NULL,
  `model_name` VARCHAR(45) NULL,
  `pump_model` VARCHAR(45) NULL,
  `drawing_no_id` VARCHAR(45) NULL,
  `manufacturer` VARCHAR(45) NULL,
  `drawing_no_public_id` VARCHAR(255) NULL, -- Cloudinary 公共标识符
  `drawing_no_secure_url` VARCHAR(255) NULL, -- Cloudinary 安全访问链接
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `version` integer,
  PRIMARY KEY (`idproduct`),
  UNIQUE INDEX `idproducts_UNIQUE` (`idproduct` ASC) VISIBLE,
  UNIQUE INDEX `drawing_no_UNIQUE` (`drawing_no_id` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `erpv1.0`.`root_materials`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `erpv1.0`.`root_materials` (
  `idroot_material` INT NOT NULL AUTO_INCREMENT,
  `root_name` VARCHAR(45) NULL UNIQUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `version` integer,
  PRIMARY KEY (`idroot_material`),
  UNIQUE INDEX `idroot_materials_UNIQUE` (`idroot_material` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `erpv1.0`.`standard_materials`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `erpv1.0`.`standard_materials` (
  `drawing_no_id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(45) NULL,
  `counts` VARCHAR(45) NULL,
  `row_materials` VARCHAR(45) NULL,
  `drawing_no_public_id` VARCHAR(255) NULL, -- Cloudinary 公共标识符
  `drawing_no_secure_url` VARCHAR(255) NULL, -- Cloudinary 安全访问链接
  `comments` VARCHAR(45) NULL,
  `specification` VARCHAR(45) NULL,
  `model_name` VARCHAR(45) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `version` integer,
  PRIMARY KEY (`drawing_no_id`),
  UNIQUE INDEX `drawing_no_id_UNIQUE` (`drawing_no_id` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `erpv1.0`.`leaf_materials`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `erpv1.0`.`leaf_materials` (
  `model_name` VARCHAR(45) NULL,
  `name` VARCHAR(45) NOT NULL,
  `row_materials` VARCHAR(45) NOT NULL,
  `comments` VARCHAR(45) NULL,
  `counts` INT NOT NULL,
  `specification` VARCHAR(100) NULL DEFAULT NULL,
  `drawing_no_id` VARCHAR(45) NOT NULL,
  `root_materials_idroot_materials` INT NOT NULL,
  `drawing_no_public_id` VARCHAR(255) NULL, -- Cloudinary 公共标识符
  `drawing_no_secure_url` VARCHAR(255) NULL, -- Cloudinary 安全访问链接
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `version` integer,
  PRIMARY KEY (`drawing_no_id`),
  UNIQUE INDEX `drawing_no_UNIQUE` (`drawing_no_id` ASC) VISIBLE,
  INDEX `fk_leaf_materials_root_materials_idx` (`root_materials_idroot_materials` ASC) VISIBLE,
  CONSTRAINT `fk_leaf_materials_root_materials`
    FOREIGN KEY (`root_materials_idroot_materials`)
    REFERENCES `erpv1.0`.`root_materials` (`idroot_material`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `erpv1.0`.`prodcuts_to_materials`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `erpv1.0`.`prodcuts_to_materials` (
  `products_idproduct` VARCHAR(50) NOT NULL,
  `leaf_materials_drawing_no` VARCHAR(45) NOT NULL,
  `material_counts` INT NOT NULL,
  INDEX `fk_prodcuts_to_materials_products1_idx` (`products_idproduct` ASC) VISIBLE,
  INDEX `fk_prodcuts_to_materials_leaf_materials1_idx` (`leaf_materials_drawing_no` ASC) VISIBLE,
  CONSTRAINT `fk_prodcuts_to_materials_products1`
    FOREIGN KEY (`products_idproduct`)
    REFERENCES `erpv1.0`.`products` (`idproduct`)
    ON DELETE CASCADE  -- 修改为级联删除
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_prodcuts_to_materials_leaf_materials1`
    FOREIGN KEY (`leaf_materials_drawing_no`)
    REFERENCES `erpv1.0`.`leaf_materials` (`drawing_no_id`)
    ON DELETE CASCADE  -- 修改为级联删除
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
