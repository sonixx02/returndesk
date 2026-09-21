import { NextRequest } from "next/server";

import { errorResponse } from "@/server/errors/errorResponse";
import { changeStatus } from "@/server/services/requestService";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const data = await changeStatus(
      id,
      body.status,
      body.resolution ?? null,
      body.refundAmount ?? null
    );

    return Response.json({ data });
  } catch (error) {
    return errorResponse(error);
  }
}
