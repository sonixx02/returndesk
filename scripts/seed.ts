import "dotenv/config";

import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

type SeedRequest = {
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
  status:
    | "OPEN"
    | "IN_REVIEW"
    | "APPROVED"
    | "REJECTED"
    | "COMPLETED";
  resolution?: "REFUND" | "REPLACEMENT" | "STORE_CREDIT";
  refundAmount?: number;
  notes?: string[];
};

const requests: SeedRequest[] = [
  {
    customerName: "Aarav Mehta",
    customerContact: "aarav@example.com",
    orderNumber: "ORD-1001",
    item: "Classic Cotton Shirt",
    quantity: 1,
    reason: "DAMAGED",
    status: "OPEN",
    notes: ["Customer reported a damaged sleeve."],
  },
  {
    customerName: "Riya Shah",
    customerContact: "riya@example.com",
    orderNumber: "ORD-1002",
    item: "Running Shoes",
    quantity: 1,
    reason: "SIZE_ISSUE",
    status: "OPEN",
  },
  {
    customerName: "Kabir Patel",
    customerContact: "kabir@example.com",
    orderNumber: "ORD-1003",
    item: "Wireless Headphones",
    quantity: 1,
    reason: "WRONG_ITEM",
    status: "OPEN",
  },
  {
    customerName: "Ananya Rao",
    customerContact: "ananya@example.com",
    orderNumber: "ORD-1004",
    item: "Travel Backpack",
    quantity: 1,
    reason: "NOT_AS_DESCRIBED",
    status: "OPEN",
  },
  {
    customerName: "Vivaan Joshi",
    customerContact: "vivaan@example.com",
    orderNumber: "ORD-1005",
    item: "Denim Jacket",
    quantity: 1,
    reason: "CHANGED_MIND",
    status: "OPEN",
  },
  {
    customerName: "Ishita Nair",
    customerContact: "ishita@example.com",
    orderNumber: "ORD-1006",
    item: "Ceramic Mug Set",
    quantity: 2,
    reason: "DAMAGED",
    status: "OPEN",
  },
  {
    customerName: "Arjun Kapoor",
    customerContact: "arjun@example.com",
    orderNumber: "ORD-1007",
    item: "Formal Trousers",
    quantity: 1,
    reason: "SIZE_ISSUE",
    status: "OPEN",
  },
  {
    customerName: "Meera Iyer",
    customerContact: "meera@example.com",
    orderNumber: "ORD-1008",
    item: "Desk Lamp",
    quantity: 1,
    reason: "NOT_AS_DESCRIBED",
    status: "OPEN",
  },

  {
    customerName: "Aditya Verma",
    customerContact: "aditya@example.com",
    orderNumber: "ORD-1009",
    item: "Bluetooth Speaker",
    quantity: 1,
    reason: "WRONG_ITEM",
    status: "IN_REVIEW",
    notes: [
      "Support agent started reviewing the order.",
      "Warehouse details requested.",
    ],
  },
  {
    customerName: "Sana Khan",
    customerContact: "sana@example.com",
    orderNumber: "ORD-1010",
    item: "Linen Shirt",
    quantity: 1,
    reason: "SIZE_ISSUE",
    status: "IN_REVIEW",
  },
  {
    customerName: "Neil Desai",
    customerContact: "neil@example.com",
    orderNumber: "ORD-1011",
    item: "Coffee Maker",
    quantity: 1,
    reason: "DAMAGED",
    status: "IN_REVIEW",
  },
  {
    customerName: "Tara Malhotra",
    customerContact: "tara@example.com",
    orderNumber: "ORD-1012",
    item: "Canvas Shoes",
    quantity: 1,
    reason: "CHANGED_MIND",
    status: "IN_REVIEW",
    notes: ["Customer confirmed the item is unused."],
  },
  {
    customerName: "Rahul Bhat",
    customerContact: "rahul@example.com",
    orderNumber: "ORD-1013",
    item: "Laptop Stand",
    quantity: 1,
    reason: "NOT_AS_DESCRIBED",
    status: "IN_REVIEW",
  },
  {
    customerName: "Nisha Kulkarni",
    customerContact: "nisha@example.com",
    orderNumber: "ORD-1014",
    item: "Yoga Mat",
    quantity: 1,
    reason: "DAMAGED",
    status: "IN_REVIEW",
  },
  {
    customerName: "Karan Gupta",
    customerContact: "karan@example.com",
    orderNumber: "ORD-1015",
    item: "Casual Sneakers",
    quantity: 1,
    reason: "WRONG_ITEM",
    status: "IN_REVIEW",
  },

  {
    customerName: "Dev Mehta",
    customerContact: "dev@example.com",
    orderNumber: "ORD-1016",
    item: "Mechanical Keyboard",
    quantity: 1,
    reason: "DAMAGED",
    status: "APPROVED",
    resolution: "REFUND",
    refundAmount: 499900,
    notes: ["Refund approved after inspection."],
  },
  {
    customerName: "Pooja Shah",
    customerContact: "pooja@example.com",
    orderNumber: "ORD-1017",
    item: "Running T-Shirt",
    quantity: 2,
    reason: "SIZE_ISSUE",
    status: "APPROVED",
    resolution: "REPLACEMENT",
    notes: ["Replacement size confirmed with customer."],
  },
  {
    customerName: "Yash Agarwal",
    customerContact: "yash@example.com",
    orderNumber: "ORD-1018",
    item: "Backpack",
    quantity: 1,
    reason: "NOT_AS_DESCRIBED",
    status: "APPROVED",
    resolution: "STORE_CREDIT",
  },
  {
    customerName: "Simran Rao",
    customerContact: "simran@example.com",
    orderNumber: "ORD-1019",
    item: "Smart Watch",
    quantity: 1,
    reason: "WRONG_ITEM",
    status: "APPROVED",
    resolution: "REFUND",
    refundAmount: 799900,
  },
  {
    customerName: "Manav Jain",
    customerContact: "manav@example.com",
    orderNumber: "ORD-1020",
    item: "Hoodie",
    quantity: 1,
    reason: "CHANGED_MIND",
    status: "APPROVED",
    resolution: "REPLACEMENT",
    notes: ["Replacement requested instead of refund."],
  },
  {
    customerName: "Aditi Menon",
    customerContact: "aditi@example.com",
    orderNumber: "ORD-1021",
    item: "Table Lamp",
    quantity: 1,
    reason: "DAMAGED",
    status: "APPROVED",
    resolution: "STORE_CREDIT",
  },

  {
    customerName: "Rohan Sethi",
    customerContact: "rohan@example.com",
    orderNumber: "ORD-1022",
    item: "Leather Wallet",
    quantity: 1,
    reason: "DAMAGED",
    status: "REJECTED",
    notes: ["Return rejected because the item showed signs of use."],
  },
  {
    customerName: "Ira Kapoor",
    customerContact: "ira@example.com",
    orderNumber: "ORD-1023",
    item: "Sunglasses",
    quantity: 1,
    reason: "CHANGED_MIND",
    status: "REJECTED",
  },
  {
    customerName: "Varun Rao",
    customerContact: "varun@example.com",
    orderNumber: "ORD-1024",
    item: "Phone Case",
    quantity: 1,
    reason: "WRONG_ITEM",
    status: "REJECTED",
  },
  {
    customerName: "Sneha Pillai",
    customerContact: "sneha@example.com",
    orderNumber: "ORD-1025",
    item: "Water Bottle",
    quantity: 1,
    reason: "NOT_AS_DESCRIBED",
    status: "REJECTED",
  },
  {
    customerName: "Aman Khanna",
    customerContact: "aman@example.com",
    orderNumber: "ORD-1026",
    item: "Formal Shirt",
    quantity: 1,
    reason: "SIZE_ISSUE",
    status: "REJECTED",
  },

  {
    customerName: "Zoya Ali",
    customerContact: "zoya@example.com",
    orderNumber: "ORD-1027",
    item: "Bluetooth Earbuds",
    quantity: 1,
    reason: "DAMAGED",
    status: "COMPLETED",
    resolution: "REFUND",
    refundAmount: 299900,
    notes: ["Refund completed successfully."],
  },
  {
    customerName: "Harsh Vora",
    customerContact: "harsh@example.com",
    orderNumber: "ORD-1028",
    item: "Oxford Shirt",
    quantity: 1,
    reason: "SIZE_ISSUE",
    status: "COMPLETED",
    resolution: "REPLACEMENT",
  },
  {
    customerName: "Maya Fernandes",
    customerContact: "maya@example.com",
    orderNumber: "ORD-1029",
    item: "Kitchen Scale",
    quantity: 1,
    reason: "NOT_AS_DESCRIBED",
    status: "COMPLETED",
    resolution: "STORE_CREDIT",
  },
  {
    customerName: "Ritesh Singh",
    customerContact: "ritesh@example.com",
    orderNumber: "ORD-1030",
    item: "Casual Backpack",
    quantity: 1,
    reason: "CHANGED_MIND",
    status: "COMPLETED",
    resolution: "REFUND",
    refundAmount: 189900,
    notes: [
      "Customer confirmed return delivery.",
      "Refund completed.",
    ],
  },
];

async function seed() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const request of requests) {
      const result = await client.query(
        `
          INSERT INTO requests (
            customer_name,
            customer_contact,
            order_number,
            item,
            quantity,
            reason,
            status,
            resolution,
            refund_amount
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING id, reference_number
        `,
        [
          request.customerName,
          request.customerContact,
          request.orderNumber,
          request.item,
          request.quantity,
          request.reason,
          request.status,
          request.resolution ?? null,
          request.refundAmount ?? null,
        ]
      );

      const { id, reference_number } = result.rows[0];

      for (const content of request.notes ?? []) {
        await client.query(
          `
            INSERT INTO notes (request_id, content)
            VALUES ($1, $2)
          `,
          [id, content]
        );
      }

      console.log(`Seeded ${reference_number}`);
    }

    await client.query("COMMIT");

    console.log(`Seed complete: ${requests.length} requests.`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
