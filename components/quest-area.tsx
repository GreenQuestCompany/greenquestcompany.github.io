"use client"

import { CheckCircle, Coins, Star } from "lucide-react"

interface Quest {
  id: number
  title: string
  description: string
  xpReward: number
  coinReward: number
  completed: boolean
  category: string
}

interface QuestAreaProps {
  quests: Quest[]
  onCompleteQuest: (questId: number) => void
}

export function QuestArea({ quests, onCompleteQuest }: QuestAreaProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "health":
        return "bg-green-100 text-green-800"
      case "environment":
        return "bg-teal-100 text-teal-800"
      case "social":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Daily Quests</h2>

      <div className="space-y-4">
        {quests.map((quest) => (
          <div
            key={quest.id}
            className={`p-4 rounded-lg border transition-all duration-200 ${
              quest.completed ? "bg-green-50 border-green-200" : "bg-white border-gray-200 hover:border-blue-300"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className={`font-semibold ${quest.completed ? "text-green-800" : "text-gray-900"}`}>
                    {quest.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(quest.category)}`}>
                    {quest.category}
                  </span>
                </div>

                <p className={`text-sm mb-3 ${quest.completed ? "text-green-700" : "text-gray-600"}`}>
                  {quest.description}
                </p>

                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1 text-blue-600">
                    <Star className="w-4 h-4" />
                    <span>{quest.xpReward} XP</span>
                  </div>
                  <div className="flex items-center space-x-1 text-yellow-600">
                    <Coins className="w-4 h-4" />
                    <span>{quest.coinReward} Coins</span>
                  </div>
                </div>
              </div>

              <div className="ml-4">
                {quest.completed ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                ) : (
                  <button
                    onClick={() => onCompleteQuest(quest.id)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg hover:from-blue-600 hover:to-teal-600 transition-all duration-200 font-medium"
                  >
                    Complete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
