// app/choose-brand/ChooseBrandClient.jsx
"use client";

import { useSearchParams } from "next/navigation";
import BrandListing from "./BrandListing";

const ChooseBrandClient = () => {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("categoryId");

  return (
    <main>
      <BrandListing categoryId={categoryId} />
    </main>
  );
};

export default ChooseBrandClient;
