import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/server";

export async function GET() {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  return NextResponse.json({ data: session });
}
