"use client"

import { useState, useEffect } from "react"
import { useSession, signIn } from "next-auth/react"

type Alias = {
  id: string
  name: string
  aliasEmail: string
  realEmail: string
  enabled: boolean
  createdAt: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [aliases, setAliases] = useState<Alias[]>([])
  const [showForm, setShowForm] = useState(false)
  const [aliasName, setAliasName] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (session) {
      fetchAliases()
    }
  }, [session])

  async function fetchAliases() {
    const res = await fetch("/api/create-alias")
    const data = await res.json()
    setAliases(data)
  }

  async function createAlias() {
    if (!aliasName) return
    setLoading(true)
    await fetch("/api/create-alias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: aliasName }),
    })
    setAliasName("")
    setShowForm(false)
    setLoading(false)
    fetchAliases()
  }

  if (status === "loading") return <p className="p-8">Loading...</p>

  if (!session) {
    signIn()
    return null
  }

  return (
    <main className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome, {session.user?.name}</p>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Aliases</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-black text-white px-4 py-2 rounded-lg text-sm"
        >
          + New Alias
        </button>
      </div>

      {showForm && (
        <div className="border border-gray-200 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium mb-2">Create a new alias</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. shopping"
              value={aliasName}
              onChange={(e) => setAliasName(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm flex-1"
            />
            <span className="text-gray-500 text-sm self-center">
              @slayer.world
            </span>
            <button
              onClick={createAlias}
              disabled={loading}
              className="bg-black text-white px-4 py-2 rounded text-sm"
            >
              {loading ? "Creating..." : "Create"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-500 text-sm px-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {aliases.length === 0 ? (
        <div className="border border-dashed border-gray-300 rounded-lg p-12 text-center">
          <p className="text-gray-500">No aliases yet.</p>
          <p className="text-gray-400 text-sm mt-1">
            Create your first alias to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {aliases.map((alias) => (
            <div
              key={alias.id}
              className="border border-gray-200 rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{alias.aliasEmail}</p>
                <p className="text-sm text-gray-500">→ {alias.realEmail}</p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  alias.enabled
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {alias.enabled ? "Active" : "Disabled"}
              </span>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}