"use client"

import { useState, useEffect } from "react"
import { XPBar } from "@/components/xp-bar"
import { QuestArea } from "@/components/quest-area"
import { Scoreboard } from "@/components/scoreboard"
import { ProfileAvatar } from "@/components/profile-avatar"
import { FriendsArea } from "@/components/friends-area"
import { AdSpace } from "@/components/ad-space"

interface User {
  id: number
  name: string
  level: number
  xp: number
  xpToNext: number
  coins: number
  rank: number
}

interface Quest {
  id: number
  title: string
  description: string
  xpReward: number
  coinReward: number
  completed: boolean
  category: string
}

export default function LifeQuest() {
  const [user, setUser] = useState<User | null>(null)
  const [quests, setQuests] = useState<Quest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
    fetchQuests()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch("/api/user")
      const userData = await response.json()
      setUser(userData)
    } catch (error) {
      console.error("Error fetching user data:", error)
    }
  }

  const fetchQuests = async () => {
    try {
      const response = await fetch("/api/quests")
      const questsData = await response.json()
      setQuests(questsData)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching quests:", error)
      setLoading(false)
    }
  }

  const completeQuest = async (questId: number) => {
    try {
      const response = await fetch(`/api/quests/${questId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed: true }),
      })

      if (response.ok) {
        const updatedQuest = await response.json()
        setQuests(quests.map((q) => (q.id === questId ? updatedQuest : q)))

        // Update user XP and coins
        if (user) {
          setUser({
            ...user,
            xp: user.xp + updatedQuest.xpReward,
            coins: user.coins + updatedQuest.coinReward,
          })
        }
      }
    } catch (error) {
      console.error("Error completing quest:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-2xl font-bold text-teal-600">Loading LifeQuest...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              LifeQuest
            </h1>
          </div>

          {/* XP Bar - Center */}
          <div className="flex-1 max-w-md mx-8">{user && <XPBar user={user} />}</div>

          {/* Profile Avatar - Right */}
          {user && <ProfileAvatar user={user} />}
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Friends Area - Left Sidebar */}
          <div className="col-span-12 lg:col-span-2">
            <FriendsArea />
          </div>

          {/* Quest Area - Center */}
          <div className="col-span-12 lg:col-span-6">
            <QuestArea quests={quests} onCompleteQuest={completeQuest} />
          </div>

          {/* Scoreboard - Right Sidebar */}
          <div className="col-span-12 lg:col-span-4">
            <Scoreboard currentUser={user} />
          </div>
        </div>

        {/* Ad Spaces - Bottom */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <AdSpace position="bottom-left" />
          <AdSpace position="bottom-right" />
        </div>
      </div>
    </div>
  )
}
