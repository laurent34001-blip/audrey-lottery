"use client"

import { useEffect, useState } from "react"

interface Ball {
  id: number
  left: string
  top: string
  delay: string
  width: number
  height: number
  fontSize: number
  color: number
  number: string
}

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true)
  const [isExiting, setIsExiting] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [balls, setBalls] = useState<Ball[]>([])

  useEffect(() => {
    // Generate balls data only on client
    const generatedBalls: Ball[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 1}s`,
      width: 40 + Math.random() * 80,
      height: 40 + Math.random() * 80,
      fontSize: 12 + Math.random() * 12,
      color: i % 3,
      number: String(Math.floor(Math.random() * 100)).padStart(2, "0"),
    }))
    setBalls(generatedBalls)
    
    // Mark as mounted to avoid hydration mismatch
    setIsMounted(true)

    // Simulate loading time
    const timer = setTimeout(() => {
      setIsExiting(true)
      // Remove loading screen after animation
      setTimeout(() => {
        setIsLoading(false)
      }, 2000) // Duration of exit animation
    }, 1500) // Show loading for 1.5 seconds

    return () => clearTimeout(timer)
  }, [])

  // Don't render until mounted (client-side only)
  if (!isMounted || !isLoading) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 transition-all duration-1000 ${
        isExiting ? "opacity-0 scale-110" : "opacity-100 scale-100"
      }`}
    >
      {/* Lottery balls that erase the screen */}
      {isExiting && (
        <div className="absolute inset-0 overflow-hidden">
          {balls.map((ball) => (
            <div
              key={ball.id}
              className="lottery-ball-exit absolute"
              style={{
                left: ball.left,
                top: ball.top,
                animationDelay: ball.delay,
              }}
            >
              <div
                className={`rounded-full shadow-2xl flex items-center justify-center text-white font-bold ${
                  ball.color === 0
                    ? "bg-gradient-to-br from-red-500 to-red-600"
                    : ball.color === 1
                    ? "bg-gradient-to-br from-blue-400 to-blue-500"
                    : "bg-gradient-to-br from-gray-700 to-gray-900"
                }`}
                style={{
                  width: `${ball.width}px`,
                  height: `${ball.height}px`,
                  fontSize: `${ball.fontSize}px`,
                }}
              >
                {ball.number}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Logo and Loading Animation */}
      <div className="relative z-10 text-center">
        <div
          className={`transition-all duration-700 ${
            isExiting ? "scale-0 opacity-0" : "scale-100 opacity-100"
          }`}
        >
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl animate-pulse">
              <svg
                className="w-20 h-20 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl font-bold mb-4 text-white drop-shadow-lg">
            Bollet Lottery
          </h1>

          {/* Loading spinner */}
          <div className="flex justify-center gap-2 mt-8">
            <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
            <div
              className="w-3 h-3 bg-white rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-3 h-3 bg-white rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  )
}
