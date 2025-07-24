import { Skeleton } from "@/components/ui/skeleton"
import { FadeIn } from "@/components/ui/fade-in"

export function MessageSkeleton({ index = 0 }: { index?: number }) {
  return (
    <FadeIn delay={index * 50} className="flex gap-3 p-4">
      <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </FadeIn>
  )
}

export function MessageListSkeleton() {
  return (
    <div className="flex-1 overflow-hidden bg-gradient-to-br from-background via-purple-50/30 to-pink-50/30 dark:from-background dark:via-purple-950/10 dark:to-pink-950/10">
      <div className="animate-in slide-in-from-bottom-4 duration-500">
        {Array.from({ length: 10 }).map((_, i) => (
          <MessageSkeleton key={i} index={i} />
        ))}
      </div>
    </div>
  )
}
