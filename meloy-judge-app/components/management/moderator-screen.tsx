"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Activity,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Ban,
  Play,
  Pause,
  RefreshCw,
  Bell,
  MessageSquare,
  UserX,
  BarChart3,
  Zap,
  TrendingUp,
  Eye,
  Shield,
  Radio,
} from "lucide-react"

interface ModeratorScreenProps {
  eventId: string
  onBack: () => void
}

interface Judge {
  id: string
  name: string
  email: string
  status: "active" | "idle" | "offline"
  currentTeam: string | null
  teamsCompleted: number
  avgTime: number
  lastActivity: string
}

interface Team {
  id: string
  name: string
  projectTitle: string
  tableNumber: string
  status: "waiting" | "in-progress" | "completed"
  assignedJudges: string[]
  completedJudges: string[]
  currentJudge: string | null
}

const mockJudges: Judge[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    email: "sjohnson@tamu.edu",
    status: "active",
    currentTeam: "Team Alpha",
    teamsCompleted: 8,
    avgTime: 18,
    lastActivity: "2 min ago",
  },
  {
    id: "2",
    name: "Prof. Michael Chen",
    email: "mchen@tamu.edu",
    status: "active",
    currentTeam: "Team Gamma",
    teamsCompleted: 7,
    avgTime: 22,
    lastActivity: "1 min ago",
  },
  {
    id: "3",
    name: "Dr. Emily Rodriguez",
    email: "erodriguez@tamu.edu",
    status: "idle",
    currentTeam: null,
    teamsCompleted: 9,
    avgTime: 16,
    lastActivity: "5 min ago",
  },
  {
    id: "4",
    name: "Dr. James Wilson",
    email: "jwilson@tamu.edu",
    status: "active",
    currentTeam: "Team Delta",
    teamsCompleted: 6,
    avgTime: 25,
    lastActivity: "3 min ago",
  },
  {
    id: "5",
    name: "Prof. Lisa Martinez",
    email: "lmartinez@tamu.edu",
    status: "idle",
    currentTeam: null,
    teamsCompleted: 10,
    avgTime: 19,
    lastActivity: "8 min ago",
  },
  {
    id: "6",
    name: "Dr. Robert Taylor",
    email: "rtaylor@tamu.edu",
    status: "offline",
    currentTeam: null,
    teamsCompleted: 5,
    avgTime: 20,
    lastActivity: "45 min ago",
  },
]

const mockTeams: Team[] = [
  {
    id: "1",
    name: "Team Alpha",
    projectTitle: "Smart Campus Navigation",
    tableNumber: "A-12",
    status: "in-progress",
    assignedJudges: ["1", "2", "3"],
    completedJudges: ["3"],
    currentJudge: "1",
  },
  {
    id: "2",
    name: "Team Beta",
    projectTitle: "Sustainable Energy Monitor",
    tableNumber: "B-05",
    status: "completed",
    assignedJudges: ["1", "2", "3"],
    completedJudges: ["1", "2", "3"],
    currentJudge: null,
  },
  {
    id: "3",
    name: "Team Gamma",
    projectTitle: "AI-Powered Study Assistant",
    tableNumber: "C-18",
    status: "in-progress",
    assignedJudges: ["2", "4", "5"],
    completedJudges: ["5"],
    currentJudge: "2",
  },
  {
    id: "4",
    name: "Team Delta",
    projectTitle: "Campus Safety Alert System",
    tableNumber: "D-21",
    status: "in-progress",
    assignedJudges: ["4", "5", "6"],
    completedJudges: [],
    currentJudge: "4",
  },
  {
    id: "5",
    name: "Team Epsilon",
    projectTitle: "Digital Library System",
    tableNumber: "E-08",
    status: "waiting",
    assignedJudges: ["3", "4", "6"],
    completedJudges: [],
    currentJudge: null,
  },
]

