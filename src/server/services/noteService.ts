import { AppError } from "@/server/errors/AppError";
import { findRequestById } from "@/server/repositories/requestQueries";
import {
  createNote,
  findNotesByRequestId,
} from "@/server/repositories/noteRepository";

export async function addNote(
  requestId: string,
  content: string
) {
  const request = await findRequestById(requestId);

  if (!request) {
    throw new AppError(
      404,
      "REQUEST_NOT_FOUND",
      "Return request not found"
    );
  }

  return createNote(requestId, content);
}

export async function getNotes(requestId: string) {
  const request = await findRequestById(requestId);

  if (!request) {
    throw new AppError(
      404,
      "REQUEST_NOT_FOUND",
      "Return request not found"
    );
  }

  return findNotesByRequestId(requestId);
}
