-- ============================================================
-- PitchSync - Local Development User Setup
-- Oracle Database 19c
--
-- Run this script as SYSTEM or another DBA/admin account
-- connected to the correct PDB.
--
-- IMPORTANT:
-- Change YOUR_LOCAL_PASSWORD before running.
-- This user is for LOCAL DEVELOPMENT only.
-- ============================================================

CREATE USER PITCHSYNC_DEV
IDENTIFIED BY YOUR_LOCAL_PASSWORD
DEFAULT TABLESPACE users
TEMPORARY TABLESPACE temp
QUOTA UNLIMITED ON users;

-- Allow login
GRANT CREATE SESSION TO PITCHSYNC_DEV;

-- Allow PitchSync schema objects to be created
GRANT CREATE TABLE TO PITCHSYNC_DEV;
GRANT CREATE VIEW TO PITCHSYNC_DEV;
GRANT CREATE PROCEDURE TO PITCHSYNC_DEV;
GRANT CREATE TRIGGER TO PITCHSYNC_DEV;
GRANT CREATE SEQUENCE TO PITCHSYNC_DEV;
GRANT CREATE TYPE TO PITCHSYNC_DEV;
