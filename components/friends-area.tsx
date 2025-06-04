import { Users, MessageCircle, UserPlus } from "lucide-react"

export function FriendsArea() {
  const activeFriends = 3
  const totalFriends = 5

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Friends</h3>

      {/* Active Friends Counter */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <Users className="w-5 h-5 text-teal-600" />
          <span className="font-medium text-gray-900">Active Now</span>
        </div>
        <div className="text-2xl font-bold text-teal-600">
          {activeFriends}/{totalFriends}
        </div>
        <p className="text-sm text-gray-500">friends online</p>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <button className="w-full flex items-center space-x-2 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-all duration-200">
          <MessageCircle className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">Group Chat</span>
        </button>

        <button className="w-full flex items-center space-x-2 p-3 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-all duration-200">
          <UserPlus className="w-4 h-4 text-teal-600" />
          <span className="text-sm font-medium text-teal-800">Invite Friends</span>
        </button>
      </div>

      {/* Friend List Preview */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="space-y-2">
          {[
            { name: "Alex", status: "online", level: 12 },
            { name: "Sarah", status: "online", level: 8 },
            { name: "Mike", status: "online", level: 15 },
          ].map((friend, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-700">{friend.name}</span>
              <span className="text-xs text-gray-500">L{friend.level}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
