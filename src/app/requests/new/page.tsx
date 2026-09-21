"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const REASONS = [
  "DAMAGED",
  "WRONG_ITEM",
  "SIZE_ISSUE",
  "NOT_AS_DESCRIBED",
  "CHANGED_MIND",
];

export default function NewRequestPage() {
  const router = useRouter();

  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("DAMAGED");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerContact,
          orderNumber,
          item,
          quantity: Number(quantity),
          reason,
        }),
      });

      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.error?.message ?? "Something went wrong");
      }

      router.push(`/requests/${body.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <main className="max-w-lg mx-auto p-4 w-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">New Return Request</h1>
        <Link href="/" className="text-sm underline">
          Back to list
        </Link>
      </div>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Customer name
          <input
            required
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Customer contact
          <input
            required
            value={customerContact}
            onChange={(e) => setCustomerContact(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Order number
          <input
            required
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Item
          <input
            required
            value={item}
            onChange={(e) => setItem(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Quantity
          <input
            required
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Reason
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="border rounded px-2 py-1"
          >
            {REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="bg-black text-white rounded px-3 py-2 text-sm mt-2 disabled:opacity-40"
        >
          {submitting ? "Creating…" : "Create Request"}
        </button>
      </form>
    </main>
  );
}
