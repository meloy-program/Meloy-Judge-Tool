"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Screen } from "@/app/page"
import { Calendar, MapPin, Users, Settings, Shield, ChevronRight } from "lucide-react"

interface DashboardScreenProps {
  onSelectEvent: (eventId: string) => void
  onNavigate: (screen: Screen) => void
  isAdmin: boolean
}

const mockEvents = [
  {
    id: "1",
    name: "Aggies Invent Spring 2025",
    date: "March 15-17, 2025",
    location: "Zachry Engineering Center",
    status: "active",
    teamsCount: 24,
  },
  {
    id: "2",
    name: "Aggies Invent Fall 2024",
    date: "October 20-22, 2024",
    location: "Memorial Student Center",
    status: "completed",
    teamsCount: 18,
  },
  {
    id: "3",
    name: "Aggies Invent Summer 2024",
    date: "July 10-12, 2024",
    location: "Engineering Innovation Center",
    status: "completed",
    teamsCount: 20,
  },
]

export function DashboardScreen({ onSelectEvent, onNavigate, isAdmin }: DashboardScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5">
      {/* --- Navbar --- */}
      <header className="relative border-b bg-gradient-to-b from-primary to-[#3d0000] backdrop-blur-sm shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
        <div className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-6 md:px-8">
          <div className="flex items-center gap-6">
            <div className="flex h-16 w-auto items-center justify-center rounded-xl bg-white/15 backdrop-blur-md shadow-md p-2 border border-white/25">
              <Image src="/apptitle.png" alt="Meloy Program Judging Portal" width={130} height={60} className="object-contain" />
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {isAdmin && (
              <Button
                variant="secondary"
                onClick={() => onNavigate("admin")}
                className="h-11 px-5 text-base font-medium bg-white text-primary shadow-sm transition-all hover:bg-primary/10 hover:text-white"
              >
                <Shield className="mr-2 h-5 w-5" />
                Admin
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={() => onNavigate("settings")}
              className="flex h-11 w-11 items-center justify-center rounded-lg p-2 text-white/90 transition-all hover:bg-white/15 hover:text-white"
            >
              <Settings className="size-7" />
            </Button>
          </div>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="relative mx-auto max-w-7xl px-6 py-10 md:py-12">
        <div className="absolute inset-0 -z-10 rounded-[32px] bg-gradient-to-b from-white via-slate-50 to-primary/10 shadow-[0_24px_80px_rgba(148,163,184,0.25)]" />
        <div className="mt-4 mb-10 flex justify-center">
          <div className="flex flex-col items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-[2.25rem] md:text-[2.5rem]">
              My Events
            </h1>
            <span className="h-[3px] w-24 rounded-full bg-gradient-to-r from-primary/80 via-primary/70 to-primary/80" />
          </div>
        </div>

        {/* --- Events Grid --- */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {mockEvents.map((event, index) => (
            <Card
              key={event.id}
              className="group relative cursor-pointer overflow-hidden rounded-3xl border border-slate-200/70 bg-white/95 ring-1 ring-primary/10 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:ring-primary/25 hover:shadow-2xl"
              onClick={() => onSelectEvent(event.id)}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/70 to-primary/50" />

              <CardHeader className="relative px-5 pb-3 pt-6 lg:px-6">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <CardTitle className="text-xl font-semibold leading-snug text-slate-900 transition-colors duration-200 group-hover:text-primary line-clamp-2">
                    {event.name}
                  </CardTitle>
                  <Badge
                    variant={event.status === "active" ? "default" : "secondary"}
                    className={`shrink-0 text-xs font-semibold px-3 py-1 uppercase tracking-wide ${
                      event.status === "active"
                        ? "bg-emerald-500/90 text-white shadow-sm shadow-emerald-500/30"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {event.status}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-3 text-base font-medium text-slate-600">
                  <Calendar className="h-5 w-5 text-primary/80" />
                  {event.date}
                </CardDescription>
              </CardHeader>

              <CardContent className="relative px-5 pb-6 pt-1 lg:px-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm transition-all duration-300 group-hover:border-primary/40 group-hover:shadow-md">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-105">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <span className="flex-1 text-base font-medium text-slate-700 leading-tight">
                      {event.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm transition-all duration-300 group-hover:border-primary/40 group-hover:shadow-md">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-105">
                      <Users className="h-5 w-5" />
                    </div>
                    <span className="flex-1 text-base font-medium text-slate-700">
                      {event.teamsCount} Teams
                    </span>
                  </div>
                </div>
                <div className="mt-6 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between rounded-xl bg-primary px-5 py-3 text-white transition-all duration-300 group-hover:bg-primary/90">
                    <span className="text-sm font-semibold uppercase tracking-wide">View Event</span>
                    <ChevronRight className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
