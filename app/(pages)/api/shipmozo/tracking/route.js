import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { error: "orderId is required" },
        { status: 400 }
      );
    }

    // 1️⃣ Get order detail
    const detailRes = await fetch(
      `https://shipping-api.com/app/api/v1/get-order-detail/${orderId}`,
      {
        headers: {
          "Content-Type": "application/json",
          "public-key": process.env.NEXT_PUBLIC_SHIPMOZO_PUBLIC_KEY,
          "private-key": process.env.SHIPMOZO_PRIVATE_KEY,
        },
        cache: "no-store",
      }
    );

    if (!detailRes.ok) {
      throw new Error("Failed to fetch order detail");
    }

    const detailData = await detailRes.json();
    const orderData = detailData?.data?.[0];

    if (!orderData) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const shipmozoStatus = orderData.order_status;
    const awb = orderData?.shipping_details?.awb_number;

    // 2️⃣ No AWB yet
    if (!awb) {
      return NextResponse.json({
        shipmozoStatus,
        tracking: null,
      });
    }

    // 3️⃣ Track order
    const trackRes = await fetch(
      `https://shipping-api.com/app/api/v1/track-order?awb_number=${awb}`,
      {
        headers: {
          "Content-Type": "application/json",
          "public-key": process.env.NEXT_PUBLIC_SHIPMOZO_PUBLIC_KEY,
          "private-key": process.env.SHIPMOZO_PRIVATE_KEY,
        },
        cache: "no-store",
      }
    );

    const trackData = await trackRes.json();

    return NextResponse.json({
      shipmozoStatus,
      tracking: trackData?.data || null,
    });
  } catch (err) {
    console.error("Shipmozo tracking error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
