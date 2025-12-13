import parse from "html-react-parser";

export default function Description({ product }) {
  const defaultDescription = `
    <p>
      Got a broken display in your Samsung Galaxy S10 Plus? Buy the complete LCD
      with Touch Screen and replace your damaged screen with confidence.
    </p>
  `;

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-8 border border-gray-100 rounded-md">
      <div className="pt-10">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6 border-b border-gray-400 pb-2">
          Product Details
        </h2>

        {/* HTML rendering */}
        <div
          className="product-description text-sm md:text-base leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: product?.description || defaultDescription,
          }}
        />
      </div>
    </section>
  );
}
