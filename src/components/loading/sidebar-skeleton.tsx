import { Skeleton } from "@/components/ui/skeleton"
import { FadeIn } from "@/components/ui/fade-in"

export function SidebarSkeleton() {
  return (
    <div className="w-60 bg-card text-foreground flex flex-col animate-in slide-in-from-left-4 duration-500 border-r border-border/50">
      {/* Server Header */}
      <div className="p-4 border-b border-border/50">
        <FadeIn delay={100}>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-6" />
          </div>
        </FadeIn>
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto p-2">
        <FadeIn delay={200}>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            {Array.from({ length: 4 }).map((_, i) => (
              <FadeIn key={i} delay={300 + i * 50}>
                <div className="flex items-center gap-2 px-2 py-1">
                  <Skeleton className="w-4 h-4" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </FadeIn>
            ))}
          </div>
        </FadeIn>

        {/* Members */}
        <FadeIn delay={500}>
          <div className="mt-6 space-y-2">
            <Skeleton className="h-4 w-20" />
            {Array.from({ length: 6 }).map((_, i) => (
              <FadeIn key={i} delay={600 + i * 50}>
                <div className="flex items-center gap-2 px-2 py-1">
                  <Skeleton className="w-6 h-6 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </FadeIn>
            ))}
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
