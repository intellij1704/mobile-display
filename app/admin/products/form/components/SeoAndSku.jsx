export default function SeoAndSku({ data, handleData }) {
    return (
        <div className="p-4 border rounded-md bg-gray-50 mt-5">
            <h2 className="text-lg font-semibold mb-4">SEO & SKU</h2>

            {/* SKU */}
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1">SKU</label>
                <input
                    type="text"
                    value={data?.sku || ""}
                    onChange={(e) => handleData("sku", e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Enter SKU"
                    
                />
            </div>

            {/* SEO Slug */}
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1">SEO Slug (URL)</label>
                <input
                    type="text"
                    value={data?.seoSlug || ""}
                    onChange={(e) => handleData("seoSlug", e.target.value)}
                    placeholder="auto-generated if empty"
                    className="w-full border rounded-md px-3 py-2"
                />
            </div>

            {/* SEO Description */}
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1">SEO Description</label>
                <textarea
                    value={data?.seoDescription || ""}
                    onChange={(e) => handleData("seoDescription", e.target.value)}
                    rows={3}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Enter SEO Description Better View"
                />
            </div>

            {/* SEO Keywords */}
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1">SEO Keywords (comma separated)</label>
                <input
                    type="text"
                    value={data?.seoKeywords?.join(", ") || ""}
                    onChange={(e) => handleData("seoKeywords", e.target.value.split(",").map((k) => k.trim()))}
                    placeholder="e.g. iphone, smartphone, apple"
                    className="w-full border rounded-md px-3 py-2"
                />
            </div>
        </div>
    );
}
