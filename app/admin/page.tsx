"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"

export default function AdminPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [formData, setFormData] = useState({
    date: "",
    redGame: "",
    greenGame: "",
    blueGame: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/results")
    }
  }, [status, session, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!session || session.user?.role !== "admin") {
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validate 2-digit numbers
    const redNum = parseInt(formData.redGame)
    const greenNum = parseInt(formData.greenGame)
    const blueNum = parseInt(formData.blueGame)

    if (
      isNaN(redNum) || redNum < 0 || redNum > 99 ||
      isNaN(greenNum) || greenNum < 0 || greenNum > 99 ||
      isNaN(blueNum) || blueNum < 0 || blueNum > 99
    ) {
      setError("All game numbers must be 2-digit numbers (00-99)")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: formData.date,
          redGame: formData.redGame.padStart(2, '0'),
          greenGame: formData.greenGame.padStart(2, '0'),
          blueGame: formData.blueGame.padStart(2, '0'),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Failed to add result")
      } else {
        setSuccess("Result added successfully!")
        setFormData({
          date: "",
          redGame: "",
          greenGame: "",
          blueGame: "",
        })
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
            <div className="flex items-center gap-4">
              <Link
                href="/results"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                View Results
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Add Daily Lottery Results
          </h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="redGame" className="block text-sm font-medium text-red-700 mb-1">
                  Red Game (00-99)
                </label>
                <input
                  type="number"
                  id="redGame"
                  name="redGame"
                  value={formData.redGame}
                  onChange={handleChange}
                  min="0"
                  max="99"
                  className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800"
                  required
                />
              </div>

              <div>
                <label htmlFor="greenGame" className="block text-sm font-medium text-green-700 mb-1">
                  Green Game (00-99)
                </label>
                <input
                  type="number"
                  id="greenGame"
                  name="greenGame"
                  value={formData.greenGame}
                  onChange={handleChange}
                  min="0"
                  max="99"
                  className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
                  required
                />
              </div>

              <div>
                <label htmlFor="blueGame" className="block text-sm font-medium text-blue-700 mb-1">
                  Blue Game (00-99)
                </label>
                <input
                  type="number"
                  id="blueGame"
                  name="blueGame"
                  value={formData.blueGame}
                  onChange={handleChange}
                  min="0"
                  max="99"
                  className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Adding result..." : "Add Result"}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
