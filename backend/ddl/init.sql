-- Moa Calendar DDL Script
-- MySQL 8.0+

CREATE DATABASE IF NOT EXISTS moa_calendar
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE moa_calendar;

-- 1. Users
CREATE TABLE users (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    email           VARCHAR(255)    NOT NULL UNIQUE,
    password        VARCHAR(255)    NOT NULL,
    nickname        VARCHAR(10)     NOT NULL,
    color_code      VARCHAR(7)      NOT NULL,
    personal_asset_color VARCHAR(7) NOT NULL DEFAULT '#E91E63',
    profile_image_url VARCHAR(512)  NULL,
    created_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB;

-- 2. Calendar Groups
CREATE TABLE calendar_groups (
    id                BIGINT        AUTO_INCREMENT PRIMARY KEY,
    name              VARCHAR(30)   NOT NULL,
    type              ENUM('PERSONAL', 'SHARED') NOT NULL,
    host_id           BIGINT        NOT NULL,
    joint_asset_color VARCHAR(7)    NOT NULL DEFAULT '#2196F3',
    budget_start_day  INT           NOT NULL DEFAULT 1,
    created_at        DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at        DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_groups_host FOREIGN KEY (host_id) REFERENCES users(id),
    CONSTRAINT chk_budget_start_day CHECK (budget_start_day BETWEEN 1 AND 28)
) ENGINE=InnoDB;

-- 3. Group Members
CREATE TABLE group_members (
    id         BIGINT      AUTO_INCREMENT PRIMARY KEY,
    group_id   BIGINT      NOT NULL,
    user_id    BIGINT      NOT NULL,
    role       ENUM('HOST', 'GUEST') NOT NULL,
    status     ENUM('INVITED', 'ACCEPTED') NOT NULL DEFAULT 'INVITED',
    joined_at  DATETIME(6) NULL,
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    UNIQUE KEY uq_group_user (group_id, user_id),
    CONSTRAINT fk_gm_group FOREIGN KEY (group_id) REFERENCES calendar_groups(id) ON DELETE CASCADE,
    CONSTRAINT fk_gm_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- 4. Invites
CREATE TABLE invites (
    id            BIGINT       AUTO_INCREMENT PRIMARY KEY,
    group_id      BIGINT       NOT NULL,
    inviter_id    BIGINT       NOT NULL,
    invitee_id    BIGINT       NOT NULL,
    status        ENUM('PENDING', 'ACCEPTED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    created_at    DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at    DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    UNIQUE KEY uq_invite_group_invitee (group_id, invitee_id),
    CONSTRAINT fk_invites_group FOREIGN KEY (group_id) REFERENCES calendar_groups(id) ON DELETE CASCADE,
    CONSTRAINT fk_invites_inviter FOREIGN KEY (inviter_id) REFERENCES users(id),
    CONSTRAINT fk_invites_invitee FOREIGN KEY (invitee_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE INDEX idx_invites_invitee_status ON invites(invitee_id, status);

-- 5. Categories
CREATE TABLE categories (
    id            BIGINT       AUTO_INCREMENT PRIMARY KEY,
    group_id      BIGINT       NOT NULL,
    name          VARCHAR(30)  NOT NULL,
    icon          VARCHAR(10)  NULL,
    type          ENUM('EXPENSE', 'INCOME') NOT NULL,
    is_default    BOOLEAN      NOT NULL DEFAULT FALSE,
    sort_order    INT          NOT NULL DEFAULT 0,
    created_at    DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at    DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_categories_group FOREIGN KEY (group_id) REFERENCES calendar_groups(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_category_group ON categories(group_id);

-- 6. Schedules
CREATE TABLE schedules (
    id              BIGINT       AUTO_INCREMENT PRIMARY KEY,
    group_id        BIGINT       NOT NULL,
    user_id         BIGINT       NOT NULL,
    title           VARCHAR(50)  NOT NULL,
    start_date      DATE         NOT NULL,
    end_date        DATE         NULL,
    start_time      TIME         NULL,
    end_time        TIME         NULL,
    is_all_day      BOOLEAN      NOT NULL DEFAULT TRUE,
    asset_type      ENUM('PERSONAL', 'JOINT') NOT NULL DEFAULT 'PERSONAL',
    category        ENUM('APPOINTMENT', 'ANNIVERSARY', 'WORK', 'HOSPITAL', 'TRAVEL', 'ETC') NOT NULL DEFAULT 'ETC',
    memo            VARCHAR(500) NULL,
    repeat_type     ENUM('NONE', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY') NOT NULL DEFAULT 'NONE',
    repeat_group_id BIGINT       NULL,
    created_at      DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_schedules_group FOREIGN KEY (group_id) REFERENCES calendar_groups(id) ON DELETE CASCADE,
    CONSTRAINT fk_schedules_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE INDEX idx_schedule_group_start_date ON schedules(group_id, start_date);

-- 7. Asset Sources
CREATE TABLE asset_sources (
    id              BIGINT         AUTO_INCREMENT PRIMARY KEY,
    group_id        BIGINT         NOT NULL,
    name            VARCHAR(30)    NOT NULL,
    type            ENUM('CASH', 'CARD', 'ACCOUNT') NOT NULL,
    description     VARCHAR(100)   NULL,
    created_at      DATETIME(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6)    NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_asset_sources_group FOREIGN KEY (group_id) REFERENCES calendar_groups(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_asset_sources_group ON asset_sources(group_id);

-- 8. Transactions
CREATE TABLE transactions (
    id              BIGINT          AUTO_INCREMENT PRIMARY KEY,
    group_id        BIGINT          NOT NULL,
    user_id         BIGINT          NOT NULL,
    amount          DECIMAL(15,2)   NOT NULL,
    transaction_type ENUM('EXPENSE', 'INCOME') NOT NULL,
    asset_type      ENUM('PERSONAL', 'JOINT') NOT NULL DEFAULT 'PERSONAL',
    category_name   VARCHAR(30)     NOT NULL,
    asset_source_id BIGINT          NULL,
    date            DATE            NOT NULL,
    description     VARCHAR(200)    NULL,
    schedule_id     BIGINT          NULL,
    created_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at      DATETIME(6)     NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    CONSTRAINT fk_transactions_group FOREIGN KEY (group_id) REFERENCES calendar_groups(id) ON DELETE CASCADE,
    CONSTRAINT fk_transactions_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_transactions_asset_source FOREIGN KEY (asset_source_id) REFERENCES asset_sources(id) ON DELETE SET NULL,
    CONSTRAINT fk_transactions_schedule FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_transaction_group_date ON transactions(group_id, date);
CREATE INDEX idx_transaction_user_date ON transactions(user_id, date);
CREATE INDEX idx_transaction_schedule ON transactions(schedule_id);
CREATE INDEX idx_transaction_asset_source ON transactions(asset_source_id);
