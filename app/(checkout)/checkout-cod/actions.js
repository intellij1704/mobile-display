// actions.js for /checkout-cod (in the same directory as page.js)
"use server";

import { admin, adminDB } from "@/lib/firebase_admin";

const fetchCheckout = async (checkoutId) => {
  const list = await adminDB
    .collectionGroup("checkout_sessions_cod")
    .where("id", "==", checkoutId)
    .limit(1)
    .get();
  if (list.docs.length === 0) {
    throw new Error("Invalid Checkout ID");
  }
  return list.docs[0].data();
};

const processOrder = async ({ checkout }) => {
  const orderRef = adminDB.doc(`orders/${checkout?.id}`);
  const order = await orderRef.get();
  if (order.exists) {
    return false;
  }
  const uid = checkout?.metadata?.uid;

  const paymentAmount = checkout?.total;

  await orderRef.set({
    checkout: checkout,
    payment: {
      amount: paymentAmount,
      mode: "cod",
    },
    uid: uid,
    id: checkout?.id,
    paymentMode: "cod",
    timestampCreate: admin.firestore.Timestamp.now(),
  });

  const productList = checkout?.line_items?.map((item) => {
    return {
      productId: item?.price_data?.product_data?.metadata?.productId,
      quantity: item?.quantity,
      selectedColor:
        item?.price_data?.product_data?.metadata?.selectedColor || null,
      selectedQuality:
        item?.price_data?.product_data?.metadata?.selectedQuality || null,
    };
  });

  const userRef = adminDB.doc(`users/${uid}`);
  const user = await userRef.get();

  const productIdsList = productList?.map((item) => item?.productId);

  const newCartList = (user?.data()?.carts ?? []).filter(
    (cartItem) => !productIdsList.includes(cartItem?.id)
  );

  await userRef.set(
    {
      carts: newCartList,
    },
    { merge: true }
  );

  const batch = adminDB.batch();

  productList?.forEach((item) => {
    batch.update(adminDB.doc(`products/${item?.productId}`), {
      orders: admin.firestore.FieldValue.increment(item?.quantity),
    });
  });

  await batch.commit();
  return true;
};

export async function fetchAndProcessCheckout(checkoutId) {
  const checkout = await fetchCheckout(checkoutId);
  await processOrder({ checkout });
  return { success: true };
}
