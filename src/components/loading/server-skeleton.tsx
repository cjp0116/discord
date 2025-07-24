import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { FadeIn } from "@/components/ui/fade-in"

export function ServerCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <FadeIn delay={index * 100} direction="up">
      <Card className="bg-card border-border/50 hover:bg-accent/50 transition-all duration-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <Skeleton className="h-10 w-full rounded-md" />
        </CardContent>
      </Card>
    </FadeIn>
  )
}

export function ServerListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <ServerCardSkeleton key={i} index={i} />
      ))}
    </div>
  )
}
