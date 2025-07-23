CREATE DATABASE authdb;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE videos (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  filename VARCHAR(255),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE video_status (
  id SERIAL PRIMARY KEY,
  video_id INTEGER REFERENCES videos(id),
  status VARCHAR(50),
  updated_at TIMESTAMP DEFAULT NOW()
);