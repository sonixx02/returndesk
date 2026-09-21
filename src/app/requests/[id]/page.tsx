"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const REASONS = [
  "DAMAGED",
  "WRONG_ITEM",
  "SIZE_ISSUE",
  "NOT_AS_DESCRIBED",
  "CHANGED_MIND",
];

const RESOLUTIONS = ["REFUND", "REPLACEMENT", "STORE_CREDIT"];

const allowedTransitions: Record<string, string[]> = {
  OPEN: ["IN_REVIEW"],
  IN_REVIEW: ["APPROVED", "REJECTED"],
  APPROVED: ["COMPLETED"],
  REJECTED: [],
  COMPLETED: [],
};

const statusColors: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  IN_REVIEW: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  COMPLETED: "bg-gray-200 text-gray-700",
};

type Note = { id: string; content: string; created_at: string };

type RequestDetail = {
  id: string;
  reference_number: string;
  customer_name: string;
  customer_contact: string;
  order_number: string;
  item: string;
  quantity: number;
  reason: string;
  status: string;
  resolution: string | null;
  refund_amount: number | null;
  notes: Note[];
};

export default function RequestDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [data, setData] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [actionError, setActionError] = useState("");
  const [actionPending, setActionPending] = useState(false);

  const [approving, setApproving] = useState(false);
  const [resolution, setResolution] = useState("REFUND");
  const [refundAmount, setRefundAmount] = useState("");

  const [noteContent, setNoteContent] = useState("");

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    customerContact: "",
    orderNumber: "",
    item: "",
    quantity: "1",
    reason: "DAMAGED",
  });

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/requests/${params.id}`);
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error?.message ?? "Something went wrong");
      }
      setData(body.data);
      setForm({
        customerName: body.data.customer_name,
        customerContact: body.data.customer_contact,
        orderNumber: body.data.order_number,
        item: body.data.item,
        quantity: String(body.data.quantity),
        reason: body.data.reason,
      });
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    let isCancelled = false;

    async function fetchData() {
      try {
        const res = await fetch(`/api/requests/${params.id}`);
        const body = await res.json();
        if (isCancelled) return;
        if (!res.ok) {
          throw new Error(body.error?.message ?? "Something went wrong");
        }
        setData(body.data);
        setForm({
          customerName: body.data.customer_name,
          customerContact: body.data.customer_contact,
          orderNumber: body.data.order_number,
          item: body.data.item,
          quantity: String(body.data.quantity),
          reason: body.data.reason,
        });
      } catch (err) {
        if (!isCancelled) {
          setLoadError(err instanceof Error ? err.message : "Something went wrong");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [params.id]);


  async function handleStatusChange(nextStatus: string) {
    setActionError("");
    setActionPending(true);
    try {
      const res = await fetch(`/api/requests/${params.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          nextStatus === "APPROVED"
            ? {
                status: nextStatus,
                resolution,
                refundAmount:
                  resolution === "REFUND" ? Number(refundAmount) : null,
              }
            : { status: nextStatus }
        ),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error?.message ?? "Something went wrong");
      }
      setApproving(false);
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setActionPending(false);
    }
  }

  async function handleRemove() {
    setActionError("");
    setActionPending(true);
    try {
      const res = await fetch(`/api/requests/${params.id}`, {
        method: "DELETE",
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error?.message ?? "Something went wrong");
      }
      router.push("/");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Something went wrong");
      setActionPending(false);
    }
  }

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    setActionError("");
    setActionPending(true);
    try {
      const res = await fetch(`/api/requests/${params.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: noteContent }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error?.message ?? "Something went wrong");
      }
      setNoteContent("");
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setActionPending(false);
    }
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    setActionError("");
    setActionPending(true);
    try {
      const res = await fetch(`/api/requests/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, quantity: Number(form.quantity) }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error?.message ?? "Something went wrong");
      }
      setEditing(false);
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setActionPending(false);
    }
  }

  if (loading) {
    return (
      <main className="max-w-2xl mx-auto p-4">
        <p className="text-sm text-gray-500">Loading…</p>
      </main>
    );
  }

  if (loadError || !data) {
    return (
      <main className="max-w-2xl mx-auto p-4">
        <p className="text-red-600 text-sm mb-3">{loadError}</p>
        <Link href="/" className="text-sm underline">
          Back to list
        </Link>
      </main>
    );
  }

  const editable = data.status === "OPEN" || data.status === "IN_REVIEW";
  const removable = data.status === "OPEN" || data.status === "REJECTED";
  const nextStatuses = allowedTransitions[data.status] ?? [];

  return (
    <main className="max-w-2xl mx-auto p-4 w-full">
      <div className="flex items-center justify-between mb-4 gap-2">
        <h1 className="text-xl font-semibold">{data.reference_number}</h1>
        <Link href="/" className="text-sm underline">
          Back to list
        </Link>
      </div>

      <div className="border rounded p-4 mb-4">
        <span
          className={`inline-block px-2 py-1 rounded text-xs mb-3 ${statusColors[data.status]}`}
        >
          {data.status}
        </span>

        {!editing ? (
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500">Customer:</span>{" "}
              {data.customer_name}
            </div>
            <div>
              <span className="text-gray-500">Contact:</span>{" "}
              {data.customer_contact}
            </div>
            <div>
              <span className="text-gray-500">Order:</span> {data.order_number}
            </div>
            <div>
              <span className="text-gray-500">Item:</span> {data.item}
            </div>
            <div>
              <span className="text-gray-500">Quantity:</span> {data.quantity}
            </div>
            <div>
              <span className="text-gray-500">Reason:</span> {data.reason}
            </div>
            {data.resolution && (
              <div>
                <span className="text-gray-500">Resolution:</span>{" "}
                {data.resolution}
              </div>
            )}
            {data.refund_amount !== null && (
              <div>
                <span className="text-gray-500">Refund:</span>{" "}
                {data.refund_amount}
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleEditSubmit} className="flex flex-col gap-2 text-sm">
            <input
              required
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              className="border rounded px-2 py-1"
              placeholder="Customer name"
            />
            <input
              required
              value={form.customerContact}
              onChange={(e) =>
                setForm({ ...form, customerContact: e.target.value })
              }
              className="border rounded px-2 py-1"
              placeholder="Customer contact"
            />
            <input
              required
              value={form.orderNumber}
              onChange={(e) => setForm({ ...form, orderNumber: e.target.value })}
              className="border rounded px-2 py-1"
              placeholder="Order number"
            />
            <input
              required
              value={form.item}
              onChange={(e) => setForm({ ...form, item: e.target.value })}
              className="border rounded px-2 py-1"
              placeholder="Item"
            />
            <input
              required
              type="number"
              min={1}
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className="border rounded px-2 py-1"
              placeholder="Quantity"
            />
            <select
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="border rounded px-2 py-1"
            >
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={actionPending}
                className="bg-black text-white rounded px-3 py-1 text-sm disabled:opacity-40"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="border rounded px-3 py-1 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {!editing && editable && (
          <button
            onClick={() => setEditing(true)}
            className="border rounded px-3 py-1 text-sm mt-3"
          >
            Edit
          </button>
        )}
      </div>

      {actionError && <p className="text-red-600 text-sm mb-3">{actionError}</p>}

      <div className="flex flex-wrap gap-2 mb-4">
        {nextStatuses.map((next) =>
          next === "APPROVED" ? (
            <button
              key={next}
              disabled={actionPending}
              onClick={() => setApproving(true)}
              className="border rounded px-3 py-1 text-sm disabled:opacity-40"
            >
              Approve
            </button>
          ) : (
            <button
              key={next}
              disabled={actionPending}
              onClick={() => handleStatusChange(next)}
              className="border rounded px-3 py-1 text-sm disabled:opacity-40"
            >
              Move to {next}
            </button>
          )
        )}
        {removable && (
          <button
            disabled={actionPending}
            onClick={handleRemove}
            className="border rounded px-3 py-1 text-sm text-red-600 disabled:opacity-40"
          >
            Remove
          </button>
        )}
      </div>

      {approving && (
        <div className="border rounded p-3 mb-4 flex flex-col gap-2 text-sm">
          <label className="flex flex-col gap-1">
            Resolution
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="border rounded px-2 py-1"
            >
              {RESOLUTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          {resolution === "REFUND" && (
            <label className="flex flex-col gap-1">
              Refund amount
              <input
                type="number"
                min={1}
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                className="border rounded px-2 py-1"
              />
            </label>
          )}
          <div className="flex gap-2">
            <button
              disabled={actionPending}
              onClick={() => handleStatusChange("APPROVED")}
              className="bg-black text-white rounded px-3 py-1 text-sm disabled:opacity-40"
            >
              Confirm Approve
            </button>
            <button
              onClick={() => setApproving(false)}
              className="border rounded px-3 py-1 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="border rounded p-4">
        <h2 className="font-medium mb-2 text-sm">Notes</h2>
        <ul className="flex flex-col gap-2 mb-3">
          {data.notes.length === 0 ? (
            <li className="text-sm text-gray-500">No notes yet.</li>
          ) : (
            data.notes.map((n) => (
              <li key={n.id} className="text-sm border-b pb-2">
                <p>{n.content}</p>
                <p className="text-xs text-gray-500">
                  {new Date(n.created_at).toLocaleString()}
                </p>
              </li>
            ))
          )}
        </ul>
        <form onSubmit={handleAddNote} className="flex flex-col gap-2">
          <textarea
            required
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
            rows={2}
            placeholder="Add a note"
          />
          <button
            type="submit"
            disabled={actionPending}
            className="border rounded px-3 py-1 text-sm self-start disabled:opacity-40"
          >
            Add Note
          </button>
        </form>
      </div>
    </main>
  );
}
