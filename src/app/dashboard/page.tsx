import { getServerSession } from "next-auth"
import { authOptions } from "../api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/api/auth/signin")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: { aliases: true },
  })

  return (
    <main className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome, {session.user.name}</p>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Aliases</h2>
        <button className="bg-black text-white px-4 py-2 rounded-lg text-sm">
          + New Alias
        </button>
      </div>

      {user?.aliases.length === 0 ? (
        <div className="border border-dashed border-gray-300 rounded-lg p-12 text-center">
          <p className="text-gray-500">No aliases yet.</p>
          <p className="text-gray-400 text-sm mt-1">
            Create your first alias to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {user?.aliases.map((alias) => (
            <div
              key={alias.id}
              className="border border-gray-200 rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{alias.aliasEmail}</p>
                <p className="text-sm text-gray-500">→ {alias.realEmail}</p>
              </div>
              <div className="flex gap-2 items-center">
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
            </div>
          ))}
        </div>
      )}
    </main>
  )
}