// app/choose-brand/ChooseBrandClient.jsx
"use client";

import { useSearchParams } from "next/navigation";
import SeriesListing from "./SeriesListing";

const ChooseBrandClient = () => {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("categoryId");

  return (
    <main>
      <SeriesListing categoryId={categoryId} />
    </main>
  );
};

export default ChooseBrandClient;