const mockActivity = [
  { id: "1", timestamp: "2:45 PM", judge: "Dr. Sarah Johnson", action: "Started judging Team Alpha" },
  { id: "2", timestamp: "2:43 PM", judge: "Prof. Michael Chen", action: "Completed judging Team Beta" },
  { id: "3", timestamp: "2:40 PM", judge: "Dr. Emily Rodriguez", action: "Marked as idle" },
  { id: "4", timestamp: "2:38 PM", judge: "Dr. James Wilson", action: "Started judging Team Delta" },
  { id: "5", timestamp: "2:35 PM", judge: "Prof. Lisa Martinez", action: "Completed judging Team Gamma" },
]

export function ModeratorScreen({ eventId, onBack }: ModeratorScreenProps) {
  const [selectedTab, setSelectedTab] = useState("overview")

  const activeJudges = mockJudges.filter((j) => j.status === "active").length
  const idleJudges = mockJudges.filter((j) => j.status === "idle").length
  const offlineJudges = mockJudges.filter((j) => j.status === "offline").length
  const teamsCompleted = mockTeams.filter((t) => t.status === "completed").length
  const teamsInProgress = mockTeams.filter((t) => t.status === "in-progress").length
  const teamsWaiting = mockTeams.filter((t) => t.status === "waiting").length
  const completionRate = Math.round((teamsCompleted / mockTeams.length) * 100)

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-[1400px] px-8">
          <div className="flex h-24 items-center justify-between">
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                onClick={onBack}
                className="h-12 w-12 rounded-xl border-2 border-transparent p-0 transition-all duration-300 hover:border-primary/20 hover:bg-primary/5"
              >
                <ArrowLeft className="h-5 w-5 text-slate-700" />
              </Button>
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <Radio className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Event Moderator</h1>
                  <p className="text-sm text-slate-600">Aggies Invent Spring 2025 - Live Control</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="flex h-10 items-center gap-2 rounded-xl border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-700">
                <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                Live Event
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-8 py-10">
        {/* Real-time Stats */}
        <div className="mb-10 grid grid-cols-4 gap-6">
          <Card className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white/90 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium uppercase tracking-wider text-slate-600">Active Judges</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-emerald-600">{activeJudges}</span>
                    <span className="text-lg text-slate-500">/ {mockJudges.length}</span>
                  </div>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
                  <Activity className="h-7 w-7 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white/90 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium uppercase tracking-wider text-slate-600">Completion Rate</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-primary">{completionRate}%</span>
                    <span className="text-lg text-slate-500">{teamsCompleted}/{mockTeams.length}</span>
                  </div>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <CheckCircle2 className="h-7 w-7 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white/90 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium uppercase tracking-wider text-slate-600">In Progress</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-sky-600">{teamsInProgress}</span>
                    <span className="text-lg text-slate-500">teams</span>
                  </div>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50">
                  <Clock className="h-7 w-7 text-sky-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white/90 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium uppercase tracking-wider text-slate-600">Waiting</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-amber-600">{teamsWaiting}</span>
                    <span className="text-lg text-slate-500">teams</span>
                  </div>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50">
                  <AlertCircle className="h-7 w-7 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid h-16 w-full grid-cols-3 rounded-2xl border border-slate-200 bg-white/80 p-2 shadow-lg backdrop-blur">
            <TabsTrigger
              value="overview"
              className="flex h-full items-center justify-center rounded-xl border border-transparent text-base font-semibold text-slate-600 transition-all duration-300 data-[state=active]:border-primary/30 data-[state=active]:bg-linear-to-r data-[state=active]:from-primary/10 data-[state=active]:to-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-md"
            >
              <Eye className="mr-2 h-5 w-5" />
              Live Overview
            </TabsTrigger>
            <TabsTrigger
              value="judges"
              className="flex h-full items-center justify-center rounded-xl border border-transparent text-base font-semibold text-slate-600 transition-all duration-300 data-[state=active]:border-primary/30 data-[state=active]:bg-linear-to-r data-[state=active]:from-primary/10 data-[state=active]:to-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-md"
            >
              <Users className="mr-2 h-5 w-5" />
              Judge Monitor
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="flex h-full items-center justify-center rounded-xl border border-transparent text-base font-semibold text-slate-600 transition-all duration-300 data-[state=active]:border-primary/30 data-[state=active]:bg-linear-to-r data-[state=active]:from-primary/10 data-[state=active]:to-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-md"
            >
              <Activity className="mr-2 h-5 w-5" />
              Activity Log
            </TabsTrigger>
          </TabsList>

          <div className="mt-10">
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Judge Status Overview */}
                <Card className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white/90 shadow-lg">
                  <CardHeader className="p-6 pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl font-semibold text-slate-900">
                      <Shield className="h-5 w-5 text-primary" />
                      Judge Status
                    </CardTitle>
                    <CardDescription className="text-base text-slate-600">
                      Real-time judge availability and activity
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 pt-2">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between rounded-2xl border border-emerald-200/70 bg-emerald-50/50 p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                            <Activity className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">Active</p>
                            <p className="text-sm text-slate-600">Currently judging</p>
                          </div>
                        </div>
                        <span className="text-3xl font-bold text-emerald-600">{activeJudges}</span>
                      </div>

                      <div className="flex items-center justify-between rounded-2xl border border-amber-200/70 bg-amber-50/50 p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                            <Clock className="h-5 w-5 text-amber-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">Idle</p>
                            <p className="text-sm text-slate-600">Waiting for assignment</p>
                          </div>
                        </div>
                        <span className="text-3xl font-bold text-amber-600">{idleJudges}</span>
                      </div>

                      <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-slate-50/50 p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                            <UserX className="h-5 w-5 text-slate-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">Offline</p>
                            <p className="text-sm text-slate-600">Not responding</p>
                          </div>
                        </div>
                        <span className="text-3xl font-bold text-slate-600">{offlineJudges}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Team Progress Overview */}
                <Card className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white/90 shadow-lg">
                  <CardHeader className="p-6 pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl font-semibold text-slate-900">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Team Progress
                    </CardTitle>
                    <CardDescription className="text-base text-slate-600">
                      Judging completion status across all teams
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 pt-2">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between rounded-2xl border border-emerald-200/70 bg-emerald-50/50 p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">Completed</p>
                            <p className="text-sm text-slate-600">All judges finished</p>
                          </div>
                        </div>
                        <span className="text-3xl font-bold text-emerald-600">{teamsCompleted}</span>
                      </div>

                      <div className="flex items-center justify-between rounded-2xl border border-sky-200/70 bg-sky-50/50 p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100">
                            <Zap className="h-5 w-5 text-sky-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">In Progress</p>
                            <p className="text-sm text-slate-600">Being judged now</p>
                          </div>
                        </div>
                        <span className="text-3xl font-bold text-sky-600">{teamsInProgress}</span>
                      </div>

                      <div className="flex items-center justify-between rounded-2xl border border-amber-200/70 bg-amber-50/50 p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                            <AlertCircle className="h-5 w-5 text-amber-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">Waiting</p>
                            <p className="text-sm text-slate-600">Not started yet</p>
                          </div>
                        </div>
                        <span className="text-3xl font-bold text-amber-600">{teamsWaiting}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Teams Grid */}
              <Card className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white/90 shadow-lg">
                <CardHeader className="p-6 pb-4">
                  <CardTitle className="text-xl font-semibold text-slate-900">All Teams</CardTitle>
                  <CardDescription className="text-base text-slate-600">
                    Live status of all teams in the event
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-2">
                  <div className="space-y-3">
                    {mockTeams.map((team) => (
                      <div
                        key={team.id}
                        className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-slate-50/50 p-4 transition-all duration-300 hover:bg-slate-50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white font-bold text-primary shadow-sm">
                            {team.tableNumber}
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900">{team.name}</h4>
                            <p className="text-sm text-slate-600">{team.projectTitle}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium text-slate-600">
                              {team.completedJudges.length} / {team.assignedJudges.length} judges
                            </p>
                            {team.currentJudge && (
                              <p className="text-xs text-slate-500">
                                Currently: {mockJudges.find((j) => j.id === team.currentJudge)?.name.split(" ")[1]}
                              </p>
                            )}
                          </div>
                          <Badge
                            className={`w-28 justify-center rounded-xl px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${
                              team.status === "completed"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : team.status === "in-progress"
                                  ? "border-sky-200 bg-sky-50 text-sky-700"
                                  : "border-amber-200 bg-amber-50 text-amber-700"
                            }`}
                          >
                            {team.status === "in-progress" ? "In Progress" : team.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Judge Monitor Tab */}
            <TabsContent value="judges" className="space-y-6">
              <Card className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white/90 shadow-lg">
                <CardHeader className="p-6 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-semibold text-slate-900">Judge Monitor</CardTitle>
                      <CardDescription className="text-base text-slate-600">
                        Track individual judge performance and status
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      className="h-11 rounded-xl border-slate-300 bg-white/80 px-5 text-base font-semibold shadow-sm hover:bg-white"
                    >
                      <Bell className="mr-2 h-4 w-4" />
                      Send Alert
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-2">
                  <div className="space-y-3">
                    {mockJudges.map((judge) => (
                      <Card
                        key={judge.id}
                        className="overflow-hidden rounded-2xl border border-slate-200/70 bg-slate-50/50 shadow-sm"
                      >
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 font-bold text-primary">
                                  {judge.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </div>
                                <div
                                  className={`absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-white ${
                                    judge.status === "active"
                                      ? "bg-emerald-500"
                                      : judge.status === "idle"
                                        ? "bg-amber-500"
                                        : "bg-slate-400"
                                  }`}
                                />
                              </div>
                              <div>
                                <h4 className="font-semibold text-slate-900">{judge.name}</h4>
                                <p className="text-sm text-slate-600">{judge.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="text-center">
                                <p className="text-2xl font-bold text-slate-900">{judge.teamsCompleted}</p>
                                <p className="text-xs uppercase tracking-wider text-slate-600">Completed</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold text-sky-600">{judge.avgTime}m</p>
                                <p className="text-xs uppercase tracking-wider text-slate-600">Avg Time</p>
                              </div>
                              <div className="min-w-[140px] text-right">
                                {judge.currentTeam ? (
                                  <div>
                                    <p className="font-semibold text-emerald-700">{judge.currentTeam}</p>
                                    <p className="text-xs text-slate-600">Judging now</p>
                                  </div>
                                ) : (
                                  <div>
                                    <p className="font-semibold text-slate-600">No assignment</p>
                                    <p className="text-xs text-slate-500">{judge.lastActivity}</p>
                                  </div>
                                )}
                              </div>
                              <Badge
                                className={`w-20 justify-center rounded-xl px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${
                                  judge.status === "active"
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : judge.status === "idle"
                                      ? "border-amber-200 bg-amber-50 text-amber-700"
                                      : "border-slate-200 bg-slate-50 text-slate-600"
                                }`}
                              >
                                {judge.status}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Log Tab */}
            <TabsContent value="activity" className="space-y-6">
              <Card className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white/90 shadow-lg">
                <CardHeader className="p-6 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-semibold text-slate-900">Live Activity Feed</CardTitle>
                      <CardDescription className="text-base text-slate-600">
                        Real-time log of all judging activity
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      className="h-11 rounded-xl border-slate-300 bg-white/80 px-5 text-base font-semibold shadow-sm hover:bg-white"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-2">
                  <div className="space-y-3">
                    {mockActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-slate-50/50 p-4"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                          <Activity className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{activity.action}</p>
                          <p className="text-sm text-slate-600">by {activity.judge}</p>
                        </div>
                        <Badge className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {activity.timestamp}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  )
}
