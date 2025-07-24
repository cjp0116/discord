"use client"

import { useServers } from "@/lib/hooks/use-servers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Users, RefreshCw } from "lucide-react"
import Link from "next/link"
import { ServerListSkeleton } from "@/components/loading/server-skeleton"
import { FadeIn } from "@/components/ui/fade-in"

export function ServerList() {
  const { data: servers, loading, error, refetch } = useServers()

  if (loading) {
    return <ServerListSkeleton />
  }

  if (error) {
    return (
      <FadeIn className="text-center py-8">
        <div className="space-y-4">
          <p className="text-muted-foreground">Failed to load servers: {error}</p>
          <Button
            onClick={refetch}
            variant="outline"
            className="transition-all duration-200 hover:scale-105 bg-transparent hover:bg-accent"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </FadeIn>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {servers?.map((serverMember, index) => {
        const server = serverMember.servers
     
        if (!server) return null

        return (
          <FadeIn key={server.id} delay={index * 100} direction="up">
            <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-border/50 hover:border-primary/30 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardHeader className="relative">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 transition-transform duration-200 group-hover:scale-110 ring-2 ring-primary/20 group-hover:ring-primary/40">
                    <AvatarImage src={server.icon_url || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                      {server.name[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-foreground group-hover:text-primary transition-colors duration-200 font-semibold">
                      {server.name}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {serverMember.role === "owner" ? "Owner" : "Member"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {server.description || "No description available"}
                </p>
                <Button asChild className="w-full bg-gradient-primary text-white hover:shadow-lg transition-all duration-200 hover:scale-105">
                  <Link href={`/servers/${server.id}`}>
                    <Users className="w-4 h-4 mr-2" />
                    Join Server
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </FadeIn>
        )
      })}

      {/* Join Server Card */}
      <FadeIn delay={(servers?.length || 0) * 100} direction="up">
        <Card className="border-dashed border-primary/30 hover:border-primary/50 group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CardContent className="flex flex-col items-center justify-center h-full p-6 relative">
            <Plus className="w-12 h-12 text-primary mb-4 transition-transform duration-200 group-hover:scale-110" />
            <h3 className="text-lg font-semibold mb-2 text-foreground">Join a Server</h3>
            <p className="text-muted-foreground text-center mb-4">Enter an invite code to join an existing server</p>
            <Button variant="outline" asChild className="transition-all duration-200 hover:scale-105 bg-transparent hover:bg-accent border-primary/30 hover:border-primary/50">
              <Link href="/servers/join">Join Server</Link>
            </Button>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  )
}
