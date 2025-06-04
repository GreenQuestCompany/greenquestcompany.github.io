"use client"

import { useState, useEffect } from "react"
import { Trophy, Medal, Award } from "lucide-react"

interface User {
  id: number
  name: string
  level: number
  xp: number
  rank: number
}

interface LeaderboardUser {
  id: number
  name: string
  level: number
  xp: number
  rank: number
}

interface ScoreboardProps {
  currentUser: User | null
}

export function Scoreboard({ currentUser }: ScoreboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([])
  const [filter, setFilter] = useState<"day" | "week" | "all">("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [filter])

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`/api/scoreboard?filter=${filter}`)
      const data = await response.json()
      setLeaderboard(data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching leaderboard:", error)
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">#{rank}</span>
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Leaderboard</h2>

      {/* Filter Buttons */}
      <div className="flex space-x-2 mb-6">
        {(["day", "week", "all"] as const).map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
              filter === filterOption ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {filterOption === "day" ? "Today" : filterOption === "week" ? "Week" : "All Time"}
          </button>
        ))}
      </div>

      {/* Leaderboard List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-4 text-gray-500">Loading...</div>
        ) : (
          leaderboard.slice(0, 10).map((user) => (
            <div
              key={user.id}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                currentUser?.id === user.id ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
              }`}
            >
              <div className="flex-shrink-0">{getRankIcon(user.rank)}</div>

              <div className="flex-1 min-w-0">
                <p
                  className={`font-medium truncate ${currentUser?.id === user.id ? "text-blue-900" : "text-gray-900"}`}
                >
                  {user.name}
                </p>
                <p className="text-sm text-gray-500">Level {user.level}</p>
              </div>

              <div className="text-right">
                <p className="font-semibold text-gray-900">{user.xp.toLocaleString()}</p>
                <p className="text-xs text-gray-500">XP</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Current User Rank */}
      {currentUser && currentUser.rank > 10 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex-shrink-0">
              <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-blue-600">
                #{currentUser.rank}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-blue-900">{currentUser.name} (You)</p>
              <p className="text-sm text-blue-700">Level {currentUser.level}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-blue-900">{currentUser.xp.toLocaleString()}</p>
              <p className="text-xs text-blue-700">XP</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
