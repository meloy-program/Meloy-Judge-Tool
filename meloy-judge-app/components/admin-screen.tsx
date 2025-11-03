"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Users, UsersRound, Plus, Edit, Trash2, Mail, FileUp, Shield } from "lucide-react"

interface AdminScreenProps {
  onBack: () => void
}

const mockJudges = [
  { id: "1", name: "Dr. Sarah Johnson", email: "sjohnson@tamu.edu", eventsAssigned: 2, status: "active" },
  { id: "2", name: "Prof. Michael Chen", email: "mchen@tamu.edu", eventsAssigned: 1, status: "active" },
  { id: "3", name: "Dr. Emily Rodriguez", email: "erodriguez@tamu.edu", eventsAssigned: 3, status: "active" },
]

const mockEvents = [
  { id: "1", name: "Aggies Invent Spring 2025", teams: 24, judges: 8, status: "active" },
  { id: "2", name: "Aggies Invent Fall 2024", teams: 18, judges: 6, status: "completed" },
]

export function AdminScreen({ onBack }: AdminScreenProps) {
  const [newEventName, setNewEventName] = useState("")
  const [newJudgeEmail, setNewJudgeEmail] = useState("")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5">
      <header className="relative border-b bg-gradient-to-b from-primary to-[#3d0000] backdrop-blur-sm shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />
        <div className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-8 md:px-8">
          <div className="flex items-center gap-5">
            <Button variant="ghost" onClick={onBack} className="text-white hover:bg-white/20 h-11 w-11 p-2 flex items-center justify-center">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-auto items-center justify-center rounded-xl bg-white/15 backdrop-blur-md shadow-md p-2 border border-white/25">
                <Image src="/apptitle.png" alt="Meloy Program Judging Portal" width={130} height={60} className="object-contain" />
              </div>
              <div>
                <h1 className="text-3xl font-semibold text-white sm:text-[2.25rem] md:text-[2.5rem]">Admin Panel</h1>
                <p className="text-sm text-white/90">Manage events, judges, and teams</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-6 py-12 md:py-16">
        <Tabs defaultValue="events" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-14 p-2 bg-slate-200/80 backdrop-blur-sm rounded-2xl border border-slate-200/90">
            <TabsTrigger value="events" className="h-full text-base rounded-xl">
              <Calendar className="mr-2 h-5 w-5" /> Events
            </TabsTrigger>
            <TabsTrigger value="judges" className="h-full text-base rounded-xl">
              <UsersRound className="mr-2 h-5 w-5" /> Judges
            </TabsTrigger>
            <TabsTrigger value="teams" className="h-full text-base rounded-xl">
              <Users className="mr-2 h-5 w-5" /> Teams
            </TabsTrigger>
          </TabsList>

          <div className="mt-6 space-y-6">
            <TabsContent value="events" className="space-y-6">
              <Card className="rounded-3xl border border-slate-200/70 bg-white/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl font-semibold">
                    <Plus className="h-6 w-6" />
                    Create New Event
                  </CardTitle>
                  <CardDescription>Add a new competition event to the system.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="event-name" className="text-base">Event Name</Label>
                      <Input
                        id="event-name"
                        placeholder="e.g., Aggies Invent Spring 2025"
                        value={newEventName}
                        onChange={(e) => setNewEventName(e.target.value)}
                        className="h-12 px-4 text-base"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button className="h-12 w-full sm:w-auto px-6 text-base shadow-md">
                        <Plus className="mr-2 h-5 w-5" />
                        Create Event
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div>
                <h3 className="text-2xl font-semibold text-slate-800 mb-4">Existing Events</h3>
                <div className="space-y-4">
                  {mockEvents.map((event) => (
                    <Card key={event.id} className="rounded-3xl border border-slate-200/70 bg-white/95 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                      <CardHeader className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <CardTitle className="text-xl font-semibold">{event.name}</CardTitle>
                            <CardDescription className="flex items-center gap-4 mt-2 text-slate-600">
                              <span className="flex items-center gap-1.5">
                                <Users className="h-4 w-4" />
                                {event.teams} teams
                              </span>
                              <span className="flex items-center gap-1.5">
                                <UsersRound className="h-4 w-4" />
                                {event.judges} judges
                              </span>
                            </CardDescription>
                          </div>
                          <Badge
                            className={`shrink-0 text-xs font-semibold px-3 py-1 uppercase tracking-wide ${
                              event.status === "active"
                                ? "bg-emerald-500/90 text-white shadow-sm shadow-emerald-500/30"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {event.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6 pt-0">
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm"><Edit className="mr-1.5 h-4 w-4" /> Edit Details</Button>
                          <Button variant="outline" size="sm"><Users className="mr-1.5 h-4 w-4" /> Manage Teams</Button>
                          <Button variant="outline" size="sm"><UsersRound className="mr-1.5 h-4 w-4" /> Assign Judges</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="judges" className="space-y-6">
              <Card className="rounded-3xl border border-slate-200/70 bg-white/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl font-semibold">
                    <Mail className="h-6 w-6" />
                    Invite Judge
                  </CardTitle>
                  <CardDescription>Send an invitation to a new judge by email.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="judge-email" className="text-base">Email Address</Label>
                      <Input
                        id="judge-email"
                        type="email"
                        placeholder="judge@example.com"
                        value={newJudgeEmail}
                        onChange={(e) => setNewJudgeEmail(e.target.value)}
                        className="h-12 px-4 text-base"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button className="h-12 w-full sm:w-auto px-6 text-base shadow-md">
                        <Mail className="mr-2 h-5 w-5" />
                        Send Invite
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div>
                <h3 className="text-2xl font-semibold text-slate-800 mb-4">Active Judges</h3>
                <div className="space-y-4">
                  {mockJudges.map((judge) => (
                    <Card key={judge.id} className="rounded-3xl border border-slate-200/70 bg-white/95 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                      <CardHeader className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <CardTitle className="text-xl font-semibold">{judge.name}</CardTitle>
                            <CardDescription className="text-slate-600">{judge.email}</CardDescription>
                          </div>
                          <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20">
                            {judge.eventsAssigned} events
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6 pt-0">
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm">View Activity</Button>
                          <Button variant="outline" size="sm"><Edit className="mr-1.5 h-4 w-4" /> Reassign</Button>
                          <Button variant="destructive" size="sm"><Trash2 className="mr-1.5 h-4 w-4" /> Remove</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="teams" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="rounded-3xl border border-slate-200/70 bg-white/80 backdrop-blur-sm shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl font-semibold">
                      <Plus className="h-6 w-6" />
                      Add Single Team
                    </CardTitle>
                    <CardDescription>Register a new team for an event.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="team-name" className="text-base">Team Name</Label>
                      <Input id="team-name" placeholder="e.g., Team Alpha" className="h-12 px-4 text-base" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="project-title" className="text-base">Project Title</Label>
                      <Input id="project-title" placeholder="e.g., Smart Campus Navigation" className="h-12 px-4 text-base" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="table-number" className="text-base">Table Number</Label>
                      <Input id="table-number" placeholder="e.g., A-12" className="h-12 px-4 text-base" />
                    </div>
                    <Button className="w-full h-12 text-base shadow-md">
                      <Plus className="mr-2 h-5 w-5" />
                      Add Team
                    </Button>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border border-slate-200/70 bg-white/80 backdrop-blur-sm shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl font-semibold">
                      <FileUp className="h-6 w-6" />
                      Import Teams via CSV
                    </CardTitle>
                    <CardDescription>Bulk upload teams from a CSV file.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col justify-center items-center text-center h-full space-y-4 py-10">
                     <div className="flex items-center justify-center w-full">
                        <Label htmlFor="csv-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <FileUp className="w-10 h-10 mb-3 text-slate-400" />
                                <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                <p className="text-xs text-slate-500">CSV file (MAX. 2MB)</p>
                            </div>
                            <Input id="csv-upload" type="file" className="hidden" accept=".csv" />
                        </Label>
                    </div> 
                    <Button className="w-full h-12 text-base shadow-md">
                      <FileUp className="mr-2 h-5 w-5" />
                      Upload CSV
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  )
}
