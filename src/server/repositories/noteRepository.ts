import { db } from "@/lib/db";

export async function createNote(requestId: string, content: string) {
  const result = await db.query(
    `
      INSERT INTO notes (request_id, content)
      VALUES ($1, $2)
      RETURNING *
    `,
    [requestId, content]
  );

  return result.rows[0];
}

export async function findNotesByRequestId(requestId: string) {
  const result = await db.query(
    `
      SELECT *
      FROM notes
      WHERE request_id = $1
      ORDER BY created_at ASC
    `,
    [requestId]
  );

  return result.rows;
}
