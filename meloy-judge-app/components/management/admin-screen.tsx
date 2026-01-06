"use client"

import { useState } from "react"
import Image from "next/image"
import type { LucideIcon } from "lucide-react"
import {
  ArrowLeft,
  Calendar,
  Users,
  UsersRound,
  Plus,
  Edit,
  Trash2,
  Mail,
  FileUp,
  Shield,
  BarChart3,
  Sparkles,
  Clock,
  Trophy,
  CheckCircle2,
  Target,
  Download,
  Timer,
  Search,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AdminScreenProps {
  onBack: () => void
  onCreateEvent: () => void
  onManageEvent: (eventId: string) => void
}

const mockAccounts = [
  { id: "1", name: "Dr. Sarah Johnson", email: "sjohnson@tamu.edu", isJudge: true, isAdmin: false, isModerator: false },
  { id: "2", name: "Prof. Michael Chen", email: "mchen@tamu.edu", isJudge: true, isAdmin: true, isModerator: false },
  { id: "3", name: "Dr. Emily Rodriguez", email: "erodriguez@tamu.edu", isJudge: false, isAdmin: false, isModerator: true },
  { id: "4", name: "Dr. James Wilson", email: "jwilson@tamu.edu", isJudge: true, isAdmin: false, isModerator: true },
  { id: "5", name: "Prof. Lisa Anderson", email: "landerson@tamu.edu", isJudge: false, isAdmin: true, isModerator: false },
  { id: "6", name: "Dr. Robert Taylor", email: "rtaylor@tamu.edu", isJudge: true, isAdmin: false, isModerator: false },
  { id: "7", name: "Dr. Maria Garcia", email: "mgarcia@tamu.edu", isJudge: false, isAdmin: true, isModerator: true },
  { id: "8", name: "Prof. David Lee", email: "dlee@tamu.edu", isJudge: true, isAdmin: false, isModerator: false },
]

const mockEvents = [
  { id: "1", name: "Aggies Invent Spring 2025", teams: 24, judges: 8, status: "active", date: "Mar 21, 2025" },
  { id: "2", name: "Aggies Invent Fall 2024", teams: 18, judges: 6, status: "completed", date: "Oct 14, 2024" },
]

type ActivityItem = {
  id: string
  title: string
  description: string
  time: string
  icon: LucideIcon
  tone: string
}

const recentActivity: ActivityItem[] = [
  {
    id: "1",
    title: "Event timeline published",
    description: "Aggies Invent Spring 2025 schedule locked and shared with judges.",
    time: "Today - 9:41 AM",
    icon: Calendar,
    tone: "text-emerald-500",
  },
  {
    id: "2",
    title: "Judge assignments balanced",
    description: "Average of 3.1 teams per judge after latest assignments.",
    time: "Yesterday - 6:18 PM",
    icon: UsersRound,
    tone: "text-sky-500",
  },
  {
    id: "3",
    title: "Insights exported",
    description: "Summary CSV shared with directors for closing ceremony.",
    time: "Mon - 2:03 PM",
    icon: BarChart3,
    tone: "text-purple-500",
  },
]

const bestPractices = [
  "Require multi-factor auth for all admin roles",
  "Rotate judge access every event cycle",
  "Archive scoring data after 120 days",
]

const teamSpotlight = {
  team: "Project Helios",
  event: "Aggies Invent Spring 2025",
  summary: "AI-powered campus energy optimizer delivering 27% efficiency gains.",
  category: "Sustainability",
  score: "92.4",
}

export function AdminScreen({ onBack, onCreateEvent, onManageEvent }: AdminScreenProps) {
  const [newJudgeEmail, setNewJudgeEmail] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null)

  const activeEvents = mockEvents.filter((event) => event.status === "active").length
  const totalEvents = mockEvents.length
  const totalJudges = mockAccounts.filter(account => account.isJudge).length

  const highlightMetrics = [
    {
      id: "active-events",
      label: "Active events",
      value: activeEvents.toString(),
      icon: Calendar,
      iconColor: "text-emerald-500",
      bgColor: "bg-emerald-50",
    },
    {
      id: "total-events",
      label: "Total events",
      value: totalEvents.toString(),
      icon: Calendar,
      iconColor: "text-primary",
      bgColor: "bg-primary/5",
    },
    {
      id: "total-judges",
      label: "Total judges",
      value: totalJudges.toString(),
      icon: UsersRound,
      iconColor: "text-sky-500",
      bgColor: "bg-sky-50",
    },
  ]

  const upcomingEvent = mockEvents[0]

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-primary/5">
      <header className="relative border-b bg-linear-to-b from-primary to-[#3d0000] backdrop-blur-sm shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
        <div className="relative mx-auto max-w-7xl px-6 py-4 lg:px-8">
          <div className="flex items-center justify-between gap-4 lg:gap-6">
            <div className="flex items-center gap-4 lg:gap-5">
              <Button
                variant="ghost"
                onClick={onBack}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-white/30 bg-white/10 text-white shadow-lg backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20"
              >
                <ArrowLeft className="h-7 w-7" />
              </Button>
              <div className="flex h-16 lg:h-20 w-auto items-center justify-center rounded-xl bg-white/15 backdrop-blur-md shadow-md px-3 py-2 border border-white/25">
                <Image src="/meloyprogram.png" alt="Meloy Program Judging Portal" width={160} height={64} className="h-12 lg:h-16 w-auto object-contain" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-semibold text-white leading-tight">Admin Control Center</h1>
                <p className="text-sm text-white/90">Orchestrate events, coach judges, and spotlight standout teams.</p>
              </div>
            </div>
            <Badge variant="secondary" className="hidden sm:flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] text-white">
              <Sparkles className="h-3.5 w-3.5" />
              Live Cohort 2025
            </Badge>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-6 py-5 lg:py-6 lg:px-8">
        <div className="mb-8 grid grid-cols-3 gap-4">
          {highlightMetrics.map((metric) => {
            const Icon = metric.icon

            return (
              <div
                key={metric.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-lg backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className={`absolute inset-0 bg-linear-to-br ${metric.bgColor === 'bg-emerald-50' ? 'from-emerald-200/60 via-emerald-100/40 to-transparent' : metric.bgColor === 'bg-primary/5' ? 'from-primary/25 via-primary/10 to-transparent' : 'from-sky-200/60 via-sky-100/40 to-transparent'}`} />
                <div className="relative flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white/80 shadow-sm">
                    <Icon className={`h-6 w-6 ${metric.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">{metric.label}</p>
                    <p className="mt-0.5 text-3xl font-semibold text-slate-900">{metric.value}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

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
                Insights
              </TabsTrigger>
            </TabsList>

            <div className="mt-10 space-y-10">
              <TabsContent value="events" className="space-y-8">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-3xl font-semibold text-slate-800">Your Events</h3>
                  <Button 
                    onClick={onCreateEvent}
                    className="h-14 rounded-2xl bg-primary px-8 text-lg font-semibold shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                  >
                    <Plus className="mr-2 h-6 w-6" />
                    Create New Event
                  </Button>
                </div>

                <div>
                  <div className="grid gap-6 md:grid-cols-2">
                    {mockEvents.map((event) => (
                      <Card
                        key={event.id}
                        className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
                      >
                        <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-rose-400 to-orange-300 opacity-70" />
                        <CardHeader className="px-6 pb-4 pt-6">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <CardTitle className="text-2xl font-semibold text-slate-800 group-hover:text-primary transition-colors">
                                {event.name}
                              </CardTitle>
                              <CardDescription className="mt-3 flex flex-col gap-2 text-base text-slate-600">
                                <span className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-primary" />
                                  {event.date}
                                </span>
                                <span className="flex items-center gap-4 text-sm text-slate-500">
                                  <span className="flex items-center gap-2">
                                    <Users className="h-4 w-4" /> {event.teams} teams
                                  </span>
                                  <span className="flex items-center gap-2">
                                    <UsersRound className="h-4 w-4" /> {event.judges} judges
                                  </span>
                                </span>
                              </CardDescription>
                            </div>
                            <Badge
                              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide shadow-sm ${
                                event.status === "active"
                                  ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                  : "bg-slate-200 text-slate-700 border border-slate-300"
                              }`}
                            >
                              {event.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardFooter className="flex flex-wrap gap-3 border-t border-slate-100/80 p-6">
                          <Button 
                            onClick={() => onManageEvent(event.id)}
                            className="h-11 flex-1 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Manage Event
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>

                <Card className="rounded-3xl border border-slate-200/80 bg-white/90 shadow-lg">
                  <CardHeader className="p-6 pb-4">
                    <CardTitle className="text-xl font-semibold text-slate-900">Recent Activity</CardTitle>
                    <CardDescription className="text-sm text-slate-500">
                      Track the most recent moves across events, judges, and scoring workflows.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <div className="relative flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                      {recentActivity.map((item) => {
                        const Icon = item.icon

                        return (
                          <div key={item.id} className="min-w-[340px] shrink-0">
                            <div className="rounded-2xl border border-slate-200/60 bg-slate-50/70 px-5 py-4 h-full">
                              <div className="flex items-start gap-3 mb-3">
                                <span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-md ring-2 ring-primary/20`}>
                                  <Icon className={`h-5 w-5 ${item.tone}`} />
                                </span>
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                                  <span className="mt-1 inline-flex text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                    {item.time}
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm text-slate-500">{item.description}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="accounts" className="space-y-8">
                <div>
                  <div className="mb-6">
                    <h3 className="text-3xl font-semibold text-slate-800">Account Permissions</h3>
                    <p className="mt-2 text-base text-slate-600">Manage user roles and access levels across the platform</p>
                  </div>

                  <div className="mb-6">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search accounts by name or email..."
                        className="h-14 rounded-2xl border-slate-200 bg-white pl-12 pr-4 text-base shadow-lg focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                    <div className="absolute inset-0 bg-linear-to-b from-primary to-[#3d0000]" />
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
                    
                    <div className="relative max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-white/5">
                      <div className="divide-y divide-white/10">
                        {mockAccounts
                          .filter((account) => 
                            account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            account.email.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .map((account, index) => (
                          <div
                            key={account.id}
                            className="group relative p-6 transition-all hover:bg-white/5"
                          >
                            <div className="flex items-center justify-between gap-6">
                              <div className="flex-1">
                                <div className="flex items-center gap-4">
                                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white shadow-lg backdrop-blur-sm border border-white/20">
                                    <Users className="h-6 w-6" />
                                  </div>
                                  <div>
                                    <h4 className="text-lg font-semibold text-white transition-colors">
                                      {account.name}
                                    </h4>
                                    <p className="mt-0.5 flex items-center gap-2 text-sm text-white/70">
                                      <Mail className="h-3.5 w-3.5" />
                                      {account.email}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-6">
                                {editingAccountId === account.id ? (
                                  <>
                                    <div className="flex items-center gap-4">
                                      <button
                                        className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 shadow-sm backdrop-blur-sm transition-all hover:shadow-md ${
                                          account.isJudge
                                            ? 'border-red-500/60 bg-red-500/20 hover:border-red-400/70 hover:bg-red-500/30'
                                            : 'border-white/20 bg-white/10 hover:border-white/40 hover:bg-white/20'
                                        }`}
                                      >
                                        <span className={`text-sm font-semibold ${
                                          account.isJudge ? 'text-red-300' : 'text-white/70'
                                        }`}>
                                          Judge
                                        </span>
                                      </button>

                                      <button
                                        className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 shadow-sm backdrop-blur-sm transition-all hover:shadow-md ${
                                          account.isAdmin
                                            ? 'border-blue-500/60 bg-blue-500/20 hover:border-blue-400/70 hover:bg-blue-500/30'
                                            : 'border-white/20 bg-white/10 hover:border-white/40 hover:bg-white/20'
                                        }`}
                                      >
                                        <span className={`text-sm font-semibold ${
                                          account.isAdmin ? 'text-blue-300' : 'text-white/70'
                                        }`}>
                                          Admin
                                        </span>
                                      </button>

                                      <button
                                        className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 shadow-sm backdrop-blur-sm transition-all hover:shadow-md ${
                                          account.isModerator
                                            ? 'border-emerald-500/60 bg-emerald-500/20 hover:border-emerald-400/70 hover:bg-emerald-500/30'
                                            : 'border-white/20 bg-white/10 hover:border-white/40 hover:bg-white/20'
                                        }`}
                                      >
                                        <span className={`text-sm font-semibold ${
                                          account.isModerator ? 'text-emerald-300' : 'text-white/70'
                                        }`}>
                                          Moderator
                                        </span>
                                      </button>
                                    </div>

                                    <div className="flex items-center gap-3">
                                      <Button
                                        onClick={() => setEditingAccountId(null)}
                                        className="h-10 rounded-xl border-2 border-white/30 bg-white/20 px-5 text-sm font-semibold text-white shadow-sm backdrop-blur-sm transition-all hover:bg-white/30 hover:shadow-md"
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        onClick={() => {
                                          // Save logic would go here
                                          setEditingAccountId(null)
                                        }}
                                        className="h-10 rounded-xl border-2 border-white/30 bg-white/20 px-5 text-sm font-semibold text-white shadow-sm backdrop-blur-sm transition-all hover:bg-white/30 hover:shadow-md"
                                      >
                                        Save
                                      </Button>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <Button
                                      onClick={() => setEditingAccountId(account.id)}
                                      className="h-10 rounded-xl border-2 border-white/30 bg-white/10 px-5 text-sm font-semibold text-white shadow-sm backdrop-blur-sm transition-all hover:bg-white/20 hover:shadow-md"
                                    >
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit
                                    </Button>

                                    <div className="flex items-center gap-4">
                                      <div
                                        className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 shadow-sm backdrop-blur-sm ${
                                          account.isJudge
                                            ? 'border-red-500/60 bg-red-500/20'
                                            : 'border-white/20 bg-white/10'
                                        }`}
                                      >
                                        <span className={`text-sm font-semibold ${
                                          account.isJudge ? 'text-red-300' : 'text-white/70'
                                        }`}>
                                          Judge
                                        </span>
                                      </div>

                                      <div
                                        className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 shadow-sm backdrop-blur-sm ${
                                          account.isAdmin
                                            ? 'border-blue-500/60 bg-blue-500/20'
                                            : 'border-white/20 bg-white/10'
                                        }`}
                                      >
                                        <span className={`text-sm font-semibold ${
                                          account.isAdmin ? 'text-blue-300' : 'text-white/70'
                                        }`}>
                                          Admin
                                        </span>
                                      </div>

                                      <div
                                        className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 shadow-sm backdrop-blur-sm ${
                                          account.isModerator
                                            ? 'border-emerald-500/60 bg-emerald-500/20'
                                            : 'border-white/20 bg-white/10'
                                        }`}
                                      >
                                        <span className={`text-sm font-semibold ${
                                          account.isModerator ? 'text-emerald-300' : 'text-white/70'
                                        }`}>
                                          Moderator
                                        </span>
                                      </div>
                                    </div>
                                  </>
                                )}

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-10 w-10 rounded-xl p-0 text-white/60 transition-all hover:bg-red-500/20 hover:text-red-300 hover:shadow-md"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="insights" className="space-y-8">
                {/* Overview Metrics */}
                <div className="grid grid-cols-4 gap-6">
                  <Card className="overflow-hidden rounded-3xl border border-slate-200/70 bg-linear-to-br from-primary/25 via-primary/10 to-transparent shadow-lg">
                    <CardHeader className="p-6 pb-4">
                      <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.15em] text-primary/80">
                        <Calendar className="h-4 w-4" />
                        Total Events
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                      <div className="text-5xl font-bold text-primary">12</div>
                      <p className="mt-1 text-sm text-slate-600">Since 2023</p>
                    </CardContent>
                  </Card>

                  <Card className="overflow-hidden rounded-3xl border border-slate-200/70 bg-linear-to-br from-emerald-200/60 via-emerald-100/40 to-transparent shadow-lg">
                    <CardHeader className="p-6 pb-4">
                      <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.15em] text-emerald-700">
                        <CheckCircle2 className="h-4 w-4" />
                        Avg Completion
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                      <div className="text-5xl font-bold text-emerald-700">94%</div>
                      <p className="mt-1 text-sm text-slate-600">Judging finished</p>
                    </CardContent>
                  </Card>

                  <Card className="overflow-hidden rounded-3xl border border-slate-200/70 bg-linear-to-br from-sky-200/60 via-sky-100/40 to-transparent shadow-lg">
                    <CardHeader className="p-6 pb-4">
                      <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.15em] text-sky-700">
                        <Clock className="h-4 w-4" />
                        Avg Judge Time
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                      <div className="text-5xl font-bold text-sky-700">21m</div>
                      <p className="mt-1 text-sm text-slate-600">Per team</p>
                    </CardContent>
                  </Card>

                  <Card className="overflow-hidden rounded-3xl border border-slate-200/70 bg-linear-to-br from-amber-200/60 via-amber-100/40 to-transparent shadow-lg">
                    <CardHeader className="p-6 pb-4">
                      <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.15em] text-amber-700">
                        <Target className="h-4 w-4" />
                        Judge Usage
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                      <div className="text-5xl font-bold text-amber-700">86%</div>
                      <p className="mt-1 text-sm text-slate-600">Utilization rate</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Event History */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-semibold text-slate-800">Event History</h3>
                    <Button
                      variant="outline"
                      className="h-11 rounded-xl border-slate-300 bg-white/80 px-5 text-base font-semibold shadow-sm hover:bg-white"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export All Data
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        name: "Aggies Invent Fall 2024",
                        date: "Oct 20-22, 2024",
                        status: "completed" as const,
                        teams: 18,
                        judges: 6,
                        completion: 100,
                        avgTime: 22,
                        avgScore: 82.3,
                        topScore: 95.8,
                      },
                      {
                        name: "Problems Worth Solving Summer 2024",
                        date: "Jul 10-12, 2024",
                        status: "completed" as const,
                        teams: 20,
                        judges: 7,
                        completion: 100,
                        avgTime: 20,
                        avgScore: 76.8,
                        topScore: 92.4,
                      },
                      {
                        name: "Aggies Invent Spring 2024",
                        date: "Mar 18-20, 2024",
                        status: "completed" as const,
                        teams: 22,
                        judges: 7,
                        completion: 100,
                        avgTime: 25,
                        avgScore: 80.1,
                        topScore: 93.6,
                      },
                    ].map((event, index) => (
                      <Card
                        key={index}
                        className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white/90 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                      >
                        <CardHeader className="p-6 pb-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-xl font-semibold text-slate-900">
                                {event.name}
                              </CardTitle>
                              <CardDescription className="mt-1 text-sm text-slate-600">
                                {event.date}
                              </CardDescription>
                            </div>
                            <Badge className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                              {event.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-6 pt-0">
                          <div className="grid grid-cols-6 gap-4">
                            <div className="rounded-2xl bg-slate-50/80 p-4 text-center">
                              <div className="text-2xl font-bold text-slate-900">{event.teams}</div>
                              <div className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-600">
                                Teams
                              </div>
                            </div>
                            <div className="rounded-2xl bg-slate-50/80 p-4 text-center">
                              <div className="text-2xl font-bold text-slate-900">{event.judges}</div>
                              <div className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-600">
                                Judges
                              </div>
                            </div>
                            <div className="rounded-2xl bg-emerald-50/80 p-4 text-center">
                              <div className="text-2xl font-bold text-emerald-700">{event.completion}%</div>
                              <div className="mt-1 text-xs font-medium uppercase tracking-wider text-emerald-700">
                                Complete
                              </div>
                            </div>
                            <div className="rounded-2xl bg-sky-50/80 p-4 text-center">
                              <div className="text-2xl font-bold text-sky-700">{event.avgTime}m</div>
                              <div className="mt-1 text-xs font-medium uppercase tracking-wider text-sky-700">
                                Avg Time
                              </div>
                            </div>
                            <div className="rounded-2xl bg-amber-50/80 p-4 text-center">
                              <div className="text-2xl font-bold text-amber-700">{event.avgScore}</div>
                              <div className="mt-1 text-xs font-medium uppercase tracking-wider text-amber-700">
                                Avg Score
                              </div>
                            </div>
                            <div className="rounded-2xl bg-primary/10 p-4 text-center">
                              <div className="text-2xl font-bold text-primary">{event.topScore}</div>
                              <div className="mt-1 text-xs font-medium uppercase tracking-wider text-primary">
                                Top Score
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Insights & Recommendations */}
                <Card className="overflow-hidden rounded-3xl border border-slate-200/70 bg-linear-to-br from-purple-50 via-indigo-50 to-white shadow-xl">
                  <CardHeader className="p-8">
                    <CardTitle className="flex items-center gap-3 text-2xl font-semibold text-slate-900">
                      <Sparkles className="h-6 w-6 text-purple-600" />
                      Key Insights & Recommendations
                    </CardTitle>
                    <CardDescription className="text-base text-slate-600">
                      Data-driven suggestions to optimize future events
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 p-8 pt-0">
                    <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/50 p-5">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                        <div>
                          <h4 className="font-semibold text-slate-900">Strong completion rates</h4>
                          <p className="mt-1 text-sm text-slate-700">
                            Your events maintain 94% average completion. Consider showcasing this to attract more
                            judges.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-sky-200/70 bg-sky-50/50 p-5">
                      <div className="flex items-start gap-3">
                        <Timer className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />
                        <div>
                          <h4 className="font-semibold text-slate-900">Optimize judging time</h4>
                          <p className="mt-1 text-sm text-slate-700">
                            Average judging time is 21 minutes per team. Events with 18-20 minute targets show better
                            judge satisfaction.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-amber-200/70 bg-amber-50/50 p-5">
                      <div className="flex items-start gap-3">
                        <Target className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                        <div>
                          <h4 className="font-semibold text-slate-900">Increase judge utilization</h4>
                          <p className="mt-1 text-sm text-slate-700">
                            At 86% utilization, you could handle 2-3 more teams per event with current judge capacity.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="teams" className="space-y-8">
                <div className="grid gap-6 md:grid-cols-3">
                  <Card className="rounded-3xl border border-slate-200/70 bg-linear-to-br from-white via-slate-50 to-slate-100 shadow-lg">
                    <CardHeader className="p-8 pb-6">
                      <CardTitle className="flex items-center gap-3 text-2xl font-semibold text-slate-900">
                        <Plus className="h-6 w-6 text-primary" />
                        Add a single team
                      </CardTitle>
                      <CardDescription className="text-base text-slate-600">
                        Capture their project identity so judges see context instantly.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-0 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="team-name" className="text-base font-medium text-slate-700">
                          Team name
                        </Label>
                        <Input id="team-name" placeholder="e.g., Team Alpha" className="h-12 rounded-xl border-slate-200 px-4 text-base shadow-inner" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="project-title" className="text-base font-medium text-slate-700">
                          Project title
                        </Label>
                        <Input id="project-title" placeholder="e.g., Smart Campus Navigation" className="h-12 rounded-xl border-slate-200 px-4 text-base shadow-inner" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="table-number" className="text-base font-medium text-slate-700">
                          Table number
                        </Label>
                        <Input id="table-number" placeholder="e.g., A-12" className="h-12 rounded-xl border-slate-200 px-4 text-base shadow-inner" />
                      </div>
                      <Button className="w-full h-12 rounded-xl bg-primary text-base font-semibold shadow-lg transition-transform hover:-translate-y-0.5 hover:shadow-xl">
                        <Plus className="mr-2 h-5 w-5" />
                        Add team
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="rounded-3xl border border-slate-200/70 bg-white/90 shadow-lg">
                    <CardHeader className="p-8 pb-6">
                      <CardTitle className="flex items-center gap-3 text-2xl font-semibold text-slate-900">
                        <FileUp className="h-6 w-6 text-primary" />
                        Import multiple teams (CSV)
                      </CardTitle>
                      <CardDescription className="text-base text-slate-600">
                        Download the template, paste roster data, and upload when you are ready.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-2">
                      <div className="flex w-full items-center justify-center">
                        <Label
                          htmlFor="csv-upload"
                          className="flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 px-6 py-14 text-center transition-colors hover:border-primary/40 hover:bg-primary/5"
                        >
                          <FileUp className="mb-4 h-11 w-11 text-primary" />
                          <p className="text-base font-semibold text-slate-700">Drag & drop or click to upload</p>
                          <p className="mt-1 text-sm text-slate-500">CSV file - Max 2MB</p>
                          <Input id="csv-upload" type="file" accept=".csv" className="hidden" />
                        </Label>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="overflow-hidden rounded-3xl border-none bg-linear-to-br from-amber-200 via-rose-100 to-white shadow-xl">
                  <CardHeader className="p-8 pb-4">
                    <CardTitle className="flex items-center gap-3 text-2xl font-semibold text-slate-900">
                      <Trophy className="h-6 w-6 text-amber-500" />
                      Team spotlight
                    </CardTitle>
                    <CardDescription className="text-base text-slate-600">
                      Celebrate progress and keep the showcase energy high for the upcoming demo.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 pt-2">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                      <div>
                        <Badge className="mb-3 w-fit rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-600">
                          {teamSpotlight.event}
                        </Badge>
                        <h4 className="text-3xl font-semibold text-slate-900">{teamSpotlight.team}</h4>
                        <p className="mt-2 text-base text-slate-600">{teamSpotlight.summary}</p>
                        <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
                          <span className="rounded-full bg-white/70 px-3 py-1 font-semibold text-amber-600">
                            {teamSpotlight.category}
                          </span>
                          <span className="rounded-full bg-white/70 px-3 py-1 font-semibold text-amber-600">
                            Score {teamSpotlight.score}
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" className="h-12 rounded-xl border-white/60 bg-white/80 px-6 text-base font-semibold text-amber-600 hover:bg-white">
                        View story deck
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
