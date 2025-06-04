import { ExternalLink } from "lucide-react"

interface AdSpaceProps {
  position: "bottom-left" | "bottom-right"
}

export function AdSpace({ position }: AdSpaceProps) {
  const isLeft = position === "bottom-left"

  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 p-6 text-center">
      <div className="flex flex-col items-center space-y-3">
        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
          <ExternalLink className="w-6 h-6 text-gray-400" />
        </div>

        <div>
          <h4 className="font-medium text-gray-700">{isLeft ? "Eco Products" : "Sustainability Tips"}</h4>
          <p className="text-sm text-gray-500 mt-1">
            {isLeft ? "Discover sustainable products for your daily life" : "Learn more about living sustainably"}
          </p>
        </div>

        <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200">
          Learn More
        </button>
      </div>
    </div>
  )
}
