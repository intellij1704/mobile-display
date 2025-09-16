"use client";

import CountMeter from './components/CountMeter';
import RevenueChart from './components/RevenueChart';
import OrdersChart from './components/OrdersChart';
import { useOrdersCountsByTotalDays } from '@/lib/firestore/orders/read_count';
import { useEffect, useState } from 'react';
import RecentOrder from './components/RecentOrder';
import { AuthContextProvider } from '@/context/AuthContext';




export default function Dashboard() {
    const [dates, setDates] = useState([]);
    useEffect(() => {
        let list = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            list.push(date);
        }
        setDates(list);
    }, []);

    const { data } = useOrdersCountsByTotalDays({ dates: dates });

    return (
        <div className="min-h-screen bg-gray-100">

            {/* Main Content */}
            <div>
                <div className="px-4 py-6 sm:px-6 lg:px-8">

                    <CountMeter />
                    <div className=' flex gap-5 flex-col md:flex-row mb-6'>
                        <RevenueChart items={data} />
                        <OrdersChart items={data} />
                    </div>

                    <RecentOrder />

                </div >
            </div >
        </div >
    );
}