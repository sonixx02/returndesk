import { AppError } from "@/server/errors/AppError";
import { findRequestById } from "@/server/repositories/requestQueries";
import { createNote } from "@/server/repositories/noteRepository";
import { assertValidId } from "@/server/services/requestService";

export async function addNote(requestId: string, content: string) {
  assertValidId(requestId);

  if (typeof content !== "string" || !content.trim()) {
    throw new AppError(422, "INVALID_CONTENT", "Note content is required");
  }
  if (content.trim().length > 1000) {
    throw new AppError(
      422,
      "INVALID_CONTENT",
      "Note content cannot exceed 1000 characters"
    );
  }

  const request = await findRequestById(requestId);


  if (!request) {
    throw new AppError(404, "REQUEST_NOT_FOUND", "Return request not found");
  }

  return createNote(requestId, content);
}
