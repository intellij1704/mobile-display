// app/choose-brand/page.jsx
import { Suspense } from "react";
import ChooseSeriesClient from "./components/ChooseSeriesClient";

export const metadata = {
  title: "Choose Phone Brand | Mobile Display Seller",
  description: "Select your phone brand to find compatible replacement parts such as displays, batteries, and more at Mobile Display Seller.",
};

const ChooseSeiesPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChooseSeriesClient />
    </Suspense>
  );
};

export default ChooseSeiesPage;
