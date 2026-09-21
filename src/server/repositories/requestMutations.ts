import { db } from "@/lib/db";

export type CreateRequestInput = {
  customerName: string;
  customerContact: string;
  orderNumber: string;
  item: string;
  quantity: number;
  reason:
    | "DAMAGED"
    | "WRONG_ITEM"
    | "SIZE_ISSUE"
    | "NOT_AS_DESCRIBED"
    | "CHANGED_MIND";
};

export async function createRequest(input: CreateRequestInput) {
  const result = await db.query(
    `
      INSERT INTO requests (
        customer_name,
        customer_contact,
        order_number,
        item,
        quantity,
        reason
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
    [
      input.customerName,
      input.customerContact,
      input.orderNumber,
      input.item,
      input.quantity,
      input.reason,
    ]
  );

  return result.rows[0];
}

export type UpdateRequestInput = {
  customerName: string;
  customerContact: string;
  orderNumber: string;
  item: string;
  quantity: number;
  reason:
    | "DAMAGED"
    | "WRONG_ITEM"
    | "SIZE_ISSUE"
    | "NOT_AS_DESCRIBED"
    | "CHANGED_MIND";
};

export async function updateRequest(
  id: string,
  input: UpdateRequestInput
) {
  const result = await db.query(
    `
      UPDATE requests
      SET
        customer_name = $1,
        customer_contact = $2,
        order_number = $3,
        item = $4,
        quantity = $5,
        reason = $6,
        updated_at = NOW()
      WHERE id = $7
        AND removed_at IS NULL
      RETURNING *
    `,
    [
      input.customerName,
      input.customerContact,
      input.orderNumber,
      input.item,
      input.quantity,
      input.reason,
      id,
    ]
  );

  return result.rows[0] ?? null;
}

export async function updateRequestStatus(
  id: string,
  status:
    | "OPEN"
    | "IN_REVIEW"
    | "APPROVED"
    | "REJECTED"
    | "COMPLETED",
  resolution:
    | "REFUND"
    | "REPLACEMENT"
    | "STORE_CREDIT"
    | null = null,
  refundAmount: number | null = null
) {
  const result = await db.query(
    `
      UPDATE requests
      SET
        status = $1,
        resolution = $2,
        refund_amount = $3,
        updated_at = NOW()
      WHERE id = $4
        AND removed_at IS NULL
      RETURNING *
    `,
    [status, resolution, refundAmount, id]
  );

  return result.rows[0] ?? null;
}

export async function softRemoveRequest(id: string) {
  const result = await db.query(
    `
      UPDATE requests
      SET
        removed_at = NOW(),
        updated_at = NOW()
      WHERE id = $1
        AND removed_at IS NULL
      RETURNING *
    `,
    [id]
  );

  return result.rows[0] ?? null;
}
