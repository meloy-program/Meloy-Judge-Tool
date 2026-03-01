"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar, BarChart3, Download, ChevronLeft, ChevronRight, Loader2, Trophy, Users, FileText, Award } from "lucide-react"
import { getCompletedEventsRecap, exportEventToExcel } from "@/lib/api/events"
import { useToast } from "@/hooks/use-toast"

interface Judge {
  id: string
  name: string
  communication: number
  funding: number
  presentation: number
  cohesion: number
  total: number
  time_spent_seconds: number
}

interface Team {
  id: string
  name: string
  mentor_name: string | null
  judges: Judge[]
  total_score: number
  avg_score: number
}

interface Award {
  award_type: string
  team_id: string
  team_name: string
}

interface EventRecap {
  id: string
  name: string
  event_type: string
  start_date: string
  end_date: string
  location: string
  status: string
  judging_phase: string
  sponsor?: {
    name: string | null
    logo_url: string | null
    primary_color: string | null
    secondary_color: string | null
    text_color: string | null
  }
  teams: Team[]
  awards: Award[]
}

export function AdminEventsRecapTab() {
  const [events, setEvents] = useState<EventRecap[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [selectedEventIndex, setSelectedEventIndex] = useState(0)
  const [timelineRange, setTimelineRange] = useState<"6months" | "1year" | "2years" | "all">("1year")
  const { toast } = useToast()

  useEffect(() => {
    fetchRecapData()
  }, [])

  const fetchRecapData = async () => {
    try {
      setLoading(true)
      console.log('Fetching recap data from /events/recap...')
      const data = await getCompletedEventsRecap()
      console.log('Recap data received:', data)
      setEvents(data.events)
    } catch (error) {
      console.error('Failed to fetch recap data:', error)
      toast({
        title: "Failed to Load Data",
        description: error instanceof Error ? error.message : "Could not load event recap data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    if (!event) return
    
    try {
      setExporting(true)
      await exportEventToExcel(event.id, event.name)
      toast({
        title: "Export Successful",
        description: `${event.name} data has been exported to Excel`,
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export data",
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg text-slate-600">Loading event recap data...</p>
        </div>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <p className="text-lg font-semibold text-slate-600">No Completed Events</p>
          <p className="text-sm text-slate-500 mt-1">Completed events will appear here</p>
        </div>
      </div>
    )
  }

  // Reverse the array for display, but adjust index to match original array
  const reversedEvents = [...events].reverse()
  const event = events[events.length - 1 - selectedEventIndex]

  // Helper function to format date range
  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' }

    if (start.toDateString() === end.toDateString()) {
      return start.toLocaleDateString('en-US', options)
    }

    const startMonth = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const endFormatted = end.toLocaleDateString('en-US', options)
    return `${startMonth} - ${endFormatted}`
  }

  // Get event logo based on type
  const getEventLogo = (eventType: string) => {
    if (eventType.includes('problems-worth-solving')) {
      return '/pws.png'
    }
    return '/aggiesinvent.png'
  }

  // Get award label
  const getAwardLabel = (awardType: string) => {
    const labels: Record<string, string> = {
      first_place: '1st Place',
      second_place: '2nd Place',
      third_place: '3rd Place',
      most_feasible: 'Most Feasible Solution',
      best_prototype: 'Best Prototype',
      best_video: 'Best Video',
      best_presentation: 'Best Presentation'
    }
    return labels[awardType] || awardType
  }

  // Get all unique judges from all teams
  const allJudges = Array.from(
    new Set(
      event.teams.flatMap(team => team.judges.map(j => JSON.stringify({ id: j.id, name: j.name })))
    )
  ).map(j => JSON.parse(j))

  // Calculate team rankings
  const rankedTeams = [...event.teams].sort((a, b) => b.avg_score - a.avg_score)

  return (
    <div className="space-y-8">
      {/* Timeline Range Selector */}
      <div className="flex items-center justify-end gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600">Timeline Range:</span>
          <div className="flex gap-2">
            {[
              { value: "6months" as const, label: "6 Months" },
              { value: "1year" as const, label: "1 Year" },
              { value: "2years" as const, label: "2 Years" },
              { value: "all" as const, label: "All Time" },
            ].map((option) => (
              <Button
                key={option.value}
                onClick={() => setTimelineRange(option.value)}
                className={`h-9 rounded-xl px-4 text-sm font-semibold transition-all ${
                  timelineRange === option.value
                    ? "bg-primary text-white shadow-md"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Horizontal Timeline */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-slate-200/80 bg-linear-to-b from-primary to-[#3d0000] shadow-xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
        
        <div className="relative p-4">
          <div className="mb-6 flex items-center justify-between">
            <div className="w-[88px]"></div>
            
            <h4 className="absolute left-1/2 -translate-x-1/2 text-lg font-semibold uppercase tracking-[0.2em] text-white/70">
              Events Timeline
            </h4>
            
            <div className="flex gap-2">
              <Button
                onClick={() => setSelectedEventIndex(Math.max(0, selectedEventIndex - 1))}
                disabled={selectedEventIndex === 0}
                className="h-10 w-10 rounded-xl border-2 border-white/30 bg-white/10 p-0 text-white shadow-md backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20 disabled:opacity-30 disabled:hover:translate-y-0 disabled:hover:bg-white/10"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                onClick={() => setSelectedEventIndex(Math.min(events.length - 1, selectedEventIndex + 1))}
                disabled={selectedEventIndex === events.length - 1}
                className="h-10 w-10 rounded-xl border-2 border-white/30 bg-white/10 p-0 text-white shadow-md backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20 disabled:opacity-30 disabled:hover:translate-y-0 disabled:hover:bg-white/10"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Timeline Track */}
          <div className="relative overflow-x-auto pb-4 pt-8">
            <div className="flex items-center gap-4 px-4">
              {/* Timeline Line */}
              <div className="absolute left-0 right-0 top-1/2 h-1 bg-linear-to-r from-white/20 via-white/40 to-white/20" />
            
              {/* Event Markers */}
              {reversedEvents.map((evt, index) => {
                const displayName = evt.name.length > 30 
                  ? evt.name.substring(0, 30) + '...'
                  : evt.name
                
                let eventLogo = getEventLogo(evt.event_type)
                
                return (
                  <div
                    key={evt.id}
                    className="relative z-10 flex min-w-[200px] flex-col items-center gap-3"
                  >
                    {/* Event Icon */}
                    <button
                      onClick={() => setSelectedEventIndex(index)}
                      className={`group relative flex items-center justify-center transition-all duration-300 ${
                        selectedEventIndex === index
                          ? "scale-125 -translate-y-10"
                          : "hover:scale-110 -translate-y-8 hover:-translate-y-9"
                      }`}
                    >
                      <div className="relative h-28 w-28">
                        <Image
                          src={eventLogo}
                          alt={evt.name}
                          width={112}
                          height={112}
                          className={`h-full w-full object-contain transition-all duration-300 ${
                            selectedEventIndex === index ? 'drop-shadow-2xl' : 'drop-shadow-xl'
                          }`}
                          style={{
                            filter: 'brightness(0) invert(1)'
                          }}
                        />
                      </div>
                    </button>
                    
                    {/* Event Info */}
                    <div className="text-center">
                      <div className={`text-sm font-bold transition-colors ${
                        selectedEventIndex === index ? "text-white" : "text-white/80"
                      }`}>
                        {displayName}
                      </div>
                      <div className={`text-xs ${
                        selectedEventIndex === index ? "text-white/90" : "text-white/60"
                      }`}>
                        {formatDateRange(evt.start_date, evt.end_date)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Event Detail View */}
      <Card className="relative overflow-hidden rounded-4xl border-2 border-slate-200/80 bg-white shadow-2xl">
        <div className="absolute inset-x-0 top-0 h-2 bg-linear-to-r from-primary via-rose-400 to-orange-300" />
        
        <CardHeader className="relative border-b border-slate-100 bg-linear-to-br from-slate-50/80 via-white to-slate-50/50 p-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-primary to-rose-600 shadow-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-slate-900">
                    {event.name}
                  </CardTitle>
                  <CardDescription className="mt-1 flex items-center gap-2 text-base text-slate-600">
                    <Calendar className="h-4 w-4" />
                    {formatDateRange(event.start_date, event.end_date)}
                  </CardDescription>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={handleExport}
                disabled={exporting}
                className="h-11 rounded-xl border-2 border-primary/30 bg-linear-to-br from-primary/10 to-primary/20 px-5 text-sm font-bold text-primary shadow-md transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50"
              >
                {exporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export to Excel
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-b from-primary to-[#3d0000]" />
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
              
              <div className="relative">
                {event.teams.map((team, teamIndex) => {
                  const totalCommunication = team.judges.reduce((sum, j) => sum + j.communication, 0)
                  const totalFunding = team.judges.reduce((sum, j) => sum + j.funding, 0)
                  const totalPresentation = team.judges.reduce((sum, j) => sum + j.presentation, 0)
                  const totalCohesion = team.judges.reduce((sum, j) => sum + j.cohesion, 0)
                  const grandTotal = team.total_score
                  const percentage = ((grandTotal / (team.judges.length * 100)) * 100).toFixed(1)
                  const avgTime = team.judges.length > 0 
                    ? Math.round(team.judges.reduce((sum, j) => sum + j.time_spent_seconds, 0) / team.judges.length / 60)
                    : 0

                  return (
                    <div key={team.id} className={`${teamIndex !== 0 ? 'border-t-2 border-white/20' : ''}`}>
                      {/* Team Header */}
                      <div className="bg-white/10 px-8 py-4 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-xl font-bold text-white">{team.name}</h4>
                            {team.mentor_name && (
                              <p className="text-sm text-white/70 mt-1">Mentor: {team.mentor_name}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <div className="text-xs font-semibold uppercase tracking-wider text-white/70">Total Score</div>
                              <div className="text-2xl font-bold text-white">{grandTotal}/{team.judges.length * 100}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-semibold uppercase tracking-wider text-white/70">Percentage</div>
                              <div className="text-2xl font-bold text-emerald-300">{percentage}%</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-semibold uppercase tracking-wider text-white/70">Avg Time</div>
                              <div className="text-2xl font-bold text-sky-300">{avgTime}m</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Judges Table */}
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="px-8 py-4 text-left text-sm font-semibold uppercase tracking-wider text-white/80">
                              Judge
                            </th>
                            <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider text-white/80">
                              Communication
                              <div className="text-xs font-normal text-white/50">/25</div>
                            </th>
                            <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider text-white/80">
                              Funding
                              <div className="text-xs font-normal text-white/50">/25</div>
                            </th>
                            <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider text-white/80">
                              Presentation
                              <div className="text-xs font-normal text-white/50">/25</div>
                            </th>
                            <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider text-white/80">
                              Cohesion
                              <div className="text-xs font-normal text-white/50">/25</div>
                            </th>
                            <th className="px-8 py-4 text-center text-sm font-semibold uppercase tracking-wider text-white/80">
                              Judge Total
                              <div className="text-xs font-normal text-white/50">/100</div>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {team.judges.map((judge) => (
                            <tr key={judge.id} className="transition-colors hover:bg-white/5">
                              <td className="px-8 py-4 text-base font-semibold text-white/90">
                                {judge.name}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="text-lg font-bold text-white">{judge.communication}</div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="text-lg font-bold text-white">{judge.funding}</div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="text-lg font-bold text-white">{judge.presentation}</div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="text-lg font-bold text-white">{judge.cohesion}</div>
                              </td>
                              <td className="px-8 py-4 text-center">
                                <div className="text-xl font-bold text-amber-300">{judge.total}</div>
                              </td>
                            </tr>
                          ))}
                          {/* Category Totals Row */}
                          <tr className="border-t-2 border-white/30 bg-white/10">
                            <td className="px-8 py-4 text-base font-bold uppercase tracking-wide text-white">
                              Category Total
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="text-xl font-bold text-white">{totalCommunication}</div>
                              <div className="text-xs text-white/60">/{team.judges.length * 25}</div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="text-xl font-bold text-white">{totalFunding}</div>
                              <div className="text-xs text-white/60">/{team.judges.length * 25}</div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="text-xl font-bold text-white">{totalPresentation}</div>
                              <div className="text-xs text-white/60">/{team.judges.length * 25}</div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="text-xl font-bold text-white">{totalCohesion}</div>
                              <div className="text-xs text-white/60">/{team.judges.length * 25}</div>
                            </td>
                            <td className="px-8 py-4 text-center">
                              <div className="text-2xl font-bold text-emerald-300">{grandTotal}</div>
                              <div className="text-xs text-emerald-300/80">/{team.judges.length * 100}</div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </CardContent>

        {/* Awards Section */}
        {event.awards && event.awards.length > 0 && (
          <div className="border-t-2 border-slate-100 bg-slate-50/50 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 shadow-lg">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Special Awards</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {event.awards.map((award, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-xl border-2 border-amber-200 bg-white px-4 py-3 shadow-sm"
                >
                  <Trophy className="h-5 w-5 text-amber-500 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {getAwardLabel(award.award_type)}
                    </div>
                    <div className="text-sm font-bold text-slate-900 truncate">
                      {award.team_name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
