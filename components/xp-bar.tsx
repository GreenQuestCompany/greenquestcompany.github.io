interface User {
  level: number
  xp: number
  xpToNext: number
}

interface XPBarProps {
  user: User
}

export function XPBar({ user }: XPBarProps) {
  const progress = (user.xp / user.xpToNext) * 100

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Level {user.level}</span>
        <span className="text-sm text-gray-500">
          {user.xp} / {user.xpToNext} XP
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-gradient-to-r from-blue-500 to-teal-500 h-3 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
