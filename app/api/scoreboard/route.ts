import { type NextRequest, NextResponse } from "next/server"

// Mock leaderboard data - in a real app, this would come from a database
const mockLeaderboard = [
  { id: 1, name: "Emma Wilson", level: 25, xp: 15420, rank: 1 },
  { id: 2, name: "David Chen", level: 23, xp: 14890, rank: 2 },
  { id: 3, name: "Sofia Rodriguez", level: 22, xp: 13750, rank: 3 },
  { id: 4, name: "Marcus Johnson", level: 20, xp: 12340, rank: 4 },
  { id: 5, name: "Lisa Park", level: 19, xp: 11890, rank: 5 },
  { id: 6, name: "Tom Anderson", level: 18, xp: 10950, rank: 6 },
  { id: 7, name: "Maya Patel", level: 17, xp: 10200, rank: 7 },
  { id: 8, name: "Chris Brown", level: 16, xp: 9750, rank: 8 },
  { id: 9, name: "Anna Schmidt", level: 15, xp: 9200, rank: 9 },
  { id: 10, name: "Jake Miller", level: 14, xp: 8650, rank: 10 },
  { id: 11, name: "Rachel Green", level: 13, xp: 8100, rank: 11 },
  { id: 12, name: "Kevin Lee", level: 12, xp: 7550, rank: 12 },
  { id: 13, name: "Nicole Davis", level: 11, xp: 7000, rank: 13 },
  { id: 14, name: "Ryan Taylor", level: 10, xp: 6450, rank: 14 },
  { id: 15, name: "Alex Johnson", level: 7, xp: 2450, rank: 15 },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const filter = searchParams.get("filter") || "all"

  // In a real app, you would filter the data based on the time period
  // For now, we'll return the same data regardless of filter

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  return NextResponse.json(mockLeaderboard)
}
