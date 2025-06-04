import { NextResponse } from "next/server"

// Mock quests data - in a real app, this would come from a database
const mockQuests = [
  {
    id: 1,
    title: "Drink 8 Glasses of Water",
    description: "Stay hydrated throughout the day by drinking at least 8 glasses of water.",
    xpReward: 50,
    coinReward: 10,
    completed: false,
    category: "health",
  },
  {
    id: 2,
    title: "Walk 10,000 Steps",
    description: "Take a walk and reach your daily step goal of 10,000 steps.",
    xpReward: 75,
    coinReward: 15,
    completed: true,
    category: "health",
  },
  {
    id: 3,
    title: "Use Reusable Bag",
    description: "Bring your own reusable bag when shopping to reduce plastic waste.",
    xpReward: 40,
    coinReward: 8,
    completed: false,
    category: "environment",
  },
  {
    id: 4,
    title: "Recycle Properly",
    description: "Sort and recycle your waste according to local guidelines.",
    xpReward: 30,
    coinReward: 6,
    completed: false,
    category: "environment",
  },
  {
    id: 5,
    title: "Call a Friend",
    description: "Connect with a friend or family member and have a meaningful conversation.",
    xpReward: 35,
    coinReward: 7,
    completed: false,
    category: "social",
  },
]

export async function GET() {
  return NextResponse.json(mockQuests)
}
