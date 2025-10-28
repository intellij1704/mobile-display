// ShippingLabel.jsx
import React, { useRef } from "react";
import html2pdf from "html2pdf.js";
import JsBarcode from "jsbarcode";

/**
 * Props:
 *  - selectedReturn: object
 *  - selfShippingDetails: object
 */
export default function ShippingLabel({ selectedReturn = {}, selfShippingDetails = {} }) {
  const printRef = useRef();

  // create barcode SVG once mounted/rendered
  const barcodeRef = (node) => {
    if (!node) return;
    const awb = selectedReturn?.awb || selectedReturn?.id || "AWB-UNKNOWN";
    try {
      JsBarcode(node, String(awb), {
        format: "CODE128",
        displayValue: true,
        textMargin: 2,
        fontSize: 12,
        height: 40,
      });
    } catch (e) {
      // ignore if library fails
      console.warn("Barcode error", e);
    }
  };

  const generatePdf = async () => {
    const element = printRef.current;
    if (!element) return;

    // html2pdf options for high quality
    const opt = {
      margin: [10, 10, 10, 10], // top, left, bottom, right in mm
      filename: `shipping_label_${selectedReturn?.id || "unknown"}.pdf`,
      image: { type: "jpeg", quality: 0.95 },
      html2canvas: {
        scale: 2, // increase for sharper text/images
        useCORS: true,
        logging: false,
        windowWidth: element.scrollWidth, // helps keep layout
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("PDF generation failed", err);
    }
  };

  // Friendly fallback: open print dialog
  const printBrowser = () => {
    window.print();
  };

  // Data format helpers
  const formatAddress = (addr = {}) => {
    if (!addr) return [];
    return [
      addr.name || "",
      addr.street || "",
      `${addr.city || ""}${addr.city && addr.state ? ", " : ""}${addr.state || ""}`,
      `${addr.pincode ? "- " + addr.pincode : ""}`,
      `Phone: ${addr.phone || "N/A"}`,
    ].filter(Boolean);
  };

  const fromLines = formatAddress(selfShippingDetails?.address);
  const toLines = formatAddress(selectedReturn?.customerAddress || selectedReturn?.address);

  return (
    <>
      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <button onClick={generatePdf} style={btnStyle}>
          Export PDF (html2pdf)
        </button>
        <button onClick={printBrowser} style={{ ...btnStyle, background: "#666" }}>
          Print (Browser)
        </button>
      </div>

      {/* Printable HTML */}
      <div ref={printRef} style={containerStyle}>
        <div style={labelStyle}>
          {/* header */}
          <div style={headerStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img
                src={selfShippingDetails?.logo || "/logo.png"}
                alt="logo"
                style={{ width: 84, height: 40, objectFit: "contain" }}
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>YourCompany Pvt. Ltd.</div>
                <div style={{ fontSize: 12, color: "#333" }}>Return Shipping Label</div>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, color: "#666" }}>Date</div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>
                {new Date().toLocaleDateString()}
              </div>
              <div style={{ marginTop: 6 }}>
                <svg ref={barcodeRef} />
                <div style={{ fontSize: 10, color: "#666" }}>
                  {selectedReturn?.awb || selectedReturn?.id || ""}
                </div>
              </div>
            </div>
          </div>

          {/* boxes: from / to */}
          <div style={boxesRow}>
            <div style={box}>
              <div style={boxTitle}>From</div>
              <div style={boxContent}>
                {fromLines.length ? fromLines.map((l, i) => <div key={i}>{l}</div>) : <div>N/A</div>}
              </div>
            </div>

            <div style={box}>
              <div style={boxTitle}>To</div>
              <div style={boxContent}>
                {toLines.length ? toLines.map((l, i) => <div key={i}>{l}</div>) : <div>N/A</div>}
              </div>
            </div>
          </div>

          {/* order + product */}
          <div style={orderProductRow}>
            <div style={orderCard}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Order Info</div>
              <div style={kv}><span>Order ID</span><span>{selectedReturn?.orderId || "N/A"}</span></div>
              <div style={kv}><span>Return ID</span><span>{selectedReturn?.id || "N/A"}</span></div>
              <div style={kv}><span>Return Type</span><span>{selectedReturn?.productDetails?.metadata?.returnType || "N/A"}</span></div>
              <div style={kv}><span>Reason</span><span>{selectedReturn?.reason || "N/A"}</span></div>
              <div style={kv}><span>Order Total</span><span>₹{selectedReturn?.originalOrderTotal?.toFixed?.(2) || "N/A"}</span></div>
            </div>

            <div style={productCard}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Product</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{selectedReturn?.productDetails?.name || "N/A"}</div>
              <div style={{ marginTop: 6, fontSize: 12 }}>{selectedReturn?.productDetails?.sku || ""}</div>
              <div style={{ marginTop: 10, fontSize: 12, color: "#555" }}>
                Qty: {selectedReturn?.quantity || 1} • Price: ₹{selectedReturn?.price?.toFixed?.(2) || "0.00"}
              </div>
            </div>
          </div>

          {/* notes / footer */}
          <div style={footerStyle}>
            <div style={{ fontSize: 11, color: "#333" }}>
              <strong>Instructions:</strong> Handle with care. Return shipment only. Not for sale.
            </div>
            <div style={{ fontSize: 10, color: "#777" }}>
              Generated by YourCompany — For return shipping purposes only
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


/* ---------- Styles (JS objects) ---------- */
const btnStyle = {
  background: "#1f7aef",
  color: "#fff",
  border: "none",
  padding: "8px 12px",
  borderRadius: 6,
  cursor: "pointer",
  fontWeight: 600,
};

const containerStyle = {
  width: "210mm", // a4 width
  margin: "0 auto",
  background: "#f7f7f7",
  padding: 12,
};

const labelStyle = {
  background: "#fff",
  padding: 14,
  borderRadius: 6,
  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
  border: "1px solid #e6e6e6",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
  marginBottom: 12,
};

const boxesRow = {
  display: "flex",
  gap: 12,
  marginBottom: 12,
};

const box = {
  flex: 1,
  border: "1px dashed #d0d0d0",
  borderRadius: 6,
  padding: 10,
  minHeight: 82,
};

const boxTitle = {
  fontSize: 12,
  fontWeight: 700,
  marginBottom: 6,
};

const boxContent = {
  fontSize: 12,
  lineHeight: 1.4,
};

const orderProductRow = {
  display: "flex",
  gap: 12,
  marginBottom: 12,
};

const orderCard = {
  flex: 1,
  border: "1px solid #eee",
  padding: 10,
  borderRadius: 6,
};

const productCard = {
  width: 200,
  border: "1px solid #eee",
  padding: 10,
  borderRadius: 6,
};

const kv = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 6,
  fontSize: 12,
};

const footerStyle = {
  marginTop: 12,
  borderTop: "1px dashed #eee",
  paddingTop: 8,
  display: "flex",
  justifyContent: "space-between",
};
