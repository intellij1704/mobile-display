const functions = require("firebase-functions");
const admin = require("firebase-admin");
const fetch = require("node-fetch");

admin.initializeApp();
const db = admin.firestore();

// Mapping
const shipmozoToInternal = {
  "NEW ORDER": "pending",
  "Pickup Pending": "shipped",
  "Waiting for Pickup": "shipped",
  "Order Picked Up": "pickup",
  "In-Transit": "inTransit",
  "Out For Delivery": "outForDelivery",
  "Undelivered": "undelivered",
  "Delivered": "delivered",
  "CANCELLED": "cancelled",
  "RTO": "rto",
};

// Runs every 15 minutes
exports.syncShipmozoStatus = functions.pubsub
  .schedule("every 1 minutes")
  .onRun(async () => {

    console.log("⏳ Auto-sync Shipmozo statuses started...");

    const ordersSnap = await db.collection("orders")
      .where("status", "not-in", ["delivered", "cancelled"])
      .get();

    for (const doc of ordersSnap.docs) {
      const order = doc.data();
      const shipmozoId = order.shipmozoOrderId;

      if (!shipmozoId) continue;

      try {
        const response = await fetch(
          `https://shipping-api.com/app/api/v1/get-order-detail/${shipmozoId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "public-key": process.env.SHIPMOZO_PUBLIC,
              "private-key": process.env.SHIPMOZO_PRIVATE,
            },
          }
        );

        const result = await response.json();
        const data = result?.data?.[0];

        if (!data) continue;

        const shipmozoStatus = data.order_status;
        const internalStatus = shipmozoToInternal[shipmozoStatus];

        if (internalStatus && internalStatus !== order.status) {
          await doc.ref.update({
            status: internalStatus,
            trackingStatus: shipmozoStatus,
            lastSyncedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          console.log(`✅ Order ${doc.id} synced → ${internalStatus}`);
        }

      } catch (err) {
        console.error(`❌ Error syncing order ${doc.id}:`, err);
      }
    }

    return null;
  });
