-- CityPins schema (MySQL 8)

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY,
  username VARCHAR(30) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  bio VARCHAR(200),
  home_city VARCHAR(100),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS spots (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  name VARCHAR(120) NOT NULL,
  description VARCHAR(500) NOT NULL,
  map_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_spots_city (city),
  INDEX idx_spots_user_id (user_id)
);

CREATE TABLE IF NOT EXISTS bookmarks (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  spot_id CHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (spot_id) REFERENCES spots(id) ON DELETE CASCADE,
  UNIQUE (user_id, spot_id),
  INDEX idx_bookmarks_user_id (user_id),
  INDEX idx_bookmarks_spot_id (spot_id)
);
