--------------------------------------------------------------------------------
-- PitchSync V004
-- Integrity Officer Responsibility Scope
--------------------------------------------------------------------------------

CREATE TABLE integrity_officer_access (
    admin_id              NUMBER(10),
    access_scope          VARCHAR2(20) NOT NULL,
    assigned_by_admin_id  NUMBER(10),
    assigned_at           TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    is_deleted            NUMBER(1) DEFAULT 0 NOT NULL,

    CONSTRAINT pk_integrity_officer_access
        PRIMARY KEY (admin_id),

    CONSTRAINT fk_ioa_admin
        FOREIGN KEY (admin_id)
        REFERENCES admin(person_id),

    CONSTRAINT fk_ioa_assigned_by
        FOREIGN KEY (assigned_by_admin_id)
        REFERENCES admin(person_id),

    CONSTRAINT ck_ioa_scope
        CHECK (access_scope IN ('MANAGER', 'INVESTIGATOR'))
);