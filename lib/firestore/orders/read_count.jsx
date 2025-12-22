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

/**
 * Helper to safely format currency values
 * Fixes floating point issues like 6845.799999999999
 */
const formatAmount = (value) => {
  if (!value || isNaN(value)) return 0;
  return Number(value.toFixed(2)); // ✅ round to 2 decimals
};

export const getOrdersCounts = async ({ date }) => {
  const ref = collection(db, "orders");

  let q = query(ref, where("status", "==", "delivered"));

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

  const snapshot = await getAggregateFromServer(q, {
    deliveredRevenue: sum("payment.amount"),
    totalOrders: count(),
  });

  const data = snapshot.data();

  const result = {
    totalOrders: data.totalOrders || 0,
    deliveredRevenue: formatAmount(data.deliveredRevenue || 0), // ✅ FIXED
  };

  if (date) {
    const d = new Date(date);
    return {
      date: `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`,
      ...result,
    };
  }

  return result;
};

const getTotalOrdersCounts = async (dates) => {
  const list = dates?.map((d) => getOrdersCounts({ date: d })) || [];
  return Promise.all(list);
};

export function useOrdersCounts() {
  const { data, error, isLoading } = useSWR("orders_counts", () =>
    getOrdersCounts({ date: null })
  );

  if (error) console.error(error.message);

  return { data, error, isLoading };
}

export function useOrdersCountsByTotalDays({ dates }) {
  const { data, error, isLoading } = useSWR(
    ["orders_count", dates],
    ([, dates]) =>
      getTotalOrdersCounts(
        dates?.sort(
          (a, b) => new Date(a).getTime() - new Date(b).getTime()
        )
      )
  );

  if (error) console.error(error.message);

  return { data, error, isLoading };
}
