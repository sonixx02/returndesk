import { AppError } from "@/server/errors/AppError";
import {
  findLiveRequestByOrderItem,
  findRequestById,
  listRequests,
  SORTABLE_COLUMNS,
  type RequestListOptions,
} from "@/server/repositories/requestQueries";
import { findNotesByRequestId } from "@/server/repositories/noteRepository";
import {
  createRequest,
  softRemoveRequest,
  updateRequest,
  updateRequestStatus,
  type CreateRequestInput,
  type UpdateRequestInput,
} from "@/server/repositories/requestMutations";

export function assertValidId(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    throw new AppError(400, "INVALID_ID", "That id is not a valid request id");
  }
}

const listableReasons = [
  "DAMAGED",
  "WRONG_ITEM",
  "SIZE_ISSUE",
  "NOT_AS_DESCRIBED",
  "CHANGED_MIND",
];

// Validate contact format (allows standard email format or phone numbers)
function isValidContact(contact: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
  return emailRegex.test(contact) || phoneRegex.test(contact);
}

// Validate field types, string length limits, and field formats
function validateRequestFields(input: UpdateRequestInput) {
  if (typeof input.customerName !== "string" || !input.customerName.trim()) {
    throw new AppError(422, "INVALID_CUSTOMER_NAME", "Customer name is required");
  }
  if (input.customerName.trim().length > 100) {
    throw new AppError(
      422,
      "INVALID_CUSTOMER_NAME",
      "Customer name cannot exceed 100 characters"
    );
  }

  if (typeof input.customerContact !== "string" || !input.customerContact.trim()) {
    throw new AppError(422, "INVALID_CUSTOMER_CONTACT", "Customer contact is required");
  }
  if (input.customerContact.trim().length > 100) {
    throw new AppError(
      422,
      "INVALID_CUSTOMER_CONTACT",
      "Customer contact cannot exceed 100 characters"
    );
  }
  if (!isValidContact(input.customerContact.trim())) {
    throw new AppError(
      422,
      "INVALID_CUSTOMER_CONTACT",
      "Customer contact must be a valid email or phone number"
    );
  }

  if (typeof input.orderNumber !== "string" || !input.orderNumber.trim()) {
    throw new AppError(422, "INVALID_ORDER_NUMBER", "Order number is required");
  }
  if (input.orderNumber.trim().length > 100) {
    throw new AppError(
      422,
      "INVALID_ORDER_NUMBER",
      "Order number cannot exceed 100 characters"
    );
  }

  if (typeof input.item !== "string" || !input.item.trim()) {
    throw new AppError(422, "INVALID_ITEM", "Item is required");
  }
  if (input.item.trim().length > 100) {
    throw new AppError(
      422,
      "INVALID_ITEM",
      "Item name cannot exceed 100 characters"
    );
  }

  if (
    typeof input.quantity !== "number" ||
    !Number.isInteger(input.quantity) ||
    input.quantity <= 0 ||
    input.quantity > 1000
  ) {
    throw new AppError(
      422,
      "INVALID_QUANTITY",
      "Quantity must be an integer between 1 and 1000"
    );
  }

  if (!listableReasons.includes(input.reason)) {
    throw new AppError(
      422,
      "INVALID_REASON",
      `reason must be one of: ${listableReasons.join(", ")}`
    );
  }
}

export async function createNewRequest(input: CreateRequestInput) {
  validateRequestFields(input);

  // Prevent duplicate live requests for the same order number and item
  const existingLive = await findLiveRequestByOrderItem(
    input.orderNumber,
    input.item
  );
  if (existingLive) {
    throw new AppError(
      409,
      "DUPLICATE_LIVE_REQUEST",
      "A live return request already exists for this order and item"
    );
  }

  return createRequest(input);
}


type ListRequestsParams = {
  search?: string;
  status?: string;
  reason?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: string;
  pageSize?: string;
};

const listableStatuses = [
  "OPEN",
  "IN_REVIEW",
  "APPROVED",
  "REJECTED",
  "COMPLETED",
];

export async function listExistingRequests(params: ListRequestsParams) {
  if (params.status && !listableStatuses.includes(params.status)) {
    throw new AppError(
      422,
      "INVALID_STATUS",
      `status must be one of: ${listableStatuses.join(", ")}`
    );
  }

  if (params.reason && !listableReasons.includes(params.reason)) {
    throw new AppError(
      422,
      "INVALID_REASON",
      `reason must be one of: ${listableReasons.join(", ")}`
    );
  }

  if (params.sortBy && !SORTABLE_COLUMNS.includes(params.sortBy)) {
    throw new AppError(
      422,
      "INVALID_SORT_BY",
      `sortBy must be one of: ${SORTABLE_COLUMNS.join(", ")}`
    );
  }

  if (
    params.sortOrder &&
    params.sortOrder !== "asc" &&
    params.sortOrder !== "desc"
  ) {
    throw new AppError(
      422,
      "INVALID_SORT_ORDER",
      "sortOrder must be asc or desc"
    );
  }

  const page = params.page ? Number(params.page) : 1;

  if (!Number.isInteger(page) || page < 1) {
    throw new AppError(422, "INVALID_PAGE", "page must be a positive integer");
  }

  const pageSize = params.pageSize ? Number(params.pageSize) : 20;

  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
    throw new AppError(
      422,
      "INVALID_PAGE_SIZE",
      "pageSize must be an integer between 1 and 100"
    );
  }

  const data = await listRequests({
    search: params.search,
    status: params.status as RequestListOptions["status"],
    reason: params.reason as RequestListOptions["reason"],
    sortBy: params.sortBy as RequestListOptions["sortBy"],
    sortOrder: params.sortOrder as RequestListOptions["sortOrder"],
    page,
    pageSize,
  });

  return { data, page, hasMore: data.length === pageSize };
}

export async function getRequestWithNotes(id: string) {
  assertValidId(id);

  const request = await findRequestById(id);

  if (!request) {
    throw new AppError(404, "REQUEST_NOT_FOUND", "Return request not found");
  }

  const notes = await findNotesByRequestId(id);

  return { ...request, notes };
}

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

const resolutions = ["REFUND", "REPLACEMENT", "STORE_CREDIT"];

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

  if (!resolutions.includes(resolution)) {
    throw new AppError(
      422,
      "INVALID_RESOLUTION",
      `resolution must be one of: ${resolutions.join(", ")}`
    );
  }

  if (resolution === "REFUND") {
    if (
      refundAmount === null ||
      typeof refundAmount !== "number" ||
      !Number.isInteger(refundAmount) ||
      refundAmount <= 0 ||
      refundAmount > 10000000
    ) {
      throw new AppError(
        422,
        "INVALID_REFUND_AMOUNT",
        "Refund amount must be a positive integer up to 10,000,000"
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
  assertValidId(id);

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
  assertValidId(id);
  validateRequestFields(input);

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

  const existingLive = await findLiveRequestByOrderItem(
    input.orderNumber,
    input.item,
    id
  );
  if (existingLive) {
    throw new AppError(
      409,
      "DUPLICATE_LIVE_REQUEST",
      "A live return request already exists for this order and item"
    );
  }

  return updateRequest(id, input);
}

export async function removeRequest(id: string) {
  assertValidId(id);

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

