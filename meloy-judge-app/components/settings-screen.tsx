"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toaster, toast } from "sonner"
import { ArrowLeft, User, Lock, AlertTriangle, Save, Trash2, LogOut, Camera } from "lucide-react"

interface SettingsScreenProps {
  onBack: () => void
  onLogout: () => void
}

export function SettingsScreen({ onBack, onLogout }: SettingsScreenProps) {
  const [name, setName] = useState("Dr. Sarah Johnson")
  const [email, setEmail] = useState("sjohnson@tamu.edu")

  const handleSaveChanges = () => {
    // In a real app, you'd save the data to your backend here.
    toast.success("Profile updated successfully!")
  }

  const handleUpdatePassword = () => {
    // Password update logic would go here.
    toast.success("Password updated successfully!")
  }

  const handleDeleteAccount = () => {
    // Account deletion logic would go here.
    toast.error("Account has been deleted.")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5">
      <Toaster richColors position="top-center" />
      {/* Updated header to match dashboard tablet design and scale up sizes */}
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
                <h1 className="text-3xl font-semibold text-white sm:text-[2.25rem] md:text-[2.5rem]">Settings</h1>
                <p className="text-sm text-white/90">Manage your account & preferences</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={onLogout} className="h-11 px-5 text-base font-medium bg-white text-primary hover:bg-white/90 shadow-md">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-6 py-12 md:py-16">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList
            className="grid w-full grid-cols-3 h-14 p-2 bg-slate-200/80 backdrop-blur-sm rounded-2xl border border-slate-300 ring-1 ring-primary/50 hover:ring-primary/70 transition-all duration-300 shadow-md">
          <TabsTrigger
            value="profile"
            className="
              h-full text-base rounded-xl transition-all duration-300
              data-[state=active]:border-1 data-[state=active]:border-primary 
              data-[state=active]:ring-0 data-[state=active]:ring-primary/30 
              data-[state=active]:bg-white data-[state=active]:text-primary">
            <User className="mr-2 h-5 w-5" /> Profile
          </TabsTrigger>

            <TabsTrigger value="security" className="h-full text-base rounded-xl transition-all duration-300
              data-[state=active]:border-1 data-[state=active]:border-primary 
              data-[state=active]:ring-0 data-[state=active]:ring-primary/30 
              data-[state=active]:bg-white data-[state=active]:text-primary">
              <Lock className="mr-2 h-5 w-5" /> Security
            </TabsTrigger>
            <TabsTrigger value="account" className="h-full text-base rounded-xl transition-all duration-300
              data-[state=active]:border-1 data-[state=active]:border-primary 
              data-[state=active]:ring-0 data-[state=active]:ring-primary/30 
              data-[state=active]:bg-white data-[state=active]:text-primary">
              <AlertTriangle className="mr-2 h-5 w-5" /> Account
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="profile">
              <Card className="rounded-3xl border border-slate-200/70 bg-white/80 backdrop-blur-sm shadow-lg">
                <CardHeader className="px-8 pt-8 pb-6">
                  <CardTitle className="text-2xl font-semibold">Profile Information</CardTitle>
                  <CardDescription>Update your personal details and profile picture.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-8 px-8 pb-8 sm:flex-row sm:items-start">
                  <div className="relative group shrink-0">
                    <Image
                      src="/placeholder-user.jpg"
                      alt="User profile picture"
                      width={148}
                      height={148}
                      className="rounded-full border-4 border-white shadow-lg group-hover:opacity-90 transition-opacity"
                    />
                    <Button variant="outline" size="icon" className="absolute bottom-1 right-1 h-10 w-10 rounded-full bg-white/80 backdrop-blur-sm group-hover:bg-white transition-colors shadow-md">
                      <Camera className="h-5 w-5" />
                      <span className="sr-only">Change picture</span>
                    </Button>
                  </div>
                  <div className="grid gap-6 w-full flex-1">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="name" className="text-base">Full Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="h-12 px-4 text-base" />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="email" className="text-base">Email Address</Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 px-4 text-base" />
                      </div>
                    </div>
                    <Button onClick={handleSaveChanges} className="h-12 w-full px-6 text-base shadow-md">
                      <Save className="mr-2 h-5 w-5" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card className="rounded-3xl border border-slate-200/70 bg-white/80 backdrop-blur-sm shadow-lg">
                <CardHeader className="px-8 pt-8 pb-6">
                  <CardTitle className="text-2xl font-semibold">Security</CardTitle>
                  <CardDescription>Manage your password and security settings.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 px-8 pb-8 max-w-2xl mx-auto">
                  <div className="space-y-3">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" className="h-12 px-4 text-base" />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" className="h-12 px-4 text-base" />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" className="h-12 px-4 text-base" />
                  </div>
                  <Button onClick={handleUpdatePassword} className="h-12 w-full px-6 text-base shadow-md">
                    <Save className="mr-2 h-5 w-5" />
                    Update Password
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

                        <TabsContent value="account">
              <Card className="rounded-3xl border-2 border-destructive/60 bg-destructive/5 backdrop-blur-sm shadow-lg">
                <CardHeader className="px-8 pt-8 pb-6">
                  <CardTitle className="text-2xl font-semibold text-destructive flex items-center gap-3">
                    <AlertTriangle /> Account Management
                  </CardTitle>
                  <CardDescription className="text-destructive/80">Manage settings related to your account, including irreversible actions.</CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-8 max-w-2xl mx-auto">
                  <div className="rounded-xl border border-destructive/30 p-6 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-destructive">Delete this account</h3>
                      <p className="text-destructive/90">Once you delete your account, there is no going back.</p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="h-11 px-6 text-base shadow-md shrink-0">
                          <Trash2 className="mr-2 h-5 w-5" />
                          Delete Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Yes, delete account
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
