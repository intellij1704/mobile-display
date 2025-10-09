"use client";

import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/lib/firestore/user/read";
import { updateFavorites } from "@/lib/firestore/user/write";
import { useState } from "react";
import toast from "react-hot-toast";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useRouter } from "next/navigation";
import { Button, CircularProgress } from "@mui/material";

function FavoriteButton({ productId }) {
  const { user } = useAuth();
  const { data } = useUser({ uid: user?.uid });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();


  console.log(data)

  const handleClick = async () => {
    setIsLoading(true);
    try {
      if (!user?.uid) {
        router.push("/login");
        throw new Error("Please log in first!");
      }

      if (data?.favorites?.includes(productId)) {
        const newList = data?.favorites?.filter((item) => item !== productId);
     
        await updateFavorites({ list: newList, uid: user?.uid });
        toast.success("Removed from wishlist");
      } else {
        await updateFavorites({
          list: [...(data?.favorites ?? []), productId],
          uid: user?.uid,
        });
        toast.success("Added to wishlist");
      }
    } catch (error) {
      toast.error(error?.message);
    }
    setIsLoading(false);
  };

  const isLiked = data?.favorites?.includes(productId);

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      sx={{
        minWidth: "32px",
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        border: "1px solid #d1d5db", // gray-300
        backgroundColor: "white",
        color: isLiked ? "#ef4444" : "#4b5563", // red-500 / gray-600
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        "&:hover": {
          backgroundColor: "#ef4444",
          color: "white",
        },
      }}
    >
      {isLoading ? (
        <CircularProgress size={16} color="inherit" />
      ) : isLiked ? (
        <FavoriteIcon fontSize="small" />
      ) : (
        <FavoriteBorderOutlinedIcon fontSize="small" />
      )}
    </Button>
  );
}

export default FavoriteButton;
