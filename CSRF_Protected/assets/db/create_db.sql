CREATE DATABASE IF NOT EXISTS stream_dream;
USE stream_dream;

CREATE TABLE tbl_user(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(30) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    registration_date TIMESTAMP NOT NULL
);

CREATE TABLE tbl_episode(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    thumbnail VARCHAR(255) NOT NULL,
    src VARCHAR(255) NOT NULL
);

CREATE TABLE tbl_series(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description VARCHAR(255) NOT NULL,
    thumbnail VARCHAR(255) NOT NULL
);

CREATE TABLE tbl_watchlist(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    fk_episode INT UNSIGNED,
    fk_user INT UNSIGNED,
    plays_count VARCHAR(30) NOT NULL,
    watch_time VARCHAR(255) NOT NULL,
    
    FOREIGN KEY (fk_episode) REFERENCES tbl_episode(id),
    FOREIGN KEY (fk_user) REFERENCES tbl_user(id)
);

CREATE TABLE tbl_season(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    fk_series INT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    thumbnail VARCHAR(255) NOT NULL,
    production_year INT(4) NOT NULL,
    
    FOREIGN KEY (fk_series) REFERENCES tbl_series(id)
);

CREATE TABLE tbl_season_episode(
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    fk_episode INT UNSIGNED NOT NULL,
    fk_season INT UNSIGNED NOT NULL,
    number INT NOT NULL,
    
    FOREIGN KEY (fk_episode) REFERENCES tbl_episode(id),
    FOREIGN KEY (fk_season) REFERENCES tbl_season(id)
);