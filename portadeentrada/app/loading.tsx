export default function Loading() {
  return (
    <div className="min-h-screen bg-surface-alt animate-fade-in">
      {/* Skeleton Header */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/95 to-transparent z-50">
        <div className="flex items-center justify-between px-10 py-3 h-full">
          <div className="h-10 w-40 bg-white/10 rounded animate-pulse" />
          <div className="flex gap-4">
            <div className="h-8 w-24 bg-white/10 rounded animate-pulse" />
            <div className="h-8 w-20 bg-white/10 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Skeleton Content */}
      <div className="pt-24 px-10 max-w-6xl mx-auto">
        {/* Hero skeleton */}
        <div className="h-[500px] bg-surface-muted rounded-2xl mb-8 animate-pulse" />

        {/* Cards skeleton */}
        <div className="grid grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="aspect-square bg-surface-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}