import { NextResponse } from "next/server"

// Mock user data - in a real app, this would come from a database
const mockUser = {
  id: 1,
  name: "Alex Johnson",
  level: 7,
  xp: 2450,
  xpToNext: 3000,
  coins: 1250,
  rank: 15,
}

export async function GET() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return NextResponse.json(mockUser)
}
