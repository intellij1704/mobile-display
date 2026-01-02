"use client"

export default function Error({ error }) {
    console.error("SERVER COMPONENT ERROR:", error)
    return (
        <div style={{ padding: 24, color: "red" }}>
            Something went wrong. Please refresh.
        </div>
    )
}
