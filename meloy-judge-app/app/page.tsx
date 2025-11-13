"use client"

import { useState } from "react"
import { LoginScreen } from "@/components/authentication/login-screen"
import { DashboardScreen } from "@/components/dashboard/dashboard-screen"
import { EventDetailScreen } from "@/components/events/event-detail-screen"
import { TeamDetailScreen } from "@/components/judging/team-detail-screen"
import { LeaderboardScreen } from "@/components/events/leaderboard-screen"
import { AdminScreen } from "@/components/management/admin-screen"
import { EventCreationScreen } from "@/components/management/event-creation-screen"
import { SettingsScreen } from "@/components/settings/settings-screen"

export type Screen = "login" | "dashboard" | "event-detail" | "team-detail" | "leaderboard" | "admin" | "settings" | "event-creation"

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("login")
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  const handleLogin = (admin = false) => {
    setIsAdmin(admin)
    setCurrentScreen("dashboard")
  }

  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId)
    setCurrentScreen("event-detail")
  }

  const handleSelectTeam = (teamId: string) => {
    setSelectedTeamId(teamId)
    setCurrentScreen("team-detail")
  }

  const handleBack = () => {
    if (currentScreen === "team-detail") {
      setCurrentScreen("event-detail")
    } else if (currentScreen === "leaderboard") {
      setCurrentScreen("event-detail")
    } else if (currentScreen === "event-creation") {
      setCurrentScreen("admin")
    } else if (
      currentScreen === "event-detail" ||
      currentScreen === "admin" ||
      currentScreen === "settings"
    ) {
      setCurrentScreen("dashboard")
    }
  }

  const handleCreateEvent = () => {
    setCurrentScreen("event-creation")
  }

  const handleEventCreated = () => {
    setCurrentScreen("admin")
  }

  const handleLogout = () => {
    setCurrentScreen("login")
    setIsAdmin(false)
  }

  return (
    <main className="min-h-screen bg-background">
      {currentScreen === "login" && <LoginScreen onLogin={handleLogin} />}
      {currentScreen === "dashboard" && (
        <DashboardScreen onSelectEvent={handleSelectEvent} onNavigate={setCurrentScreen} isAdmin={isAdmin} />
      )}
      {currentScreen === "event-detail" && selectedEventId && (
        <EventDetailScreen
          eventId={selectedEventId}
          onSelectTeam={handleSelectTeam}
          onBack={handleBack}
          onNavigate={setCurrentScreen}
        />
      )}
      {currentScreen === "team-detail" && selectedTeamId && (
        <TeamDetailScreen teamId={selectedTeamId} onBack={handleBack} />
      )}
      {currentScreen === "leaderboard" && selectedEventId && (
        <LeaderboardScreen eventId={selectedEventId} onBack={handleBack} />
      )}
      {currentScreen === "admin" && <AdminScreen onBack={handleBack} onCreateEvent={handleCreateEvent} />}
      {currentScreen === "event-creation" && <EventCreationScreen onBack={handleBack} onCreateEvent={handleEventCreated} />}
      {currentScreen === "settings" && <SettingsScreen onBack={handleBack} onLogout={handleLogout} />}
    </main>
  )
}
