// app/choose-brand/page.jsx
import { Suspense } from "react";
import ChooseModelsClient from "./components/ChooseModelsClient";

export const metadata = {
  title: "Choose Phone Brand | Mobile Display Seller",
  description: "Select your phone brand to find compatible replacement parts such as displays, batteries, and more at Mobile Display Seller.",
};

const ChooseBrandPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChooseModelsClient />
    </Suspense>
  );
};

export default ChooseBrandPage;
