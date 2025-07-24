"use client"

import { useState, memo, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useSession } from "@/components/providers/session-provider"
import { LogOut, Settings, User, RefreshCw } from "lucide-react"
import { signOut } from "@/lib/actions/auth"

export const UserMenu = memo(function UserMenu() {
  const [isLoading, setIsLoading] = useState(false)
  const { profile, refreshSession, error: profileError } = useSession()

  // Debug: Log re-renders in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('UserMenu re-rendered', {
        profileId: profile?.id,
        profileUsername: profile?.username,
        hasProfile: !!profile,
        profileError,
        timestamp: new Date().toISOString(),
        stack: new Error().stack?.split('\n').slice(1, 4).join('\n')
      })
    }
  })

  const handleRefresh = async () => {
    console.log('UserMenu: handleRefresh called')
    setIsLoading(true)
    try {
      await refreshSession()
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    console.log('UserMenu: handleSignOut called')
    setIsLoading(true)
    try {
      await signOut()
    } finally {
      setIsLoading(false)
    }
  }

  if (!profile) {
    if (process.env.NODE_ENV === 'development') {
      console.log('UserMenu: No profile available, showing disabled button')
    }
    return (
      <Button variant="ghost" size="sm" disabled>
        <User className="w-4 h-4" />
      </Button>
    )
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('UserMenu: Rendering with profile:', profile)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.display_name || profile.username} />
            <AvatarFallback className="bg-gradient-primary text-white font-semibold">
              {(profile.display_name || profile.username)[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{profile.display_name || profile.username}</p>
            <p className="text-xs leading-none text-muted-foreground">@{profile.username}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Button variant="ghost" className="w-full justify-start">
            <User className="mr-2 h-4 w-4" />
            Profile
          </Button>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Session
          </Button>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={handleSignOut}
            disabled={isLoading}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
})
