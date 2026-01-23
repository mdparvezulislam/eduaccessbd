import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Ensure this path matches your project
import { redirect } from "next/navigation";
import DashboardSidebar from "@/components/dashboard/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Check Session
  const session = await getServerSession(authOptions);

  // 2. Redirect if not logged in
  if (!session) {
    // Redirects to login, then brings them back to dashboard after successful login
    redirect("/auth/login?callbackUrl=/dashboard");
  }

  // 3. Render Dashboard if authenticated
  return (
    <div className="min-h-screen bg-black text-white flex flex-col lg:flex-row">
      {/* Sidebar Component */}
      <DashboardSidebar />

      {/* Dynamic Page Content */}
      <main className="flex-1 lg:pl-12 w-full">
        <div className="p-0 md:p-4 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}