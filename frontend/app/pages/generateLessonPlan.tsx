import { LessonPlanCard } from "../components/LessonPlanCard"
import { NavBar } from "../components/NavBar"
import { useAuth } from "~/components/AuthProvider"
import { Navigate } from "react-router"
import { LessonPlanForm } from "~/components/LessonPlanForm"

export const GenerateLessonPlan = () => {
  const { session, loading } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!session) return <Navigate to="/auth" replace />

  return <>
    <NavBar></NavBar>
    <div className="w-full flex flex-col items-center justify-center gap-6 mt-6">
      <LessonPlanForm userId={session?.user.id} />
    </div>
  </>
}
