// components/TermsAndConditions.jsx (Similar to Description)
"use client";

import { useEffect, useState, useMemo } from "react";
import JoditEditor from "jodit-react";

export default function TermsAndConditions({ data, handleData }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: "Enter terms and conditions here...",
      height: 300,
      buttons: [
        "bold",
        "italic",
        "underline",
        "|",
        "ul",
        "ol",
        "|",
        "outdent",
        "indent",
        "|",
        "font",
        "fontsize",
        "brush",
        "paragraph",
        "|",
        "image",
        "table",
        "link",
        "|",
        "align",
        "undo",
        "redo",
        "|",
        "hr",
        "eraser",
        "copyformat",
        "|",
        "fullsize",
        "print",
        "about",
      ],
      extraPlugins: ["lists"],
      iframe: true,
      iframeCSSLinks: [],
      style: {
        ul: {
          "list-style-type": "disc",
          "padding-left": "17px",
          margin: "0 0 20px 0",
        },
        li: {
          "margin-bottom": "10px",
        },
      },
      editorCssClass: "jodit-custom-list",
    }),
    []
  );

  return (
    <section className="flex flex-col gap-3 bg-white border p-4 rounded-xl h-full">
      <h1 className="font-semibold">Terms & Conditions</h1>
      {isMounted ? (
        <JoditEditor
          value={data?.termsAndConditions || ""}
          config={config}
          onBlur={(newContent) => handleData("termsAndConditions", newContent)}
          className="w-full border rounded bg-white text-gray-900"
        />
      ) : (
        <div className="p-3 border rounded bg-gray-100 text-gray-500">
          Loading editor...
        </div>
      )}
      <style jsx global>{`
        .jodit-custom-list .jodit-wysiwyg ul {
          list-style-type: disc !important;
          padding-left: 17px !important;
          margin: 0 0 20px 0 !important;
        }
        .jodit-custom-list .jodit-wysiwyg li {
          margin-bottom: 10px !important;
        }
      `}</style>
    </section>
  );
}