-- Brick Manufacturing DBMS - TiDB Database Schema
-- This script creates all necessary tables for the application

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS supplies;
DROP TABLE IF EXISTS purchase;
DROP TABLE IF EXISTS production;
DROP TABLE IF EXISTS account;
DROP TABLE IF EXISTS worker;
DROP TABLE IF EXISTS department;
DROP TABLE IF EXISTS brick;
DROP TABLE IF EXISTS users;

-- Users table for authentication
CREATE TABLE users (
    userid VARCHAR(20) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Brick types table
CREATE TABLE brick (
    brick_id INT PRIMARY KEY AUTO_INCREMENT,
    brick_type VARCHAR(50) NOT NULL,
    rate_per_1000 INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) AUTO_INCREMENT = 10000;

-- Department table
CREATE TABLE department (
    dept_id INT PRIMARY KEY AUTO_INCREMENT,
    dept_name VARCHAR(20) NOT NULL,
    no_of_workers INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) AUTO_INCREMENT = 1000;

-- Worker table
CREATE TABLE worker (
    worker_id INT PRIMARY KEY AUTO_INCREMENT,
    f_name VARCHAR(20) NOT NULL,
    l_name VARCHAR(20) NOT NULL,
    w_name VARCHAR(50) GENERATED ALWAYS AS (CONCAT(f_name, ' ', l_name)) STORED,
    age INT NOT NULL,
    gender VARCHAR(10) NOT NULL,
    dept INT NOT NULL,
    salary INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dept) REFERENCES department(dept_id) ON DELETE CASCADE
);

-- Production table
CREATE TABLE production (
    p_date DATE NOT NULL,
    brick_id INT NOT NULL,
    quantity INT NOT NULL,
    brick_type VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (p_date, brick_id),
    FOREIGN KEY (brick_id) REFERENCES brick(brick_id)
);

-- Purchase table
CREATE TABLE purchase (
    invoice INT PRIMARY KEY AUTO_INCREMENT,
    p_date DATE NOT NULL,
    brick_id INT NOT NULL,
    p_name VARCHAR(20) NOT NULL,
    quantity INT NOT NULL,
    total_cost INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (brick_id) REFERENCES brick(brick_id)
);

-- Supplies table
CREATE TABLE supplies (
    invoice INT UNIQUE KEY,
    location VARCHAR(50) NOT NULL,
    vehicle_no VARCHAR(20) NOT NULL,
    s_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice) REFERENCES purchase(invoice) ON DELETE CASCADE
);

-- Account table
CREATE TABLE account (
    s_no INT PRIMARY KEY AUTO_INCREMENT,
    a_date DATE NOT NULL,
    description VARCHAR(100) NOT NULL,
    credit INT DEFAULT 0,
    debit INT DEFAULT 0,
    balance INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default users
INSERT INTO users (userid, password) VALUES
('kishore', '123'),
('admin', 'admin123');

-- Insert default brick types
INSERT INTO brick (brick_type, rate_per_1000) VALUES
('Concrete Bricks', 10500),
('Fly ash Clay Bricks', 12000),
('Burnt Clay Bricks', 12500),
('Engineering Bricks', 13000);

-- Insert default departments
INSERT INTO department (dept_name, no_of_workers) VALUES
('Making', 50),
('Storage', 70),
('Quality Control', 30),
('Logistics', 40);

-- Create indexes for better performance
CREATE INDEX idx_worker_dept ON worker(dept);
CREATE INDEX idx_production_date ON production(p_date);
CREATE INDEX idx_purchase_date ON purchase(p_date);
CREATE INDEX idx_account_date ON account(a_date);

-- Display success message
SELECT 'Database schema created successfully!' AS message;
