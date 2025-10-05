"use client";

import { useAllReturnRequests } from "@/lib/firestore/return_requests/read";
import { useAuth } from "@/context/AuthContext";
import { CircularProgress } from "@mui/material";
import { Button } from "@nextui-org/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useUser } from "@/lib/firestore/user/read";

export default function ListView() {
    const [pageLimit, setPageLimit] = useState(10);
    const [lastSnapDocList, setLastSnapDocList] = useState([]);

    const {
        data: returnRequests,
        isLoading,
        error,
        lastSnapDoc,
    } = useAllReturnRequests({
        pageLimit,
        lastSnapDoc:
            lastSnapDocList.length === 0
                ? null
                : lastSnapDocList[lastSnapDocList.length - 1],
    });

    useEffect(() => setLastSnapDocList([]), [pageLimit]);

    if (isLoading) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-100">
                <CircularProgress size={50} color="primary" thickness={4} />
                <p className="mt-4 text-center text-gray-600">Please Wait...</p>
            </div>
        );
    }

    if (error) {
        return <div className="text-center text-red-500 mt-10">{error}</div>;
    }

    return (
        <div className="flex-1 flex flex-col gap-4 px-5 py-4 rounded-xl w-full overflow-x-auto bg-gray-50">
            <table className="w-full border-collapse bg-white rounded-lg shadow-md">
                <thead className="bg-gray-100">
                    <tr>
                        {[
                            "SN",
                            "Order ID",
                            "Customer Name",
                            "Reason",
                            "Status",
                            "Timestamp",
                            "Actions",
                        ].map((header) => (
                            <th
                                key={header}
                                className="px-4 py-3 text-left font-semibold text-gray-700"
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {returnRequests?.length > 0 ? (
                        returnRequests.map((item, index) => (
                            <Row
                                key={item.id}
                                index={index + lastSnapDocList.length * pageLimit}
                                item={item}
                            />
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan={7}
                                className="text-center py-5 text-gray-500 text-sm"
                            >
                                No return requests found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center py-4">
                <Button
                    isDisabled={isLoading || lastSnapDocList.length === 0}
                    onClick={() => setLastSnapDocList(lastSnapDocList.slice(0, -1))}
                    size="sm"
                    variant="bordered"
                >
                    Previous
                </Button>

                <select
                    value={pageLimit}
                    onChange={(e) => setPageLimit(Number(e.target.value))}
                    className="px-4 py-2 rounded-md border border-gray-300"
                >
                    {[3, 5, 10, 20, 100].map((value) => (
                        <option key={value} value={value}>
                            {value} Items
                        </option>
                    ))}
                </select>

                <Button
                    isDisabled={isLoading || returnRequests?.length < pageLimit}
                    onClick={() => setLastSnapDocList([...lastSnapDocList, lastSnapDoc])}
                    size="sm"
                    variant="bordered"
                >
                    Next
                </Button>
            </div>
        </div>
    );
}

function Row({ item, index, currentUser }) {
    const { data: userData, isLoading: userLoading } = useUser({
        uid: item?.userId,
    });

    console.log(userData)

    const statusColors = {
        pending: "bg-yellow-100 text-yellow-700",
        approved: "bg-green-100 text-green-700",
        rejected: "bg-red-100 text-red-700",
        processing: "bg-blue-100 text-blue-700",
    };

    return (
        <tr className="border-b hover:bg-gray-100 transition">
            {/* SN */}
            <td className="px-4 py-3 text-center">{index + 1}</td>

            {/* Order ID */}
            <td className="border-y px-3 py-2 text-gray-600">{item?.orderId || "N/A"}</td>

            {/* Customer Name */}
            <td className="border-y px-3 py-2 text-gray-600">
                {userLoading ? (
                    <span className="text-gray-400 text-sm">Loading...</span>
                ) : (
                    <>
                        {userData?.displayName || userData?.email || "Unknown User"}{" "}

                    </>
                )}
            </td>

            {/* Reason */}
            <td className="border-y px-3 py-2 text-gray-600">
                {item?.reason || "No reason provided"}
            </td>

            {/* Status */}
            <td className="border-y px-3 py-2">
                <span
                    className={`text-xs px-3 py-1 rounded-full uppercase ${statusColors[item?.status || "pending"]
                        }`}
                >
                    {item?.status || "Pending"}
                </span>
            </td>

            {/* Timestamp */}
            <td className="border-y px-3 py-2 text-xs md:text-sm text-gray-600 whitespace-nowrap">
                {item?.timestamp?.toDate
                    ? item.timestamp.toDate().toLocaleString()
                    : "N/A"}
            </td>

            {/* Actions */}
            <td className="border-y px-3 py-2 text-gray-600 rounded-r-lg border-r">
                <Link href={`/admin/return-requests/${item?.id}`}>
                    <button className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-4 py-1 rounded">
                        View
                    </button>
                </Link>
            </td>
        </tr>
    );
}
