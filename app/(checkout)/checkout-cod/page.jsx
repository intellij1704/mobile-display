import Footer from "@/app/components/Footer";
import Header from "@/app/components/header/Header";
import { admin, adminDB } from "@/lib/firebase_admin";
import Link from "next/link";
// Removed SuccessMessage import as it may be causing the unmount error (likely due to portal or DOM manipulation assumptions for prepaid checkout)

const fetchCheckout = async (checkoutId) => {
  const list = await adminDB
    .collectionGroup("checkout_sessions_cod")
    .where("id", "==", checkoutId)
    .limit(1) // Added limit(1) for efficiency since ID is unique
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

  // Calculate payment amount correctly for COD (using total from checkout, adjusted for currency units if needed)
  const paymentAmount = checkout?.total; // Use the pre-calculated total from COD checkout (in rupees, adjust if needed)

  await orderRef.set({
    checkout: checkout,
    payment: {
      amount: paymentAmount,
      mode: "cod", // Explicitly set mode for COD
    },
    uid: uid,
    id: checkout?.id,
    paymentMode: "cod",
    timestampCreate: admin.firestore.Timestamp.now(),
  });

  const productList = checkout?.line_items?.map((item) => { // Removed index and unnecessary key
    return {
      productId: item?.price_data?.product_data?.metadata?.productId,
      quantity: item?.quantity,
      selectedColor: item?.price_data?.product_data?.metadata?.selectedColor || null,
      selectedQuality: item?.price_data?.product_data?.metadata?.selectedQuality || null, // Added selectedQuality as per metadata
    };
  });

  // Removed console.logs for production readiness

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

export default async function Page({ searchParams }) {
  const { checkout_id } = searchParams;
  const checkout = await fetchCheckout(checkout_id);

  await processOrder({ checkout }); // Process order (idempotent, so safe on reloads)

  return (
    <main>
      <Header />
      {/* Removed SuccessMessage to avoid potential React unmount errors (e.g., portal removeChild on null) */}
      <section className="min-h-screen flex flex-col gap-3 justify-center items-center">
        <div className="flex justify-center w-full">
          <img src="/svgs/Mobile payments-rafiki.svg" className="h-48" alt="" />
        </div>
        <h1 className="text-2xl font-semibold text-green">
          Your Order Is{" "}
          <span className="font-bold text-green-600">Successfully</span> Placed
        </h1>
        <div className="flex items-center gap-4 text-sm">
          <Link href={"/orders"}>
            <button className="text-blue-600 border border-blue-600 px-5 py-2 rounded-lg bg-white">
              Go To Orders Page
            </button>
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}