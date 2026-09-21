import { NextRequest } from "next/server";

import { errorResponse } from "@/server/errors/errorResponse";
import {
  getRequestWithNotes,
  removeRequest,
  updateRequestDetails,
} from "@/server/services/requestService";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const data = await getRequestWithNotes(id);

    return Response.json({ data });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const data = await updateRequestDetails(id, body);

    return Response.json({ data });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const data = await removeRequest(id);

    return Response.json({ data });
  } catch (error) {
    return errorResponse(error);
  }
}
