import { db } from "@/lib/db";

export async function GET() {
  const result = await db.query("SELECT NOW()");

  return Response.json({
    database: "connected",
    time: result.rows[0].now,
  });
}