import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { PrismaClient } from "@prisma/client"
import { authOptions } from "@/lib/auth"

const prisma = new PrismaClient()

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const aliases = await prisma.alias.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(aliases)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { name } = await req.json()

  if (!name) {
    return NextResponse.json({ error: "Alias name is required" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const alias = await prisma.alias.create({
    data: {
      name,
      aliasEmail: `${name}@slayer.world`,
      realEmail: session.user.email,
      userId: user.id,
    },
  })

  return NextResponse.json(alias)
}