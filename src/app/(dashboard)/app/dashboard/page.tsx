import { auth } from "@/lib/auth"
import { DashboardClient } from "@/components/dashboard/dashboard-client"

export default async function DashboardPage() {
  const session = await auth()
  const name = session?.user?.name || session?.user?.email?.split("@")[0] || "User"

  return <DashboardClient userName={name} />
}
