"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface LotteryResult {
  id: string
  date: string
  redGame: string
  blueGame: string
  blackGame: string
}

export default function ResultsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [results, setResults] = useState<LotteryResult[]>([])
  const [filteredResults, setFilteredResults] = useState<LotteryResult[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    date: "",
    redGame: "",
    blueGame: "",
    blackGame: ""
  })
  const [editForm, setEditForm] = useState({
    date: "",
    redGame: ["", "", ""],
    blueGame: ["", "", ""],
    blackGame: ["", "", ""]
  })
  const [newResult, setNewResult] = useState({
    date: "",
    redGame: "",
    blueGame: "",
    blackGame: ""
  })
  const [showAddForm, setShowAddForm] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [statsNumbers, setStatsNumbers] = useState("")
  const [statsResults, setStatsResults] = useState<{number: string, count: number, games: {red: number, blue: number, black: number}, dates: {date: string, id: string, games: string[]}[]}[]>([])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      fetchResults()
    }
  }, [status, currentMonth])

  useEffect(() => {
    applyFilters()
  }, [results, filters])

  const applyFilters = () => {
    let filtered = [...results]

    // Filter by date
    if (filters.date) {
      filtered = filtered.filter(result => {
        const resultDate = formatDate(result.date)
        return resultDate.includes(filters.date)
      })
    }

    // Filter by red game
    if (filters.redGame) {
      filtered = filtered.filter(result => 
        result.redGame.includes(filters.redGame)
      )
    }

    // Filter by blue game
    if (filters.blueGame) {
      filtered = filtered.filter(result => 
        result.blueGame.includes(filters.blueGame)
      )
    }

    // Filter by black game
    if (filters.blackGame) {
      filtered = filtered.filter(result => 
        result.blackGame.includes(filters.blackGame)
      )
    }

    setFilteredResults(filtered)
  }

  const resetFilters = () => {
    setFilters({
      date: "",
      redGame: "",
      blueGame: "",
      blackGame: ""
    })
  }

  const fetchResults = async () => {
    setLoading(true)
    const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

    const response = await fetch(`/api/results?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`)
    if (response.ok) {
      const data = await response.json()
      setResults(data)
      setFilteredResults(data)
    }
    setLoading(false)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const splitNumbers = (gameString: string): string[] => {
    const match = gameString.match(/\d\d/g)
    return match ? match : ["", "", ""]
  }

  const handleEdit = (result: LotteryResult) => {
    setEditingId(result.id)
    setEditForm({
      date: result.date,
      redGame: splitNumbers(result.redGame),
      blueGame: splitNumbers(result.blueGame),
      blackGame: splitNumbers(result.blackGame)
    })
  }

  const handleUpdate = async (id: string) => {
    const response = await fetch(`/api/results`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        date: editForm.date,
        redGame: editForm.redGame.join(""),
        blueGame: editForm.blueGame.join(""),
        blackGame: editForm.blackGame.join("")
      })
    })

    if (response.ok) {
      setEditingId(null)
      fetchResults()
    }
  }

  const handleAdd = async () => {
    const response = await fetch(`/api/results`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: newResult.date,
        redGame: newResult.redGame,
        blueGame: newResult.blueGame,
        blackGame: newResult.blackGame
      })
    })

    if (response.ok) {
      const data = await response.json()
      
      // Add or update the result in the local state
      const newResultData = data.result
      
      // Update results state - remove duplicates by date first, then by id
      setResults(prev => {
        // Remove any existing result with same date or same id
        const filtered = prev.filter(r => 
          r.id !== newResultData.id && 
          new Date(r.date).toISOString().split('T')[0] !== new Date(newResultData.date).toISOString().split('T')[0]
        )
        // Add the new/updated result and sort by date
        return [newResultData, ...filtered].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      })
      
      // Increment date by one day
      const nextDate = new Date(newResult.date)
      nextDate.setDate(nextDate.getDate() + 1)
      const nextDateString = nextDate.toISOString().split('T')[0]
      
      // Clear games but keep the next date
      setNewResult({
        date: nextDateString,
        redGame: "",
        blueGame: "",
        blackGame: ""
      })
    } else {
      const data = await response.json()
      alert(data.message || "Erreur lors de l'ajout")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce résultat ?")) return

    const response = await fetch(`/api/results`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    })

    if (response.ok) {
      fetchResults()
    }
  }

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const monthName = currentMonth.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })

  const calculateStats = () => {
    const numbersToSearch = statsNumbers.replace(/\D/g, "").match(/.{1,2}/g) || []
    if (numbersToSearch.length === 0) {
      alert("Veuillez entrer au moins un numéro (2 chiffres)")
      return
    }

    const stats = numbersToSearch.map(number => {
      let redCount = 0
      let blueCount = 0
      let blackCount = 0
      const dates: {date: string, id: string, games: string[]}[] = []

      results.forEach(result => {
        const redNumbers = (result.redGame.match(/.{2}/g) || []) as string[]
        const blueNumbers = (result.blueGame.match(/.{2}/g) || []) as string[]
        const blackNumbers = (result.blackGame.match(/.{2}/g) || []) as string[]

        const gamesFound: string[] = []
        if (redNumbers.includes(number)) {
          redCount++
          gamesFound.push('red')
        }
        if (blueNumbers.includes(number)) {
          blueCount++
          gamesFound.push('blue')
        }
        if (blackNumbers.includes(number)) {
          blackCount++
          gamesFound.push('black')
        }

        if (gamesFound.length > 0) {
          dates.push({
            date: result.date,
            id: result.id,
            games: gamesFound
          })
        }
      })

      return {
        number,
        count: redCount + blueCount + blackCount,
        games: { red: redCount, blue: blueCount, black: blackCount },
        dates
      }
    })

    setStatsResults(stats)
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Bollet Lottery
              </h1>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <span className="hidden sm:inline text-xs md:text-sm text-gray-700 font-medium">
                👋 {session?.user?.name || session?.user?.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-2 md:px-4 py-1.5 md:py-2 rounded-lg hover:from-red-600 hover:to-pink-700 transition-all shadow-md hover:shadow-lg font-medium text-xs md:text-sm"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-8">
        {/* Month Navigation */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-4 md:p-6 mb-4 md:mb-6 border border-white/20">
          <div className="flex items-center justify-between">
            <button
              onClick={previousMonth}
              className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg text-xs md:text-base"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Mois précédent</span>
              <span className="sm:hidden">Préc.</span>
            </button>
            <h2 className="text-base md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent capitalize px-2">
              {monthName}
            </h2>
            <button
              onClick={nextMonth}
              className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg text-xs md:text-base"
            >
              <span className="hidden sm:inline">Mois suivant</span>
              <span className="sm:hidden">Suiv.</span>
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
          {/* Filters Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 md:px-6 py-3 md:py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-semibold text-sm md:text-lg flex items-center justify-center gap-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {showFilters ? "Masquer les filtres" : "Afficher les filtres"}
          </button>

          {/* Statistics Button */}
          <button
            onClick={() => setShowStats(!showStats)}
            className="px-4 md:px-6 py-3 md:py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl font-semibold text-sm md:text-lg flex items-center justify-center gap-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {showStats ? "Masquer les stats" : "Statistiques"}
          </button>

          {/* Add Button (Admin only) */}
          {session?.user?.role === "admin" && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 md:px-6 py-3 md:py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl font-semibold text-sm md:text-lg flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {showAddForm ? "Annuler" : "Ajouter un résultat"}
            </button>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-4 md:p-6 mb-4 md:mb-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base md:text-lg font-bold text-gray-800 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filtres
            </h3>
            {(filters.date || filters.redGame || filters.blueGame || filters.blackGame) && (
              <button
                onClick={resetFilters}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all text-xs md:text-sm font-medium"
              >
                Réinitialiser
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <div>
              <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                📅 Date (jj/mm/aaaa)
              </label>
              <input
                type="text"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                placeholder="Ex: 15/11"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                🔴 Jeu Rouge
              </label>
              <input
                type="text"
                value={filters.redGame}
                onChange={(e) => setFilters({ ...filters, redGame: e.target.value.replace(/\D/g, "") })}
                placeholder="Ex: 15 ou 1542"
                maxLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                🔵 Jeu Bleu
              </label>
              <input
                type="text"
                value={filters.blueGame}
                onChange={(e) => setFilters({ ...filters, blueGame: e.target.value.replace(/\D/g, "") })}
                placeholder="Ex: 23 ou 2367"
                maxLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                ⚫ Jeu Noir
              </label>
              <input
                type="text"
                value={filters.blackGame}
                onChange={(e) => setFilters({ ...filters, blackGame: e.target.value.replace(/\D/g, "") })}
                placeholder="Ex: 89 ou 8924"
                maxLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 text-sm"
              />
            </div>
          </div>
          {(filters.date || filters.redGame || filters.blueGame || filters.blackGame) && (
            <div className="mt-3 text-xs md:text-sm text-gray-600">
              📊 {filteredResults.length} résultat{filteredResults.length > 1 ? 's' : ''} trouvé{filteredResults.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
        )}

        {/* Statistics */}
        {showStats && (
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl shadow-xl p-4 md:p-6 mb-4 md:mb-6 border border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base md:text-lg font-bold text-gray-800 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Statistiques des numéros
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                🔢 Numéros à rechercher
              </label>
              <input
                type="text"
                value={statsNumbers}
                onChange={(e) => setStatsNumbers(e.target.value.replace(/\D/g, ""))}
                placeholder="Ex: 12 ou 123456 (paires de 2 chiffres)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-800 text-sm font-mono"
              />
              <p className="text-xs text-gray-600 mt-1">
                Entrez un ou plusieurs numéros (2 chiffres chacun)
              </p>
            </div>
            <div className="flex items-end">
              <button
                onClick={calculateStats}
                disabled={!statsNumbers}
                className="w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-all shadow-md font-semibold text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Afficher les statistiques
              </button>
            </div>
          </div>

          {/* Stats Results */}
          {statsResults.length > 0 && (
            <div className="mt-6 space-y-3">
              <h4 className="text-sm md:text-base font-bold text-gray-800">Résultats :</h4>
              {statsResults.map((stat, idx) => (
                <div key={idx} className="bg-white/80 backdrop-blur-lg rounded-xl p-4 border border-orange-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {stat.number}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Numéro {stat.number}</p>
                        <p className="text-xs text-gray-600">Total: {stat.count} fois</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-red-100 rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-600 mb-1">🔴 Rouge</p>
                      <p className="text-lg font-bold text-red-600">{stat.games.red}</p>
                    </div>
                    <div className="bg-blue-100 rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-600 mb-1">🔵 Bleu</p>
                      <p className="text-lg font-bold text-blue-600">{stat.games.blue}</p>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-600 mb-1">⚫ Noir</p>
                      <p className="text-lg font-bold text-gray-800">{stat.games.black}</p>
                    </div>
                  </div>
                  
                  {/* Dates */}
                  {stat.dates.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-orange-200">
                      <p className="text-xs font-semibold text-gray-700 mb-2">📅 Apparu le:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {stat.dates.map((dateInfo, dateIdx) => (
                          <button
                            key={dateIdx}
                            onClick={() => {
                              const element = document.getElementById(`result-${dateInfo.id}`)
                              if (element) {
                                element.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                element.classList.add('ring-4', 'ring-orange-400', 'ring-opacity-50')
                                setTimeout(() => {
                                  element.classList.remove('ring-4', 'ring-orange-400', 'ring-opacity-50')
                                }, 2000)
                              }
                            }}
                            className="px-2 py-1 bg-gray-100 hover:bg-orange-100 rounded-lg text-xs font-medium text-gray-700 hover:text-orange-700 transition-all cursor-pointer border border-gray-300 hover:border-orange-300 flex items-center gap-1"
                          >
                            {formatDate(dateInfo.date)}
                            <span className="flex gap-0.5">
                              {dateInfo.games.includes('red') && <span className="w-2 h-2 bg-red-500 rounded-full"></span>}
                              {dateInfo.games.includes('blue') && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
                              {dateInfo.games.includes('black') && <span className="w-2 h-2 bg-gray-800 rounded-full"></span>}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        )}

        {/* Add Form */}
        {showAddForm && session?.user?.role === "admin" && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl p-4 md:p-6 mb-4 md:mb-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Ajouter un résultat
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-300 mb-2">
                  📅 Date
                </label>
                <input
                  type="date"
                  value={newResult.date}
                  onChange={(e) => setNewResult({ ...newResult, date: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-300 mb-2">
                  🔴 Jeu Rouge
                </label>
                <input
                  type="text"
                  value={newResult.redGame}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "")
                    if (val.length <= 6) {
                      setNewResult({ ...newResult, redGame: val })
                    }
                  }}
                  placeholder="Ex: 123456"
                  maxLength={6}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-300 mb-2">
                  🔵 Jeu Bleu
                </label>
                <input
                  type="text"
                  value={newResult.blueGame}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "")
                    if (val.length <= 6) {
                      setNewResult({ ...newResult, blueGame: val })
                    }
                  }}
                  placeholder="Ex: 789012"
                  maxLength={6}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-semibold text-gray-300 mb-2">
                  ⚫ Jeu Noir
                </label>
                <input
                  type="text"
                  value={newResult.blackGame}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "")
                    if (val.length <= 6) {
                      setNewResult({ ...newResult, blackGame: val })
                    }
                  }}
                  placeholder="Ex: 345678"
                  maxLength={6}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white text-sm font-mono"
                />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              💡 Astuce: Vous pouvez ajouter un ou plusieurs jeux. 4 chiffres = 2 nombres (ex: 1234 = 12-34). Les champs vides seront complétés par des zéros. Si la date existe déjà, les nouveaux jeux remplaceront uniquement ceux renseignés.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3 mt-4">
              <button
                onClick={handleAdd}
                disabled={!newResult.date}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-md font-semibold text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Enregistrer
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setNewResult({ date: "", redGame: "", blueGame: "", blackGame: "" })
                }}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-all font-semibold"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-white/20">
          {filteredResults.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-600 text-lg">
                {results.length === 0 ? "Aucun résultat disponible pour ce mois." : "Aucun résultat ne correspond aux filtres."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    <th className="px-2 sm:px-4 md:px-6 py-2 md:py-4 text-left text-xs md:text-sm font-bold uppercase tracking-wider">Date</th>
                    <th className="px-2 sm:px-4 md:px-6 py-2 md:py-4 text-center text-xs md:text-sm font-bold uppercase tracking-wider">🔴 <span className="hidden sm:inline">Jeu Rouge</span></th>
                    <th className="px-2 sm:px-4 md:px-6 py-2 md:py-4 text-center text-xs md:text-sm font-bold uppercase tracking-wider">� <span className="hidden sm:inline">Jeu Bleu</span></th>
                    <th className="px-2 sm:px-4 md:px-6 py-2 md:py-4 text-center text-xs md:text-sm font-bold uppercase tracking-wider">⚫ <span className="hidden sm:inline">Jeu Noir</span></th>
                    {session?.user?.role === "admin" && (
                      <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredResults.map((result) => (
                    <tr key={result.id} id={`result-${result.id}`} className="hover:bg-purple-50 transition-colors scroll-mt-20">
                      {editingId === result.id ? (
                        <>
                          <td className="px-6 py-4">
                            <input
                              type="date"
                              value={editForm.date}
                              onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                              className="px-2 py-1 border rounded text-gray-800"
                            />
                          </td>
                          {["redGame", "blueGame", "blackGame"].map((game) => (
                            <td key={game} className="px-6 py-4">
                              <div className="flex gap-1 justify-center">
                                {[0, 1, 2].map((i) => (
                                  <input
                                    key={i}
                                    type="text"
                                    maxLength={2}
                                    value={editForm[game as keyof typeof editForm][i] as string}
                                    onChange={(e) => {
                                      const val = e.target.value.replace(/\D/g, "")
                                      const updated = [...editForm[game as keyof typeof editForm]] as string[]
                                      updated[i] = val
                                      setEditForm({ ...editForm, [game]: updated })
                                    }}
                                    className="w-12 px-2 py-1 border-2 rounded text-center font-bold text-gray-800"
                                  />
                                ))}
                              </div>
                            </td>
                          ))}
                          <td className="px-6 py-4">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => handleUpdate(result.id)}
                                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                              >
                                ✕
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-2 sm:px-4 md:px-6 py-2 md:py-4 whitespace-nowrap text-xs sm:text-sm font-semibold text-gray-900">
                            {formatDate(result.date)}
                          </td>
                          {[
                            { game: result.redGame, color: "red" },
                            { game: result.blueGame, color: "blue" },
                            { game: result.blackGame, color: "black" }
                          ].map(({ game, color }, idx) => (
                            <td key={idx} className="px-1 sm:px-2 md:px-6 py-2 md:py-4">
                              <div className="flex gap-1 sm:gap-2 justify-center">
                                {splitNumbers(game).map((num, i) => (
                                  <div
                                    key={i}
                                    className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base md:text-lg shadow-lg bg-gradient-to-br ${
                                      color === "red" ? "from-red-500 to-red-600" :
                                      color === "blue" ? "from-blue-500 to-blue-600" :
                                      "from-gray-800 to-black"
                                    }`}
                                  >
                                    {num}
                                  </div>
                                ))}
                              </div>
                            </td>
                          ))}
                          {session?.user?.role === "admin" && (
                            <td className="px-2 sm:px-4 md:px-6 py-2 md:py-4">
                              <div className="flex gap-1 md:gap-2 justify-center flex-col sm:flex-row">
                                <button
                                  onClick={() => handleEdit(result)}
                                  className="px-2 md:px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-xs md:text-sm font-medium"
                                >
                                  Modifier
                                </button>
                              </div>
                            </td>
                          )}
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
