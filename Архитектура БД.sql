CREATE TABLE `Пользователи`(
    `id_пользователя` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `почта` VARCHAR(255) NOT NULL,
    `хаш_пароль` VARCHAR(255) NOT NULL,
    `статус` VARCHAR(255) NOT NULL
);
CREATE TABLE `Студенты`(
    `id_пользователя` INT NOT NULL,
    `id_студента` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `почта` VARCHAR(255) NOT NULL,
    `ФИО` VARCHAR(255) NOT NULL,
    `телефон` VARCHAR(255) NOT NULL,
    `статус_резюме` VARCHAR(255) NOT NULL
);
CREATE TABLE `Резюме`(
    `id_студента` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `резюме` TEXT NOT NULL
);
CREATE TABLE `Заявки_студента`(
    `id_заявки` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_студента` INT NOT NULL
);
CREATE TABLE `Заявки`(
    `id_заявки` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `id_вакансии` INT NOT NULL,
    `статус_заявки` VARCHAR(255) NOT NULL,
    `время_создания` DATETIME NOT NULL
);
CREATE TABLE `Работодатели`(
    `id_пользователя` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_работодателя` INT NOT NULL,
    `почта` VARCHAR(255) NOT NULL,
    `ФИО` VARCHAR(255) NOT NULL,
    `телефон` INT NOT NULL,
    PRIMARY KEY(`id_работодателя`)
);
CREATE TABLE `Вакансии_работодателя`(
    `id_вакансии` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_работодателя` INT NOT NULL
);
CREATE TABLE `Вакансии`(
    `id_вакансии` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `Тип_вакансии` VARCHAR(255) NOT NULL,
    `id_позиции` INT NOT NULL,
    `компания` VARCHAR(255) NOT NULL,
    `мин_зарплата` INT NOT NULL,
    `макс_зарплата` INT NOT NULL,
    `описание_вакансии` TEXT NOT NULL,
    `статус_вакансии` VARCHAR(255) NOT NULL,
    `время_создания` DATETIME NOT NULL
);
CREATE TABLE `Позиции`(
    `id_позиции` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `позиция` VARCHAR(255) NOT NULL
);
CREATE TABLE `Требуемые_навыки`(
    `id_вакансии` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_навыка` INT NOT NULL
);
CREATE TABLE `Навыки_студента`(
    `id_студента` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `id_навыка` INT NOT NULL
);
CREATE TABLE `Навыки`(
    `id_навыка` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `навык` VARCHAR(255) NOT NULL
);
ALTER TABLE
    `Навыки_студента` ADD CONSTRAINT `Навыки_студента_id_студента_foreign` FOREIGN KEY(`id_студента`) REFERENCES `Студенты`(`id_студента`);
ALTER TABLE
    `Заявки` ADD CONSTRAINT `Заявки_id_вакансии_foreign` FOREIGN KEY(`id_вакансии`) REFERENCES `Вакансии`(`id_вакансии`);
ALTER TABLE
    `Навыки_студента` ADD CONSTRAINT `Навыки_студента_id_навыка_foreign` FOREIGN KEY(`id_навыка`) REFERENCES `Навыки`(`id_навыка`);
ALTER TABLE
    `Вакансии` ADD CONSTRAINT `Вакансии_id_позиции_foreign` FOREIGN KEY(`id_позиции`) REFERENCES `Позиции`(`id_позиции`);
ALTER TABLE
    `Вакансии_работодателя` ADD CONSTRAINT `Вакансии_работодателя_id_работодателя_foreign` FOREIGN KEY(`id_работодателя`) REFERENCES `Работодатели`(`id_работодателя`);
ALTER TABLE
    `Требуемые_навыки` ADD CONSTRAINT `Требуемые_навыки_id_вакансии_foreign` FOREIGN KEY(`id_вакансии`) REFERENCES `Вакансии`(`id_вакансии`);
ALTER TABLE
    `Вакансии_работодателя` ADD CONSTRAINT `Вакансии_работодателя_id_вакансии_foreign` FOREIGN KEY(`id_вакансии`) REFERENCES `Вакансии`(`id_вакансии`);
ALTER TABLE
    `Заявки_студента` ADD CONSTRAINT `Заявки_студента_id_студента_foreign` FOREIGN KEY(`id_студента`) REFERENCES `Студенты`(`id_студента`);
ALTER TABLE
    `Студенты` ADD CONSTRAINT `Студенты_id_студента_foreign` FOREIGN KEY(`id_студента`) REFERENCES `Резюме`(`id_студента`);
ALTER TABLE
    `Требуемые_навыки` ADD CONSTRAINT `Требуемые_навыки_id_навыка_foreign` FOREIGN KEY(`id_навыка`) REFERENCES `Навыки`(`id_навыка`);
ALTER TABLE
    `Работодатели` ADD CONSTRAINT `Работодатели_почта_foreign` FOREIGN KEY(`почта`) REFERENCES `Пользователи`(`почта`);
ALTER TABLE
    `Студенты` ADD CONSTRAINT `Студенты_почта_foreign` FOREIGN KEY(`почта`) REFERENCES `Пользователи`(`почта`);
ALTER TABLE
    `Заявки_студента` ADD CONSTRAINT `Заявки_студента_id_заявки_foreign` FOREIGN KEY(`id_заявки`) REFERENCES `Заявки`(`id_заявки`);