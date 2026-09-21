import { AppError } from "./AppError";

export function errorResponse(error: unknown) {
  if (error instanceof AppError) {
    return Response.json(
      {
        error: {
          code: error.code,
          message: error.message,
        },
      },
      { status: error.status }
    );
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "23505"
  ) {
    return Response.json(
      {
        error: {
          code: "DUPLICATE_LIVE_REQUEST",
          message: "A live return request already exists for this order and item",
        },
      },
      { status: 409 }
    );
  }

  console.error(error);


  return Response.json(
    {
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred",
      },
    },
    { status: 500 }
  );
}
