import Link from "next/link";
import ListView from "./components/ListView";

export default function Page() {
    return (
        <main className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold mb-4">Return &  Replacement</h3>

                </div>
                <ListView />
            </div>
        </main>
    );
}