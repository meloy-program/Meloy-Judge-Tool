"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building2, Upload, Palette, FileImage, AlertCircle } from "lucide-react"

interface SponsorSectionProps {
  sponsorName: string
  setSponsorName: (value: string) => void
  sponsorLogo: string | null
  setSponsorLogo: (value: string | null) => void
  primaryColor: string
  setPrimaryColor: (value: string) => void
  secondaryColor: string
  setSecondaryColor: (value: string) => void
  textColor: string
  setTextColor: (value: string) => void
}

export function SponsorSection({
  sponsorName,
  setSponsorName,
  sponsorLogo,
  setSponsorLogo,
  primaryColor,
  setPrimaryColor,
  secondaryColor,
  setSecondaryColor,
  textColor,
  setTextColor,
}: SponsorSectionProps) {
  const [fileSize, setFileSize] = useState<number | null>(null)
  const MAX_FILE_SIZE_MB = 5

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size
      const fileSizeInMB = file.size / (1024 * 1024)
      setFileSize(file.size)

      if (fileSizeInMB > MAX_FILE_SIZE_MB) {
        alert(`File size (${formatFileSize(file.size)}) exceeds the ${MAX_FILE_SIZE_MB}MB limit. Please choose a smaller image.`)
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setSponsorLogo(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Card className="overflow-hidden rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-white shadow-2xl p-0">
      <CardHeader className="relative overflow-hidden border-b-2 border-primary/10 bg-gradient-to-b from-primary to-[#3d0000] p-8 m-0">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
        <div className="relative">
          <CardTitle className="flex items-center gap-3 text-2xl font-bold text-white">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            Title Sponsor
          </CardTitle>
          <CardDescription className="text-base text-white/80 mt-2">
            Manage sponsor branding and appearance
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-8">
        <div className="space-y-3">
          <Label htmlFor="sponsor-name" className="text-sm font-bold uppercase tracking-[0.15em] text-slate-700">
            Sponsor Name
          </Label>
          <Input
            id="sponsor-name"
            value={sponsorName}
            onChange={(e) => setSponsorName(e.target.value)}
            placeholder="e.g., Texas A&M Engineering"
            className="h-14 rounded-2xl border-2 border-slate-200 px-5 text-lg shadow-inner focus:border-primary/40 transition-colors"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-bold uppercase tracking-[0.15em] text-slate-700">
            <Upload className="mr-2 inline h-4 w-4" />
            Sponsor Logo
          </Label>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-6">
              {sponsorLogo && (
                <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-xl border-2 border-slate-200 bg-slate-50 p-4 shadow-inner">
                  <Image src={sponsorLogo} alt="Sponsor Logo" width={96} height={96} className="h-full w-full object-contain" />
                </div>
              )}
              <Label
                htmlFor="logo-upload"
                className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-4 transition-all hover:border-primary/40 hover:bg-primary/5"
              >
                <Upload className="h-5 w-5 text-primary" />
                <span className="text-base font-semibold text-slate-700">
                  {sponsorLogo ? "Change Logo" : "Upload Logo"}
                </span>
                <Input id="logo-upload" type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </Label>
            </div>
            
            {/* File size indicator */}
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-4 py-3">
              <FileImage className="h-4 w-4 text-slate-500" />
              <div className="flex-1 flex items-center justify-between gap-4">
                <span className="text-sm text-slate-600">
                  {fileSize ? (
                    <>
                      Current size: <span className="font-semibold text-slate-900">{formatFileSize(fileSize)}</span>
                    </>
                  ) : (
                    "No file selected"
                  )}
                </span>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>Max {MAX_FILE_SIZE_MB}MB</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-3">
            <Label htmlFor="primary-color" className="text-sm font-bold uppercase tracking-[0.15em] text-slate-700">
              <Palette className="mr-2 inline h-4 w-4" />
              Primary Color (Top)
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="primary-color"
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-14 w-20 cursor-pointer rounded-2xl border-2 border-slate-200 p-1 shadow-inner"
              />
              <Input
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-14 flex-1 rounded-2xl border-2 border-slate-200 px-4 text-base shadow-inner focus:border-primary/40 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="secondary-color" className="text-sm font-bold uppercase tracking-[0.15em] text-slate-700">
              <Palette className="mr-2 inline h-4 w-4" />
              Secondary Color (Bottom)
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="secondary-color"
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="h-14 w-20 cursor-pointer rounded-2xl border-2 border-slate-200 p-1 shadow-inner"
              />
              <Input
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="h-14 flex-1 rounded-2xl border-2 border-slate-200 px-4 text-base shadow-inner focus:border-primary/40 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="text-color" className="text-sm font-bold uppercase tracking-[0.15em] text-slate-700">
              <Palette className="mr-2 inline h-4 w-4" />
              Text Color
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="text-color"
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="h-14 w-20 cursor-pointer rounded-2xl border-2 border-slate-200 p-1 shadow-inner"
              />
              <Input
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="h-14 flex-1 rounded-2xl border-2 border-slate-200 px-4 text-base shadow-inner focus:border-primary/40 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-bold uppercase tracking-[0.15em] text-slate-500">Live Preview</p>
          
          {/* Preview Card - Simplified without status strip */}
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-red-950 shadow-xl">
            <div
              className="relative rounded-[14px] sm:rounded-[22px]"
              style={{
                background: `linear-gradient(to bottom, ${primaryColor}, ${secondaryColor})`
              }}
            >
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAyIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20 rounded-[14px] sm:rounded-[22px]" />
              
              {/* Sponsor content */}
              <div className="relative flex items-center justify-center py-3 px-4 sm:py-4 sm:px-5 lg:py-5 lg:px-6">
                <div className="group flex items-center gap-3 sm:gap-4 lg:gap-5">
                  <div className="relative flex shrink-0 items-center justify-center rounded-xl lg:rounded-2xl py-2 px-4 sm:py-3 sm:px-5 lg:py-3 lg:px-6 xl:py-4 xl:px-8 shadow-xl backdrop-blur-xl bg-white/70 border-2 border-white/80">
                    <Image 
                      src={sponsorLogo || "/meloyprogrammaroon.png"} 
                      alt={sponsorName} 
                      width={120} 
                      height={60} 
                      className="relative h-8 sm:h-10 lg:h-14 xl:h-16 w-auto max-w-[100px] sm:max-w-[130px] lg:max-w-[180px] object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs uppercase tracking-[0.12em]" style={{ color: `${textColor}CC` }}>Presented by</p>
                    <p className="text-base sm:text-lg lg:text-xl xl:text-2xl font-semibold leading-tight" style={{ color: textColor }}>{sponsorName || "Sponsor Name"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
