"use client";

import { useAllReturnRequests } from "@/lib/firestore/return_requests/read";
import { useUsers } from "@/lib/firestore/user/read";
import { CircularProgress, Avatar } from "@mui/material";
import Link from "next/link";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';

export default function ListView() {
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    const { data: users = [], error: usersError, isLoading: usersLoading } = useUsers();
    const { data: allReturnRequests = [], isLoading, error } = useAllReturnRequests({
        pageLimit: 1000, // Fetch all return requests (adjust if dataset is very large)
        lastSnapDoc: null,
    });

    const statuses = ["all", ...Object.keys(statusColors)];

    // Normalize status for filtering (assuming DB statuses are lowercase)
    const normalizedAllReturnRequests = allReturnRequests.map(request => ({
        ...request,
        status: request.status?.toLowerCase() || "pending"
    }));

    const filteredReturnRequests = selectedStatus === "all"
        ? normalizedAllReturnRequests
        : normalizedAllReturnRequests.filter(item => item.status === selectedStatus);

    // Client-side pagination
    const totalPages = Math.ceil(filteredReturnRequests.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedReturnRequests = filteredReturnRequests.slice(startIndex, startIndex + itemsPerPage);

    // Reset to first page when filter or itemsPerPage changes
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedStatus, itemsPerPage]);

    if (isLoading || usersLoading) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-100">
                <CircularProgress size={50} color="primary" thickness={4} />
                <p className="mt-4 text-center text-gray-600">Please Wait...</p>
            </div>
        );
    }

    if (error || usersError) {
        return <div className="p-4 text-red-600">{error?.message || usersError?.message || "An error occurred"}</div>;
    }

    const exportToExcel = () => {
        if (filteredReturnRequests.length === 0) return;

        const exportData = filteredReturnRequests.map((item, index) => {
            const user = users.find(u => u.id === item.userId);
            const returnType = item?.productDetails?.metadata?.returnType || "N/A";
            const reqType = item?.type || "N/A";

            return {
                SN: index + 1,
                "Return ID": item?.id || "N/A",
                "Order ID": item?.orderId || "N/A",
                Customer: user?.displayName || "Unknown",
                "Mobile No": user?.mobileNo || "N/A",
                Email: user?.email || "No Email",
                Reason: item?.reason || "No reason provided",
                Type: reqType.charAt(0).toUpperCase() + reqType.slice(1),
                "Return Type": returnType.charAt(0).toUpperCase() + returnType.slice(1).replace(/-/g, ' '),
                Status: item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : "Pending",
                Timestamp: item?.timestamp?.toDate()?.toLocaleString() || "N/A",
            };
        });

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "ReturnRequests");
        XLSX.writeFile(wb, `return_requests_${selectedStatus}.xlsx`);
    };

    const exportToPDF = () => {
        if (filteredReturnRequests.length === 0) return;

        const doc = new jsPDF();
        const tableColumn = [
            "SN",
            "Return ID",
            "Order ID",
            "Customer",
            "Mobile No",
            "Email",
            "Reason",
            "Type",
            "Return Type",
            "Status",
            "Timestamp",
        ];

        const exportData = filteredReturnRequests.map((item, index) => {
            const user = users.find(u => u.id === item.userId);
            const returnType = item?.productDetails?.metadata?.returnType || "N/A";
            const reqType = item?.type || "N/A";

            return [
                index + 1,
                item?.id || "N/A",
                item?.orderId || "N/A",
                user?.displayName || "Unknown",
                user?.mobileNo || "N/A",
                user?.email || "No Email",
                item?.reason || "No reason provided",
                reqType.charAt(0).toUpperCase() + reqType.slice(1),
                returnType.charAt(0).toUpperCase() + returnType.slice(1).replace(/-/g, ' '),
                item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : "Pending",
                item?.timestamp?.toDate()?.toLocaleString() || "N/A",
            ];
        });

        autoTable(doc, {
            head: [tableColumn],
            body: exportData,
            theme: "striped",
            styles: { fontSize: 8, cellPadding: 2 },
            margin: { top: 10 },
        });

        doc.save(`return_requests_${selectedStatus}.pdf`);
    };

    const handlePrevious = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    return (
        <div className="flex-1 flex flex-col gap-4 px-5 py-4 rounded-xl w-full overflow-x-auto bg-gray-50">
            {/* Controls: Status Filter, Export Buttons */}
            <div className="flex justify-between items-center gap-3 flex-wrap">
                <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        {statuses.map((status) => (
                            <option key={status} value={status}>
                                {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1).replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={exportToExcel}
                        disabled={filteredReturnRequests.length === 0}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Export to Excel
                    </button>
                    <button
                        onClick={exportToPDF}
                        disabled={filteredReturnRequests.length === 0}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Export to PDF
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white rounded-lg shadow-md">
                    <thead className="bg-gray-100">
                        <tr>
                            {[
                                "SN",
                                "Return ID",
                                "Order ID",
                                "Customer",
                                "Reason",
                                "Status",
                                "Timestamp",
                                "Actions",
                            ].map((header) => (
                                <th
                                    key={header}
                                    className="px-4 py-3 text-left font-semibold text-gray-700 border border-gray-200"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedReturnRequests?.length > 0 ? (
                            paginatedReturnRequests.map((item, index) => (
                                <Row
                                    key={item.id}
                                    index={startIndex + index} // Global index for SN
                                    item={item}
                                    users={users}
                                />
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} className="text-center py-5 text-gray-500 text-sm">
                                    No return requests found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center py-4">
                    <button
                        onClick={handlePrevious}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700">
                            Show {itemsPerPage} items per page
                        </span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => setItemsPerPage(Number(e.target.value))}
                            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {[10, 20, 50, 100].map((value) => (
                                <option key={value} value={value}>
                                    {value} Items
                                </option>
                            ))}
                        </select>
                        <span className="text-sm text-gray-700">
                            Page {currentPage} of {totalPages}
                        </span>
                    </div>
                    <button
                        onClick={handleNext}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

const statusColors = {
    pending: { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-200" },
    processing: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200" },
    approved: { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" },
    rejected: { bg: "bg-red-100", text: "text-red-800", border: "border-red-200" },
    waiting_for_shipment: { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-200" },
    received: { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-200" },
    verified: { bg: "bg-teal-100", text: "text-teal-800", border: "border-teal-200" },
    pickup: { bg: "bg-indigo-100", text: "text-indigo-800", border: "border-indigo-200" },
    picked_up: { bg: "bg-cyan-100", text: "text-cyan-800", border: "border-cyan-200" },
    inTransit: { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-200" },
    refunded: { bg: "bg-lime-100", text: "text-lime-800", border: "border-lime-200" },
    new_item_shipped: { bg: "bg-pink-100", text: "text-pink-800", border: "border-pink-200" },
    new_item_inTransit: { bg: "bg-violet-100", text: "text-violet-800", border: "border-violet-200" },
    new_item_outForDelivery: { bg: "bg-fuchsia-100", text: "text-fuchsia-800", border: "border-fuchsia-200" },
    new_item_delivered: { bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-200" },
};

function Row({ item, index, users }) {
    const user = users.find(u => u.id === item.userId);

    const currentStatus = item?.status || "pending";
    const statusStyle = statusColors[currentStatus] || { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-200" };

    return (
        <tr className="border-b hover:bg-gray-100 transition">
            <td className="px-4 py-3 text-center border border-gray-200">{index + 1}</td>
            <td className="border border-gray-200 px-3 py-2 text-gray-600">{item?.id || "N/A"}</td>
            <td className="border border-gray-200 px-3 py-2 text-gray-600">{item?.orderId || "N/A"}</td>
            <td className="border border-gray-200 px-3 py-2 whitespace-nowrap">
                <div className="flex gap-2 items-center">
                    <Avatar src={user?.photoURL || "/default-avatar.png"} sx={{ width: 32, height: 32 }} />
                    <div>
                        <h2 className="text-xs font-semibold uppercase">{user?.displayName || "Unknown"}</h2>
                        <h2 className="text-xs text-gray-600">{user?.mobileNo || "N/A"}</h2>
                        <h2 className="text-xs text-gray-500">{user?.email || "No Email"}</h2>
                    </div>
                </div>
            </td>
            <td className="border border-gray-200 px-3 py-2 text-gray-600">
                {item?.reason || "No reason provided"}
            </td>
            <td className="border border-gray-200 px-3 py-2">
                <span
                    className={`text-xs px-3 py-1 rounded-full uppercase ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                >
                    {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1).replace(/_/g, ' ')}
                </span>
            </td>
            <td className="border border-gray-200 px-3 py-2 text-xs md:text-sm text-gray-600 whitespace-nowrap">
                {item?.timestamp?.toDate()?.toLocaleString() || "N/A"}
            </td>
            <td className="border border-gray-200 px-3 py-2 rounded-r-lg">
                <Link href={`/admin/return-replacement/${item?.id}`}>
                    <button className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-4 py-1 rounded transition">
                        View
                    </button>
                </Link>
            </td>
        </tr>
    );
}