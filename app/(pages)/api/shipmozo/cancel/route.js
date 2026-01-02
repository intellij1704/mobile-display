import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { orderId, awbNumber } = body;

    if (!orderId || !awbNumber) {
      return NextResponse.json(
        { error: "orderId and awbNumber are required" },
        { status: 400 }
      );
    }

    const res = await fetch(
      "https://shipping-api.com/app/api/v1/cancel-order",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "public-key": process.env.NEXT_PUBLIC_SHIPMOZO_PUBLIC_KEY,
          "private-key": process.env.SHIPMOZO_PRIVATE_KEY, // ✅ SERVER ONLY
        },
        body: JSON.stringify({
          order_id: orderId,
          awb_number: awbNumber,
        }),
      }
    );

    const result = await res.json();

    return NextResponse.json(result);
  } catch (err) {
    console.error("Shipmozo cancel error:", err);

    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
