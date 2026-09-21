import { NextRequest } from "next/server";

import { errorResponse } from "@/server/errors/errorResponse";
import {
  createNewRequest,
  listExistingRequests,
} from "@/server/services/requestService";

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;

    const result = await listExistingRequests({
      search: params.get("search") ?? undefined,
      status: params.get("status") ?? undefined,
      reason: params.get("reason") ?? undefined,
      sortBy: params.get("sortBy") ?? undefined,
      sortOrder: params.get("sortOrder") ?? undefined,
      page: params.get("page") ?? undefined,
      pageSize: params.get("pageSize") ?? undefined,
    });

    return Response.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const createdRequest = await createNewRequest(body);

    return Response.json(
      {
        data: createdRequest,
      },
      { status: 201 }
    );
  } catch (error) {
    return errorResponse(error);
  }
}
