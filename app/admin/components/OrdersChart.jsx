"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function OrdersChart({ items }) {
  console.log(items);

  const data = {
    labels: items?.map((item) => item.date), // ✅ use correct field
    datasets: [
      {
        label: "Orders",
        data: items?.map((item) => item.totalOrders), // ✅ fix here
        backgroundColor: "#879fff20",
        borderColor: "#879fff80",
        borderWidth: 1,
        barThickness: 30,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Total Orders Bar Chart",
      },
    },
    scales: {
      x: {
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0, // ✅ avoids decimals for whole orders
        },
      },
    },
  };

  return (
    <section className="bg-white p-5 rounded-xl shadow w-full h-[430px]">
      <Bar data={data} options={options} />
    </section>
  );
}
