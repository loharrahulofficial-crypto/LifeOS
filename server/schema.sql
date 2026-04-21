-- LifeOS Database Schema (Firebase Auth Version)
-- Run this file against your MySQL server to set up the database.

CREATE DATABASE IF NOT EXISTS lifeos_db;
USE lifeos_db;

-- Store authenticated users from Firebase Google Sign-In
CREATE TABLE IF NOT EXISTS users (
  uid          VARCHAR(128) PRIMARY KEY, -- Firebase UID
  email        VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  photo_url    VARCHAR(512),
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User data instead of device data
CREATE TABLE IF NOT EXISTS app_data (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    VARCHAR(128) NOT NULL,
  module     VARCHAR(50)  NOT NULL,  -- 'habits' | 'completions' | 'nutrition_goals' | 'nutrition_entries' | 'gym' | 'pomodoro_settings'
  payload    JSON         NOT NULL,
  updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_module (user_id, module),
  FOREIGN KEY (user_id) REFERENCES users(uid) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
