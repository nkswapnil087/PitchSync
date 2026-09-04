--------------------------------------------------------------------------------
-- PitchSync
-- Initial Integrity Officer Access Assignment
--
-- 200001 = Farhan Kabir  / Super Administrator
-- 200005 = Nusrat Jahan  / Integrity Manager
-- 200006 = Rezaul Islam  / Integrity Investigator
--------------------------------------------------------------------------------

MERGE INTO integrity_officer_access target
USING (
    SELECT
        200005 AS admin_id,
        'MANAGER' AS access_scope,
        200001 AS assigned_by_admin_id
    FROM dual
) source
ON (target.admin_id = source.admin_id)

WHEN MATCHED THEN
    UPDATE SET
        target.access_scope = source.access_scope,
        target.assigned_by_admin_id = source.assigned_by_admin_id,
        target.assigned_at = SYSTIMESTAMP,
        target.is_deleted = 0

WHEN NOT MATCHED THEN
    INSERT (
        admin_id,
        access_scope,
        assigned_by_admin_id,
        assigned_at,
        is_deleted
    )
    VALUES (
        source.admin_id,
        source.access_scope,
        source.assigned_by_admin_id,
        SYSTIMESTAMP,
        0
    );


MERGE INTO integrity_officer_access target
USING (
    SELECT
        200006 AS admin_id,
        'INVESTIGATOR' AS access_scope,
        200001 AS assigned_by_admin_id
    FROM dual
) source
ON (target.admin_id = source.admin_id)

WHEN MATCHED THEN
    UPDATE SET
        target.access_scope = source.access_scope,
        target.assigned_by_admin_id = source.assigned_by_admin_id,
        target.assigned_at = SYSTIMESTAMP,
        target.is_deleted = 0

WHEN NOT MATCHED THEN
    INSERT (
        admin_id,
        access_scope,
        assigned_by_admin_id,
        assigned_at,
        is_deleted
    )
    VALUES (
        source.admin_id,
        source.access_scope,
        source.assigned_by_admin_id,
        SYSTIMESTAMP,
        0
    );

COMMIT;