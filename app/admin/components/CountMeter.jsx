
import { useOrdersCounts } from "@/lib/firestore/orders/read_count"
import { useProductCount } from "@/lib/firestore/products/count/read_client"
import { useUsersCount } from "@/lib/firestore/user/read_count"
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react"
import Link from "next/link"

function CountMeter() {

    const { data: totalProduct } = useProductCount()
    const { data: totalUser } = useUsersCount()
    const { data: ordersCounts } = useOrdersCounts()

    return (
        <div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Link href={"/admin/orders"}>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <DollarSign className="h-8 w-8 text-green-500 mr-3" />
                            <div>
                                <p className="text-gray-500">Total Sales</p>
                                <p className="text-2xl font-bold">₹{ordersCounts?.totalRevenue ?? 0}</p>
                            </div>
                        </div>
                    </div>
                </Link>

                <Link href={"/admin/orders"}>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <ShoppingCart className="h-8 w-8 text-blue-500 mr-3" />
                            <div>
                                <p className="text-gray-500">Total Orders</p>
                                <p className="text-2xl font-bold">{ordersCounts?.totalOrders ?? 0}</p>
                            </div>
                        </div>
                    </div>
                </Link>
                <Link href={"/admin/products"}>

                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <Package className="h-8 w-8 text-purple-500 mr-3" />
                            <div>
                                <p className="text-gray-500">Total Products</p>
                                <p className="text-2xl font-bold">{totalProduct ?? 0}</p>
                            </div>
                        </div>
                    </div>
                </Link>

                <Link href={"/admin/customers"}>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        <div className="flex items-center">
                            <Users className="h-8 w-8 text-red-500 mr-3" />
                            <div>
                                <p className="text-gray-500">Total Customers</p>
                                <p className="text-2xl font-bold">{totalUser ?? 0}</p>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    )
}

export default CountMeter