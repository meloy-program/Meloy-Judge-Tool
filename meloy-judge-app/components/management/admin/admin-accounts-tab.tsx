"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Users, Mail, Loader2 } from "lucide-react"
import { getUsers, updateUserRole, type User } from "@/lib/api/users"
import { useToast } from "@/hooks/use-toast"

export function AdminAccountsTab() {
  const [searchQuery, setSearchQuery] = useState("")
  const [accounts, setAccounts] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null)
  const [editingRole, setEditingRole] = useState<'member' | 'judge' | 'admin'>('member')
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      const data = await getUsers()
      setAccounts(data.users)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load accounts')
      toast({
        title: "Failed to Load Accounts",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEditClick = (account: User) => {
    setEditingAccountId(account.id)
    setEditingRole(account.role)
  }

  const handleCancelEdit = () => {
    setEditingAccountId(null)
    setEditingRole('member')
  }

  const handleSaveRole = async (accountId: string) => {
    try {
      setSaving(true)
      await updateUserRole(accountId, editingRole)
      
      // Update local state
      setAccounts(accounts.map(acc => 
        acc.id === accountId ? { ...acc, role: editingRole } : acc
      ))
      
      toast({
        title: "Role Updated",
        description: "User role has been updated successfully.",
      })
      
      setEditingAccountId(null)
    } catch (err) {
      toast({
        title: "Failed to Update Role",
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const filteredAccounts = accounts.filter((account) => 
    account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    account.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getRoleBadgeStyle = (role: string, isActive: boolean) => {
    if (isActive) {
      return 'border-white/50 bg-white/95'
    }
    return 'border-white/20 bg-white/10'
  }

  const getRoleTextStyle = (role: string, isActive: boolean) => {
    if (isActive) {
      return 'text-slate-800'
    }
    return 'text-white/70'
  }

  return (
    <div className="space-y-8">
      <div>
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

        {loading && (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-lg text-slate-600">Loading accounts...</p>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <p className="text-lg text-red-600">Error: {error}</p>
              <Button
                className="mt-4"
                onClick={fetchAccounts}
              >
                Retry
              </Button>
            </div>
          </div>
        )}

        {!loading && !error && filteredAccounts.length === 0 && (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <p className="text-lg text-slate-600">
                {searchQuery ? 'No accounts found matching your search' : 'No accounts found'}
              </p>
            </div>
          </div>
        )}

        {!loading && !error && filteredAccounts.length > 0 && (
          <div className="relative overflow-hidden rounded-3xl shadow-2xl">
            <div className="absolute inset-0 bg-linear-to-b from-primary to-[#3d0000]" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
            
            <div className="relative max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-white/5">
              <div className="divide-y divide-white/10">
                {filteredAccounts.map((account) => (
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
                                onClick={() => setEditingRole('member')}
                                className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 shadow-sm backdrop-blur-sm transition-all hover:shadow-md ${
                                  getRoleBadgeStyle('member', editingRole === 'member')
                                }`}
                              >
                                <span className={`text-sm font-semibold ${
                                  getRoleTextStyle('member', editingRole === 'member')
                                }`}>
                                  Member
                                </span>
                              </button>

                              <button
                                onClick={() => setEditingRole('judge')}
                                className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 shadow-sm backdrop-blur-sm transition-all hover:shadow-md ${
                                  getRoleBadgeStyle('judge', editingRole === 'judge')
                                }`}
                              >
                                <span className={`text-sm font-semibold ${
                                  getRoleTextStyle('judge', editingRole === 'judge')
                                }`}>
                                  Judge
                                </span>
                              </button>

                              <button
                                onClick={() => setEditingRole('admin')}
                                className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 shadow-sm backdrop-blur-sm transition-all hover:shadow-md ${
                                  getRoleBadgeStyle('admin', editingRole === 'admin')
                                }`}
                              >
                                <span className={`text-sm font-semibold ${
                                  getRoleTextStyle('admin', editingRole === 'admin')
                                }`}>
                                  Admin
                                </span>
                              </button>
                            </div>

                            <div className="flex items-center gap-3">
                              <Button
                                onClick={handleCancelEdit}
                                disabled={saving}
                                className="h-10 rounded-xl border-2 border-white/30 bg-white/20 px-5 text-sm font-semibold text-white shadow-sm backdrop-blur-sm transition-all hover:bg-white/30 hover:shadow-md disabled:opacity-50"
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={() => handleSaveRole(account.id)}
                                disabled={saving}
                                className="h-10 rounded-xl border-2 border-white/30 bg-white/20 px-5 text-sm font-semibold text-white shadow-sm backdrop-blur-sm transition-all hover:bg-white/30 hover:shadow-md disabled:opacity-50"
                              >
                                {saving ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                  </>
                                ) : (
                                  'Save'
                                )}
                              </Button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-4">
                              <div
                                className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3 shadow-sm backdrop-blur-sm ${
                                  getRoleBadgeStyle(account.role, true)
                                }`}
                              >
                                <span className={`text-sm font-semibold ${
                                  getRoleTextStyle(account.role, true)
                                }`}>
                                  {account.role.charAt(0).toUpperCase() + account.role.slice(1)}
                                </span>
                              </div>
                            </div>

                            <Button
                              onClick={() => handleEditClick(account)}
                              className="h-10 rounded-xl border-2 border-white/30 bg-white/10 px-5 text-sm font-semibold text-white shadow-sm backdrop-blur-sm transition-all hover:bg-white/20 hover:shadow-md"
                            >
                              Change Role
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
