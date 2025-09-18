'use client';

import { useAuth } from '@/context/AuthContext';
import { addReview } from '@/lib/firestore/reviews/write';
import { useUser } from '@/lib/firestore/user/read';
import { CircularProgress, Rating } from '@mui/material';
import { Button } from '@nextui-org/react';
import { useState } from 'react';
import toast from 'react-hot-toast';

function AddReview({ productId, onSuccess }) {
    const [isLoading, setIsLoading] = useState(false);
    const [rating, setRating] = useState(4);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const { user } = useAuth();
    const { data: userData } = useUser({ uid: user?.uid });
    const maxChars = 300;

    const handleSubmit = async () => {
        if (message.length > maxChars || !message.trim()) return;
        setIsLoading(true);
        try {
            if (!user) {
                throw new Error("Please sign in to leave a review");
            }

            await addReview({
                displayName: userData?.displayName || "Anonymous",
                message: message.trim(),
                photoURL: userData?.photoURL,
                productId: productId,
                rating: rating,
                uid: user?.uid,
            });

            setMessage("");
            setRating(4);
            toast.success("Thank you for your review!");
            if (onSuccess) onSuccess();
        } catch (error) {
            toast.error(error?.message || "Failed to submit review");
        }
        setIsLoading(false);
    };

    const handleMessageChange = (e) => {
        const text = e.target.value;
        if (text.length > maxChars) {
            setError(`Maximum ${maxChars} characters allowed`);
        } else {
            setError("");
        }
        setMessage(text);
    };

    const isSubmitDisabled = isLoading || !!error || !message.trim();

    return (
        <div className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Share Your Experience</h2>

            <div className="mb-4">
                <label htmlFor="product-rating" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Rating
                </label>
                <Rating
                    id="product-rating"
                    size="large"
                    value={rating}
                    onChange={(event, newValue) => setRating(newValue)}
                    precision={0.5}
                    className="[&>span]:text-2xl"
                    sx={{
                        '& .MuiRating-iconFilled': {
                            color: 'green', // filled stars
                        },
                        '& .MuiRating-iconEmpty': {
                            color: 'lightgreen',
                        },
                    }}
                />
            </div>

            <div className="mb-2">
                <label htmlFor="review-message" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Review
                </label>
                <textarea
                    id="review-message"
                    placeholder="What did you think of this product?"
                    className={`w-full border ${error ? "border-red-500" : "border-gray-300"} rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none resize-none h-32 transition-colors`}
                    value={message}
                    onChange={handleMessageChange}
                    aria-describedby="char-count"
                />
                <div className="flex justify-between mt-1">
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <p
                        id="char-count"
                        className={`text-xs ml-auto ${message.length > maxChars ? 'text-red-500' : 'text-gray-500'}`}
                    >
                        {message.length}/{maxChars}
                    </p>
                </div>
            </div>

            <Button
                className={`w-full mt-2 text-white font-medium py-3 rounded-lg transition-colors ${isSubmitDisabled
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700 active:bg-red-800"
                    }`}
                isDisabled={isSubmitDisabled}
                onClick={handleSubmit}
                aria-label="Submit review"
            >
                {isLoading ? (
                    <div className="flex items-center gap-2">
                        <CircularProgress size={20} thickness={5} className="text-white" />
                        Submitting...
                    </div>
                ) : (
                    "Submit Review"
                )}
            </Button>
        </div>
    );
}

export default AddReview;