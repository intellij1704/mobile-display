"use client";

import { db } from "@/lib/firebase";
import {
  collection,
  count,
  getAggregateFromServer,
  query,
  sum,
  where,
} from "firebase/firestore";
import useSWR from "swr";

export const getOrdersCounts = async ({ date }) => {
  const ref = collection(db, `orders`);
  let q = query(ref, where("status", "==", "delivered")); // ✅ only delivered orders

  if (date) {
    const fromDate = new Date(date);
    fromDate.setHours(0, 0, 0, 0);

    const toDate = new Date(date);
    toDate.setHours(23, 59, 59, 999);

    q = query(
      ref,
      where("status", "==", "delivered"),
      where("timestampCreate", ">=", fromDate),
      where("timestampCreate", "<=", toDate)
    );
  }

  const data = await getAggregateFromServer(q, {
    deliveredRevenue: sum("payment.amount"), // ✅ revenue of delivered
    totalOrders: count(), // ✅ count of delivered
  });

  if (date) {
    const d = new Date(date); // ensure always Date object
    return {
      date: `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`, // ✅ formatted
      ...data.data(),
    };
  }
  return data.data();
};

const getTotalOrdersCounts = async (dates) => {
  const promisesList = dates?.map((d) => getOrdersCounts({ date: d })) || [];
  return Promise.all(promisesList);
};

export function useOrdersCounts() {
  const { data, error, isLoading } = useSWR("ordrs_counts", () =>
    getOrdersCounts({ date: null })
  );
  if (error) console.log(error?.message);
  return { data, error, isLoading };
}

export function useOrdersCountsByTotalDays({ dates }) {
  const { data, error, isLoading } = useSWR(
    ["orders_count", dates],
    ([, dates]) =>
      getTotalOrdersCounts(
        dates?.sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      )
  );
  if (error) console.log(error?.message);
  return { data, error, isLoading };
}
