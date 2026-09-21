import { NextRequest } from "next/server";

import { errorResponse } from "@/server/errors/errorResponse";
import { addNote } from "@/server/services/noteService";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const data = await addNote(id, body.content);

    return Response.json({ data }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
