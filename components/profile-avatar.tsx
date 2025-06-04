import { Settings, Coins } from "lucide-react"

interface ProfileUser {
  name: string
  level: number
  coins: number
}

interface ProfileAvatarProps {
  user: ProfileUser
}

export function ProfileAvatar({ user }: ProfileAvatarProps) {
  return (
    <div className="flex items-center space-x-4">
      {/* Coins Display */}
      <div className="flex items-center space-x-1 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
        <Coins className="w-4 h-4 text-yellow-600" />
        <span className="font-medium text-yellow-800">{user.coins.toLocaleString()}</span>
      </div>

      {/* Profile Button */}
      <button className="flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-lg border border-gray-200 transition-all duration-200">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
          <Settings className="w-4 h-4 text-white" />
        </div>
        <div className="text-left">
          <p className="font-medium text-gray-900">{user.name}</p>
          <p className="text-xs text-gray-500">Level {user.level}</p>
        </div>
        <Settings className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  )
}
