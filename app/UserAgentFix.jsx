"use client"
import { useEffect } from "react"

export default function UserAgentFix() {
    useEffect(() => {
        if (typeof navigator !== "undefined") {
            // If navigator.userAgent is missing, patch it
            if (process.env.NODE_ENV === "production" && !navigator.userAgent) {
                Object.defineProperty(navigator, "userAgent", {
                    value: "Mozilla/5.0 (DevFallback)",
                    configurable: true,
                })
            }

        }
    }, [])

    return null
}
