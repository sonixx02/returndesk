import { AppError } from "@/server/errors/AppError";
import { findRequestById } from "@/server/repositories/requestQueries";
import { updateRequestStatus } from "@/server/repositories/requestMutations";
import {
  updateRequest,
  type UpdateRequestInput,
} from "@/server/repositories/requestMutations";
type RequestStatus =
  | "OPEN"
  | "IN_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED";

const allowedTransitions: Record<RequestStatus, RequestStatus[]> = {
  OPEN: ["IN_REVIEW"],
  IN_REVIEW: ["APPROVED", "REJECTED"],
  APPROVED: ["COMPLETED"],
  REJECTED: [],
  COMPLETED: [],
};

export function validateStatusTransition(
  currentStatus: RequestStatus,
  nextStatus: RequestStatus
) {
  if (!allowedTransitions[currentStatus].includes(nextStatus)) {
    throw new AppError(
      409,
      "INVALID_STATUS_TRANSITION",
      `Cannot move request from ${currentStatus} to ${nextStatus}`
    );
  }
}

type RequestResolution =
  | "REFUND"
  | "REPLACEMENT"
  | "STORE_CREDIT";

export function validateApprovalDetails(
  resolution: RequestResolution | null,
  refundAmount: number | null
) {
  if (!resolution) {
    throw new AppError(
      422,
      "RESOLUTION_REQUIRED",
      "An approved request must have a resolution"
    );
  }

  if (resolution === "REFUND") {
    if (refundAmount === null || refundAmount <= 0) {
      throw new AppError(
        422,
        "INVALID_REFUND_AMOUNT",
        "Refund amount must be greater than zero"
      );
    }

    return;
  }

  if (refundAmount !== null) {
    throw new AppError(
      422,
      "REFUND_AMOUNT_NOT_ALLOWED",
      "Refund amount is only allowed for a refund resolution"
    );
  }
}


export async function changeStatus(
  id: string,
  nextStatus: RequestStatus,
  resolution: RequestResolution | null = null,
  refundAmount: number | null = null
) {
  const request = await findRequestById(id);

  if (!request) {
    throw new AppError(
      404,
      "REQUEST_NOT_FOUND",
      "Return request not found"
    );
  }

  validateStatusTransition(request.status, nextStatus);

  if (nextStatus === "APPROVED") {
    validateApprovalDetails(resolution, refundAmount);
  } else if (resolution !== null || refundAmount !== null) {
    throw new AppError(
      422,
      "RESOLUTION_NOT_ALLOWED",
      "Resolution details are only allowed when approving a request"
    );
  }

  return updateRequestStatus(
    id,
    nextStatus,
    resolution,
    refundAmount
  );
}


export async function updateRequestDetails(
  id: string,
  input: UpdateRequestInput
) {
  const request = await findRequestById(id);

  if (!request) {
    throw new AppError(
      404,
      "REQUEST_NOT_FOUND",
      "Return request not found"
    );
  }

  if (request.status !== "OPEN" && request.status !== "IN_REVIEW") {
    throw new AppError(
      409,
      "REQUEST_NOT_EDITABLE",
      "Request details cannot be edited after a decision"
    );
  }

  return updateRequest(id, input);
}

import { softRemoveRequest } from "@/server/repositories/requestMutations";

export async function removeRequest(id: string) {
  const request = await findRequestById(id);

  if (!request) {
    throw new AppError(
      404,
      "REQUEST_NOT_FOUND",
      "Return request not found"
    );
  }

  if (request.status !== "OPEN" && request.status !== "REJECTED") {
    throw new AppError(
      409,
      "REQUEST_NOT_REMOVABLE",
      "Only open or rejected requests can be removed"
    );
  }

  return softRemoveRequest(id);
}
