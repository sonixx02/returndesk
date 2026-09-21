import { db } from "@/lib/db";

export async function findRequestById(id: string) {
  const result = await db.query(
    `
      SELECT *
      FROM requests
      WHERE id = $1
        AND removed_at IS NULL
    `,
    [id]
  );

  return result.rows[0] ?? null;
}

export async function findLiveRequestByOrderItem(
  orderNumber: string,
  item: string,
  excludeId?: string
) {
  const values: unknown[] = [orderNumber.trim(), item.trim()];
  let idCondition = "";

  if (excludeId) {
    values.push(excludeId);
    idCondition = `AND id != $${values.length}`;
  }

  const result = await db.query(
    `
      SELECT id
      FROM requests
      WHERE LOWER(order_number) = LOWER($1)
        AND LOWER(item) = LOWER($2)
        AND status NOT IN ('REJECTED', 'COMPLETED')
        AND removed_at IS NULL
        ${idCondition}
      LIMIT 1
    `,
    values
  );

  return result.rows[0] ?? null;
}

export type RequestListOptions = {

  search?: string;
  status?:
    | "OPEN"
    | "IN_REVIEW"
    | "APPROVED"
    | "REJECTED"
    | "COMPLETED";
  reason?:
    | "DAMAGED"
    | "WRONG_ITEM"
    | "SIZE_ISSUE"
    | "NOT_AS_DESCRIBED"
    | "CHANGED_MIND";
  sortBy?: "created_at" | "updated_at" | "reference_number" | "status";
  sortOrder?: "asc" | "desc";
  page: number;
  pageSize: number;
};

const sortableColumns = {
  created_at: "created_at",
  updated_at: "updated_at",
  reference_number: "reference_number",
  status: "status",
} as const;

export const SORTABLE_COLUMNS = Object.keys(sortableColumns);

export async function listRequests(options: RequestListOptions) {
  const {
    search,
    status,
    reason,
    sortBy = "created_at",
    sortOrder = "desc",
    page,
    pageSize,
  } = options;

  const conditions = ["removed_at IS NULL"];
  const values: unknown[] = [];

  if (search) {
    values.push(`%${search}%`);
    const parameter = `$${values.length}`;

    conditions.push(`
      (
        customer_name ILIKE ${parameter}
        OR order_number ILIKE ${parameter}
        OR reference_number ILIKE ${parameter}
      )
    `);
  }

  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  if (reason) {
    values.push(reason);
    conditions.push(`reason = $${values.length}`);
  }

  const whereClause = conditions.join(" AND ");
  const column = sortableColumns[sortBy];
  const direction = sortOrder === "asc" ? "ASC" : "DESC";

  const offset = (page - 1) * pageSize;

  values.push(pageSize);
  const limitParameter = `$${values.length}`;

  values.push(offset);
  const offsetParameter = `$${values.length}`;

  const result = await db.query(
    `
      SELECT *
      FROM requests
      WHERE ${whereClause}
      ORDER BY ${column} ${direction}
      LIMIT ${limitParameter}
      OFFSET ${offsetParameter}
    `,
    values
  );

  return result.rows;
}
