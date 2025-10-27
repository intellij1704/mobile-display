"use client"
import confetti from "canvas-confetti";
import { useEffect } from "react"

function SuccessMessage() {
    useEffect(() => {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } })
    }, [])
    return (
        <>

        </>
    )
}

export default SuccessMessage