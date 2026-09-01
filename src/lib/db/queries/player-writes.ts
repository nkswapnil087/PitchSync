import "server-only";

import type { PlayerWriteInput } from "@/lib/validation/player";
import { queryRows, type Connection } from "@/lib/db/oracle";

type IdRow = { PERSON_ID: number };

async function replacePlayerCollections(connection: Connection, playerId: number, input: PlayerWriteInput) {
  await connection.execute(`UPDATE person_phone SET is_deleted = 1 WHERE person_id = :playerId`, { playerId });
  if (input.phone) {
    await connection.execute(`
      MERGE INTO person_phone target
      USING (SELECT :playerId AS person_id, :phone AS phone FROM dual) source
      ON (target.person_id = source.person_id AND target.phone = source.phone)
      WHEN MATCHED THEN UPDATE SET target.is_deleted = 0
      WHEN NOT MATCHED THEN INSERT (person_id, phone, is_deleted) VALUES (source.person_id, source.phone, 0)
    `, { playerId, phone: input.phone });
  }
  await connection.execute(`UPDATE player_education SET is_deleted = 1 WHERE person_id = :playerId AND education_no = 1`, { playerId });
  if (input.education) {
    await connection.execute(`
      MERGE INTO player_education target
      USING (SELECT :playerId AS person_id, 1 AS education_no FROM dual) source
      ON (target.person_id = source.person_id AND target.education_no = source.education_no)
      WHEN MATCHED THEN UPDATE SET target.education_info = education_type(:education, target.education_info.institute_or_board, target.education_info.result, target.education_info.subject), target.is_deleted = 0
      WHEN NOT MATCHED THEN INSERT (person_id, education_no, education_info, is_deleted) VALUES (source.person_id, source.education_no, education_type(:education, NULL, NULL, NULL), 0)
    `, { playerId, education: input.education });
  }
  await connection.execute(`UPDATE player_achievement SET is_deleted = 1 WHERE person_id = :playerId`, { playerId });
  for (const achievement of input.achievements) {
    await connection.execute(`
      MERGE INTO player_achievement target
      USING (SELECT :playerId AS person_id, :achievement AS achievement FROM dual) source
      ON (target.person_id = source.person_id AND target.achievement = source.achievement)
      WHEN MATCHED THEN UPDATE SET target.is_deleted = 0
      WHEN NOT MATCHED THEN INSERT (person_id, achievement, is_deleted) VALUES (source.person_id, source.achievement, 0)
    `, { playerId, achievement });
  }
}

async function writeAudit(connection: Connection, actorPersonId: number, playerId: number, operation: "INSERT" | "UPDATE" | "DELETE", values: object) {
  await connection.execute(`
    INSERT INTO audit_log (actor_person_id, entity_name, record_identifier, operation, new_values)
    VALUES (:actorPersonId, 'PLAYER', :recordIdentifier, :operation, :newValues)
  `, { actorPersonId, recordIdentifier: String(playerId), operation, newValues: JSON.stringify(values) });
}

export async function createPlayer(connection: Connection, input: PlayerWriteInput, actorPersonId: number) {
  const idRows = await queryRows<IdRow>(connection, `SELECT seq_player_person.NEXTVAL AS person_id FROM dual`);
  const playerId = Number(idRows[0]?.PERSON_ID);
  if (!playerId) throw new Error("Unable to allocate a player reference.");
  await connection.execute(`
    INSERT INTO person (person_id, first_name, last_name, dob, present_address, permanent_address)
    VALUES (:playerId, :firstName, :lastName, TO_DATE(:dateOfBirth, 'YYYY-MM-DD'),
            address_type(:presentAddress, :presentUpazila, :presentDistrict, :presentDivision),
            address_type(:permanentAddress, :permanentUpazila, :permanentDistrict, :permanentDivision))
  `, { playerId, firstName: input.firstName, lastName: input.lastName, dateOfBirth: input.dateOfBirth, presentAddress: input.presentAddress || null, presentUpazila: input.presentUpazila || null, presentDistrict: input.presentDistrict || null, presentDivision: input.presentDivision || null, permanentAddress: input.permanentAddress || null, permanentUpazila: input.permanentUpazila || null, permanentDistrict: input.permanentDistrict || null, permanentDivision: input.permanentDivision || null });
  await connection.execute(`INSERT INTO player (person_id, player_role, gender, family_background) VALUES (:playerId, :playerRole, :gender, :familyBackground)`, { playerId, playerRole: input.playerRole, gender: input.gender, familyBackground: input.familyBackground || null });
  await replacePlayerCollections(connection, playerId, input);
  await writeAudit(connection, actorPersonId, playerId, "INSERT", { firstName: input.firstName, lastName: input.lastName, playerRole: input.playerRole, gender: input.gender });
  return playerId;
}

export async function updatePlayer(connection: Connection, playerId: number, input: PlayerWriteInput, actorPersonId: number) {
  const result = await connection.execute(`
    UPDATE person SET first_name = :firstName, last_name = :lastName,
      dob = TO_DATE(:dateOfBirth, 'YYYY-MM-DD'),
      present_address = address_type(:presentAddress, :presentUpazila, :presentDistrict, :presentDivision),
      permanent_address = address_type(:permanentAddress, :permanentUpazila, :permanentDistrict, :permanentDivision)
    WHERE person_id = :playerId AND is_deleted = 0
  `, { playerId, firstName: input.firstName, lastName: input.lastName, dateOfBirth: input.dateOfBirth, presentAddress: input.presentAddress || null, presentUpazila: input.presentUpazila || null, presentDistrict: input.presentDistrict || null, presentDivision: input.presentDivision || null, permanentAddress: input.permanentAddress || null, permanentUpazila: input.permanentUpazila || null, permanentDistrict: input.permanentDistrict || null, permanentDivision: input.permanentDivision || null });
  if ((result.rowsAffected ?? 0) !== 1) return false;
  const playerResult = await connection.execute(`UPDATE player SET player_role = :playerRole, gender = :gender, family_background = :familyBackground WHERE person_id = :playerId AND is_deleted = 0`, { playerId, playerRole: input.playerRole, gender: input.gender, familyBackground: input.familyBackground || null });
  if ((playerResult.rowsAffected ?? 0) !== 1) throw new Error("Player specialization is unavailable.");
  await replacePlayerCollections(connection, playerId, input);
  await writeAudit(connection, actorPersonId, playerId, "UPDATE", { firstName: input.firstName, lastName: input.lastName, playerRole: input.playerRole, gender: input.gender });
  return true;
}

export async function softDeletePlayer(connection: Connection, playerId: number, actorPersonId: number) {
  const playerResult = await connection.execute(`UPDATE player SET is_deleted = 1 WHERE person_id = :playerId AND is_deleted = 0`, { playerId });
  if ((playerResult.rowsAffected ?? 0) !== 1) return false;
  await connection.execute(`UPDATE person SET is_deleted = 1 WHERE person_id = :playerId AND is_deleted = 0`, { playerId });
  await connection.execute(`UPDATE person_phone SET is_deleted = 1 WHERE person_id = :playerId`, { playerId });
  await connection.execute(`UPDATE player_education SET is_deleted = 1 WHERE person_id = :playerId`, { playerId });
  await connection.execute(`UPDATE player_achievement SET is_deleted = 1 WHERE person_id = :playerId`, { playerId });
  await connection.execute(`UPDATE user_account SET account_status = 'DISABLED', is_deleted = 1 WHERE person_id = :playerId AND is_deleted = 0`, { playerId });
  await writeAudit(connection, actorPersonId, playerId, "DELETE", { softDeleted: true });
  return true;
}
