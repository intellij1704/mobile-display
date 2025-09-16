"use client";

import { useAllOrders } from "@/lib/firestore/orders/read";
import { useProducts } from "@/lib/firestore/products/read";
import { deleteProduct } from "@/lib/firestore/products/write";
import { useUser, useUsers } from "@/lib/firestore/user/read";
import { Avatar, CircularProgress } from "@mui/material";
import { Button } from "@nextui-org/react";
import { Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function RecentOrder() {
    const [pageLimit, setPageLimit] = useState(5);
    const [lastSnapDocList, setLastSnapDocList] = useState([]);

    useEffect(() => {
        setLastSnapDocList([]);
    }, [pageLimit]);

    const {
        data: orders,
        isLoading,
        lastSnapDoc,
        error
    } = useAllOrders({
        pageLimit,
        lastSnapDoc: lastSnapDocList.length === 0 ? null : lastSnapDocList[lastSnapDocList.length - 1],
    });
    


    const handleNextPage = () => setLastSnapDocList([...lastSnapDocList, lastSnapDoc]);
    const handlePrePage = () => setLastSnapDocList(lastSnapDocList.slice(0, -1));


    if (isLoading) {
        return (
            <div className="h-screen w-full flex flex-col justify-center items-center bg-gray-100">
                <CircularProgress size={50} thickness={4} color="primary" />
                <p className="mt-4 text-gray-600 font-medium">Please Wait...</p>
            </div>
        );
    }

    if (error) {
        return <div>{error.message}</div>
    }
    return (
        <div className="flex-1 flex flex-col gap-4 px-5 py-4 rounded-xl w-full overflow-x-auto bg-gray-50">
            <table className="w-full border-collapse bg-white rounded-lg shadow-md">
                <thead className="bg-gray-100">
                    <tr>
                        {['SN', 'Customer', 'Total Price', 'Total Products', 'Order Date', 'Payment Mode', 'Status', 'Actions'].map((header) => (
                            <th key={header} className="px-4 py-3 text-left font-semibold text-gray-700">{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        <tr>
                            <td colSpan={9} className="text-center py-5">
                                <CircularProgress />
                            </td>
                        </tr>
                    ) : (
                        orders?.map((item, index) => (
                            <Row key={item.id} index={index + lastSnapDocList.length * pageLimit} item={item} />
                        ))
                    )}
                </tbody>
            </table>

        </div>
    );
}

function Row({ item, index }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const totalAmount = item?.checkout?.line_items?.reduce((prev, curr) => (
        prev + (curr?.price_data?.unit_amount / 100) * curr?.quantity
    ), 0);

    const { data: user } = useUser({ uid: item?.uid })


    const statusColors = {
        pending: "bg-yellow-100 text-yellow-700",
        shipped: "bg-red-100 text-blue-700",
        pickup: "bg-purple-100 text-purple-700",
        inTransit: "bg-orange-100 text-orange-700",
        outForDelivery: "bg-indigo-100 text-indigo-700",
        delivered: "bg-green-100 text-green-700",
        cancelled: "bg-red-100 text-red-700"
    };

    return (
        <tr className="border-b hover:bg-gray-100 transition">

            <td className="px-4 py-3 text-center">{index + 1}</td>

            <td className="border-y  px-3 py-2 whitespace-nowrap ">
                <div className="flex gap-2 items-center">
                    <Avatar src={user?.photoURL || "/default-avatar.png"} sx={{ width: 32, height: 32 }} />
                    <div>
                        <h2 className="text-xs font-semibold uppercase">{user?.displayName || "Unknown"}</h2>
                        <h2 className="text-xs text-gray-600">{user?.mobileNo || "N/A"}</h2>
                        <h2 className="text-xs text-gray-500">{user?.email || "No Email"}</h2>
                    </div>
                </div>
            </td>
            <td className="border-y px-3 py-2  whitespace-nowrap text-gray-600">

                ₹ {totalAmount.toFixed(2)}
            </td>
            <td className="border-y px-3 py-2 text-gray-600">{item?.checkout?.line_items?.length}</td>
            <td className="border-y px-3 py-2 text-xs md:text-sm text-gray-600">
                {item?.timestampCreate?.toDate()?.toLocaleString() || "N/A"}
            </td>
            <td className="border-y px-3 py-2">  <div className="flex">
                <span className="bg-red-100 text-blue-600 text-xs px-3 py-1 rounded-full">
                    {item?.paymentMode === "cod" ? "Cash On Delivery" : item?.paymentMode}
                </span></div>   </td>
            <td className="border-y  px-3 py-2">
                <div className="flex">
                    <span className={`text-xs px-3 py-1 rounded-full uppercase ${statusColors[item?.status || "pending"]}`}>{item?.status || "Pending"}</span>
                </div>           </td>
            <td className="border-y px-3 py-2 rounded-r-lg border-r">
                <div className="flex">
                    <Link href={`/admin/orders/${item?.id}`}>
                        <button className="bg-red-500 hover:bg-red-600 text-white text-xs px-4 py-1 rounded">View Order</button>
                    </Link>
                </div>
            </td>

        </tr>
    );
}