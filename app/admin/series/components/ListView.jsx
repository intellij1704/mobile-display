"use client"

import { useSeries } from "@/lib/firestore/series/read"
import { deleteSeries } from "@/lib/firestore/series/write"
import { Button, CircularProgress, Chip } from "@nextui-org/react"
import { Edit2, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import toast from "react-hot-toast"

export default function SeriesListView() {
  const { data: series, error, isLoading } = useSeries()

  console.log(series)

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-5">
        <CircularProgress aria-label="Loading series" />
        <h3 className="mt-2 text-gray-600">Loading series...</h3>
      </div>
    )
  }

  if (error) {
    return <div className="p-5 text-red-500">Error: {error}</div>
  }

  if (!series?.length) {
    return <div className="p-5 text-gray-500">No series found. Create a new series to get started.</div>
  }

  return (
    <div className="flex-1 flex flex-col gap-4 md:pr-5 md:px-5 py-5 px-5 rounded-xl bg-white ">
      <h1 className="text-2xl font-semibold text-gray-800">Series</h1>
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-3">
          <thead>
            <tr>
              <th className="font-semibold border-y bg-white px-4 py-2 border-l rounded-l-lg text-center text-sm text-gray-600">
                SN
              </th>
              <th className="font-semibold border-y bg-white px-4 py-2 text-left text-sm text-gray-600">Image</th>
              <th className="font-semibold border-y bg-white px-4 py-2 text-left text-sm text-gray-600">Series Name</th>
              {/* <th className="font-semibold border-y bg-white px-4 py-2 text-left text-sm text-gray-600">Category</th> */}
              <th className="font-semibold border-y bg-white px-4 py-2 text-left text-sm text-gray-600">Brand</th>
              <th className="font-semibold border-y bg-white px-4 py-2 border-r rounded-r-lg text-center text-sm text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {series.map((item, index) => (
              <Row key={item?.id} item={item} index={index} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Row({ item, index }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this series?")) return
    setIsDeleting(true)
    try {
      await deleteSeries({ id: item?.id, imagePath: item?.imagePath })
      toast.success("Series deleted successfully")
    } catch (error) {
      toast.error((error && error.message) || "Failed to delete series")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleUpdate = () => {
    router.push(`/admin/series?id=${item?.id}`)
  }

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="border-y bg-white px-4 py-2 border-l rounded-l-lg text-center text-sm text-gray-700">
        {index + 1}
      </td>
      <td className="border-y bg-white px-4 py-2 text-sm text-gray-700">
        {item?.imageUrl ? (
          <img
            src={item.imageUrl || "/placeholder.svg"}
            alt={`${item?.seriesName || "Series"} image`}
            className="h-auto w-14 object-contain rounded-md "
          />
        ) : (
          <span className="text-xs text-gray-400">No image</span>
        )}
      </td>
      <td className="border-y bg-white px-4 py-2 text-sm text-gray-700">{item?.seriesName}</td>
      {/* <td className="border-y bg-white px-4 py-2 text-sm text-gray-700">
        <Chip size="sm" color="primary" variant="flat">
          {item?.categoryName || "Unknown"}
        </Chip>
      </td> */}
      <td className="border-y bg-white px-4 py-2 text-sm text-gray-700">
        <Chip size="sm" color="secondary" variant="flat">
          {item?.brandName || "Unknown"}
        </Chip>
      </td>
      <td className="border-y bg-white px-4 py-2 border-r rounded-r-lg text-center">
        <div className="flex gap-2 justify-center items-center">
          <Button
            onClick={handleUpdate}
            isDisabled={isDeleting}
            isIconOnly
            size="sm"
            color="primary"
            aria-label={`Edit series ${item?.seriesName}`}
          >
            <Edit2 size={14} />
          </Button>
          <Button
            onClick={handleDelete}
            isLoading={isDeleting}
            isDisabled={isDeleting}
            isIconOnly
            size="sm"
            color="danger"
            aria-label={`Delete series ${item?.seriesName}`}
          >
            {!isDeleting && <Trash2 size={14} />}
          </Button>
        </div>
      </td>
    </tr>
  )
}
