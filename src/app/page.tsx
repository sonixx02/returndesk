"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STATUSES = ["OPEN", "IN_REVIEW", "APPROVED", "REJECTED", "COMPLETED"];
const REASONS = [
  "DAMAGED",
  "WRONG_ITEM",
  "SIZE_ISSUE",
  "NOT_AS_DESCRIBED",
  "CHANGED_MIND",
];

const statusColors: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  IN_REVIEW: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  COMPLETED: "bg-gray-200 text-gray-700",
};

type RequestRow = {
  id: string;
  reference_number: string;
  customer_name: string;
  order_number: string;
  item: string;
  reason: string;
  status: string;
};

export default function Home() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [reason, setReason] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);

  const [data, setData] = useState<RequestRow[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      const trimmedSearch = search.trim();
      if (trimmedSearch) params.set("search", trimmedSearch);
      if (status) params.set("status", status);
      if (reason) params.set("reason", reason);
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);
      params.set("page", String(page));

      fetch(`/api/requests?${params.toString()}`, { signal: controller.signal })
        .then(async (res) => {
          const body = await res.json();
          if (!res.ok) {
            throw new Error(body.error?.message ?? "Something went wrong");
          }
          setData(body.data);
          setHasMore(body.hasMore);
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            setError(err instanceof Error ? err.message : "Something went wrong");
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setLoading(false);
          }
        });
    }, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [search, status, reason, sortBy, sortOrder, page]);


  return (
    <main className="max-w-5xl mx-auto p-4 w-full">
      <div className="flex items-center justify-between mb-4 gap-2">
        <h1 className="text-xl font-semibold">Return Requests</h1>
        <Link
          href="/requests/new"
          className="bg-black text-white px-3 py-2 rounded text-sm whitespace-nowrap"
        >
          New Request
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Search customer, order, reference"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="border rounded px-2 py-1 text-sm flex-1 min-w-[160px]"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            setPage(1);
          }}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="">All reasons</option>
          {REASONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setPage(1);
          }}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="created_at">Created</option>
          <option value="updated_at">Updated</option>
          <option value="reference_number">Reference</option>
          <option value="status">Status</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) => {
            setSortOrder(e.target.value);
            setPage(1);
          }}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>

      </div>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : data.length === 0 ? (
        <p className="text-sm text-gray-500">No requests match your filters.</p>
      ) : (
        <div className="overflow-x-auto border rounded">
          <table className="w-full text-sm border-collapse min-w-[640px]">
            <thead>
              <tr className="text-left border-b bg-gray-50">
                <th className="py-2 px-2">Reference</th>
                <th className="py-2 px-2">Customer</th>
                <th className="py-2 px-2">Order</th>
                <th className="py-2 px-2">Item</th>
                <th className="py-2 px-2">Reason</th>
                <th className="py-2 px-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-2">
                    <Link href={`/requests/${r.id}`} className="underline">
                      {r.reference_number}
                    </Link>
                  </td>
                  <td className="py-2 px-2">{r.customer_name}</td>
                  <td className="py-2 px-2">{r.order_number}</td>
                  <td className="py-2 px-2">{r.item}</td>
                  <td className="py-2 px-2">{r.reason}</td>
                  <td className="py-2 px-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${statusColors[r.status]}`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center gap-2 mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="border rounded px-3 py-1 text-sm disabled:opacity-40"
        >
          Prev
        </button>
        <span className="text-sm">Page {page}</span>
        <button
          disabled={!hasMore}
          onClick={() => setPage((p) => p + 1)}
          className="border rounded px-3 py-1 text-sm disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </main>
  );
}
