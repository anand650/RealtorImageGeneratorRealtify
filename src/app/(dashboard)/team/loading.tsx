export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-64 bg-gray-200 rounded mt-2 animate-pulse" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
        <div className="space-y-3">
          <div className="h-40 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}





