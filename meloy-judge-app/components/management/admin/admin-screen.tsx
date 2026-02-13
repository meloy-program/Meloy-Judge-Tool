"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useUser } from '@auth0/nextjs-auth0/client'
import type { LucideIcon } from "lucide-react"
import {
  ArrowLeft,
  Calendar,
  Shield,
  BarChart3,
  Sparkles,
  Clock,
  UsersRound,
  User,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminEventsTab } from "./admin-events-tab"
import { AdminAccountsTab } from "./admin-accounts-tab"
import { AdminEventsRecapTab } from "./admin-events-recap-tab"
import { getCurrentUser } from "@/lib/api"

interface AdminScreenProps {
  onBack: () => void
  onCreateEvent: () => void
  onManageEvent: (eventId: string) => void
}

export function AdminScreen({ onBack, onCreateEvent, onManageEvent }: AdminScreenProps) {
  const { user: auth0User } = useUser()
  const [userRole, setUserRole] = useState<string>('admin')

  // Fetch user data
  useEffect(() => {
    async function fetchUserData() {
      try {
        const userData = await getCurrentUser()
        setUserRole(userData.user.role || 'admin')
      } catch (err) {
        console.error('Failed to fetch user data:', err)
      }
    }
    fetchUserData()
  }, [])

  // Get user name from Auth0 or fallback
  const userName = auth0User?.name || auth0User?.email?.split('@')[0] || 'Admin'

  // Event history data for the timeline
  const eventHistoryData = [
    {
      name: "Aggies Invent Fall 2024",
      date: "Oct 20-22, 2024",
      status: "completed" as const,
      teams: [
        { 
          name: "Team Alpha",
          judges: [
            { name: "Dr. Smith", communication: 22, fundBuy: 21, presentation: 21, cohesion: 21 },
            { name: "Prof. Johnson", communication: 21, fundBuy: 20, presentation: 22, cohesion: 21 },
            { name: "Dr. Williams", communication: 22, fundBuy: 22, presentation: 21, cohesion: 21 },
            { name: "Dr. Brown", communication: 22, fundBuy: 21, presentation: 21, cohesion: 21 },
          ],
          avgTime: 22
        },
        { 
          name: "Team Beta",
          judges: [
            { name: "Dr. Smith", communication: 23, fundBuy: 22, presentation: 22, cohesion: 21 },
            { name: "Prof. Johnson", communication: 22, fundBuy: 21, presentation: 22, cohesion: 21 },
            { name: "Dr. Williams", communication: 21, fundBuy: 21, presentation: 22, cohesion: 22 },
            { name: "Dr. Brown", communication: 22, fundBuy: 21, presentation: 22, cohesion: 21 },
          ],
          avgTime: 23
        },
        { 
          name: "Team Gamma",
          judges: [
            { name: "Dr. Smith", communication: 21, fundBuy: 20, presentation: 21, cohesion: 20 },
            { name: "Prof. Johnson", communication: 21, fundBuy: 21, presentation: 22, cohesion: 21 },
            { name: "Dr. Williams", communication: 22, fundBuy: 21, presentation: 21, cohesion: 21 },
            { name: "Dr. Brown", communication: 21, fundBuy: 20, presentation: 22, cohesion: 21 },
          ],
          avgTime: 21
        },
      ],
    },
    {
      name: "ExxonMobil Innovation Challenge 2024",
      date: "Aug 5-7, 2024",
      status: "completed" as const,
      sponsor: {
        name: "ExxonMobil",
        logo: "/ExxonLogo.png",
        primaryColor: "#E31937",
        secondaryColor: "#8B1538",
      },
      teams: [
        { 
          name: "Energy Innovators",
          judges: [
            { name: "Dr. Smith", communication: 23, fundBuy: 22, presentation: 23, cohesion: 22 },
            { name: "Prof. Johnson", communication: 22, fundBuy: 23, presentation: 22, cohesion: 23 },
            { name: "Dr. Williams", communication: 23, fundBuy: 22, presentation: 23, cohesion: 22 },
            { name: "Dr. Brown", communication: 22, fundBuy: 23, presentation: 22, cohesion: 23 },
          ],
          avgTime: 24
        },
        { 
          name: "Sustainable Solutions",
          judges: [
            { name: "Dr. Smith", communication: 22, fundBuy: 21, presentation: 22, cohesion: 21 },
            { name: "Prof. Johnson", communication: 21, fundBuy: 22, presentation: 21, cohesion: 22 },
            { name: "Dr. Williams", communication: 22, fundBuy: 21, presentation: 22, cohesion: 21 },
            { name: "Dr. Brown", communication: 21, fundBuy: 22, presentation: 21, cohesion: 22 },
          ],
          avgTime: 23
        },
      ],
    },
    {
      name: "Problems Worth Solving Summer 2024",
      date: "Jul 10-12, 2024",
      status: "completed" as const,
      teams: [
        { 
          name: "Innovators",
          judges: [
            { name: "Dr. Smith", communication: 21, fundBuy: 20, presentation: 21, cohesion: 20 },
            { name: "Prof. Johnson", communication: 20, fundBuy: 20, presentation: 21, cohesion: 20 },
            { name: "Dr. Williams", communication: 21, fundBuy: 20, presentation: 20, cohesion: 21 },
            { name: "Dr. Brown", communication: 20, fundBuy: 20, presentation: 21, cohesion: 20 },
          ],
          avgTime: 20
        },
        { 
          name: "Pioneers",
          judges: [
            { name: "Dr. Smith", communication: 21, fundBuy: 21, presentation: 22, cohesion: 21 },
            { name: "Prof. Johnson", communication: 22, fundBuy: 21, presentation: 21, cohesion: 21 },
            { name: "Dr. Williams", communication: 21, fundBuy: 20, presentation: 22, cohesion: 21 },
            { name: "Dr. Brown", communication: 21, fundBuy: 21, presentation: 21, cohesion: 21 },
          ],
          avgTime: 19
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-primary/5">
      <header className="relative z-30 border-b bg-linear-to-b from-primary to-[#3d0000] backdrop-blur-sm shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-3 sm:py-4 lg:px-8">
          {/* Main Header Row - Always one line */}
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Left Side: Back Button + Logo */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 shrink-0">
              <Button
                variant="ghost"
                onClick={onBack}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-white/30 bg-white/10 text-white shadow-lg backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <div className="flex h-14 sm:h-16 lg:h-20 xl:h-20 w-auto shrink-0 items-center justify-center rounded-xl border border-white/25 bg-white/15 px-2 sm:px-3 py-2 shadow-md backdrop-blur-md">
                <Image src="/meloyprogram.png" alt="Meloy Program Judging Portal" width={160} height={64} className="h-10 sm:h-12 lg:h-14 xl:h-16 w-auto object-contain" />
              </div>
            </div>

            {/* Center: Title (hidden on mobile, shown on larger screens) */}
            <div className="hidden md:flex flex-col items-center flex-1 min-w-0 px-4">
              <div className="flex items-center gap-2">
                <Shield className="h-6 lg:h-7 xl:h-8 w-6 lg:w-7 xl:w-8 text-white opacity-60" />
                <h1 className="text-2xl lg:text-3xl xl:text-4xl font-semibold text-white leading-tight text-center truncate">Admin Control Center</h1>
              </div>
            </div>

            {/* Right Side: User Profile */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* User Profile - Always visible */}
              <div className="flex items-center gap-2 sm:gap-3 rounded-full border-2 border-white/30 bg-white/10 px-3 sm:px-4 py-2 shadow-lg backdrop-blur-sm">
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border-2 border-white/50 bg-white/20">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-white leading-tight truncate">{userName}</span>
                  <span className="text-xs text-white/70 capitalize truncate">{userRole}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Title - Centered Below */}
          <div className="md:hidden mt-3 flex flex-col items-center text-center">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-white opacity-60" />
              <h1 className="text-xl font-semibold text-white leading-tight">Admin Control Center</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-6 py-5 lg:py-6 lg:px-8">
        <div className="space-y-8">
          <Tabs defaultValue="events" className="w-full">
            <TabsList className="grid h-16 w-full grid-cols-3 rounded-2xl border border-slate-200 bg-white/80 p-2 shadow-lg backdrop-blur">
              <TabsTrigger
                value="events"
                className="flex h-full items-center justify-center rounded-xl border border-transparent text-base font-semibold text-slate-600 transition-all duration-300 data-[state=active]:border-primary/30 data-[state=active]:bg-linear-to-r data-[state=active]:from-primary/10 data-[state=active]:to-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-md"
              >
                <Calendar className="mr-2 h-5 w-5" />
                Events
              </TabsTrigger>
              <TabsTrigger
                value="accounts"
                className="flex h-full items-center justify-center rounded-xl border border-transparent text-base font-semibold text-slate-600 transition-all duration-300 data-[state=active]:border-primary/30 data-[state=active]:bg-linear-to-r data-[state=active]:from-primary/10 data-[state=active]:to-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-md"
              >
                <Shield className="mr-2 h-5 w-5" />
                Accounts
              </TabsTrigger>
              <TabsTrigger
                value="insights"
                className="flex h-full items-center justify-center rounded-xl border border-transparent text-base font-semibold text-slate-600 transition-all duration-300 data-[state=active]:border-primary/30 data-[state=active]:bg-linear-to-r data-[state=active]:from-primary/10 data-[state=active]:to-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-md"
              >
                <BarChart3 className="mr-2 h-5 w-5" />
                Events Recap
              </TabsTrigger>
            </TabsList>

            <div className="mt-10 space-y-10">
              <TabsContent value="events" className="space-y-8">
                <AdminEventsTab 
                  onCreateEvent={onCreateEvent}
                  onManageEvent={onManageEvent}
                />
              </TabsContent>

              <TabsContent value="accounts" className="space-y-8">
                <AdminAccountsTab />
              </TabsContent>

              <TabsContent value="insights" className="space-y-8">
                <AdminEventsRecapTab eventHistory={eventHistoryData} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
