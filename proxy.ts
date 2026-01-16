import { getServerSession } from "next-auth"; // ✅ Correct import for v4
import { authOptions } from "@/lib/auth";     // ✅ Import your options
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function proxy(request: NextRequest) {
  // ✅ Pass authOptions to getServerSession
  const session = await getServerSession(authOptions); 

  // Now you can check roles
  if (session?.user?.role !== 'admin') {
     // handle unauthorized...
  }
  
  return NextResponse.next();
}