import { type NextRequest, NextResponse } from "next/server"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const questId = Number.parseInt(params.id)
  const body = await request.json()

  // Mock quest completion - in a real app, this would update the database
  const completedQuest = {
    id: questId,
    title: "Quest Completed",
    description: "Great job completing this quest!",
    xpReward: 50,
    coinReward: 10,
    completed: true,
    category: "completed",
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  return NextResponse.json(completedQuest)
}
