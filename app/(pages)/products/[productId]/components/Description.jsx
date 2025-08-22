import parse from "html-react-parser";

export default function Description({ product }) {
  const defaultDescription = `
    Got a broken display in your Samsung Galaxy S10 Plus? Buy the complete LCD with Touch Screen for Samsung Galaxy S10 Plus - Black and replace the broken, cracked, or scratched screen in your handset. 100% Perfect fit with high manufacturing quality. With minimal technical know-how required, it is the easiest display to replace for your handset. 
    The replacement combo LCD with touch for Samsung Galaxy S10 Plus comes with a manufacturing defect warranty, and the shipping is done in secure packing to ensure you get the product in perfect shape.
  `;

  return (
    <section className="w-full py-10 px-4">
      <div className="max-w-8xl mx-auto bg-gray-100 p-0 md:p-10">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6 border-b border-gray-400">
          Product Details
        </h2>
        <div
          className="text-gray-600 text-sm md:text-lg leading-relaxed mb-6 mt-2"
          style={{
            fontFamily: "Montserrat, Arial, Helvetica, sans-serif",
            fontSize: "15px",
            color: "#090606",
            letterSpacing: "0.2px",
          }}
        >
          {product?.description ? parse(product.description) : defaultDescription}
          <style>{`
            ul {
              list-style-type: disc;
              padding-left: 17px;
              margin: 0 0 20px 0;
            }
            li {
              margin-bottom: 10px;
            }
          `}</style>
        </div>
      </div>
    </section>
  );
}