import { useState } from "react"
import { LessonPlanCard } from "../components/LessonPlanCard"
import { NavBar } from "../components/NavBar"
import { useAuth } from "~/components/AuthProvider"
import { Navigate } from "react-router"

export const HomePage = () => {
  const { session, loading } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!session) return <Navigate to="/auth" replace />

  return <>
    <NavBar></NavBar>
    <div className="w-full flex flex-col items-center justify-center gap-6 mt-6">
      <LessonPlanCard
        main_theme="Aquecimento Global"
        secondary_theme="Aquecimento Global"
        age_group="Oitavo ano"
        objective="Ensinar as criancas sobre os perigos do aquecimento global"
        subject="Geografia"
        duration={45}
      />
    </div>
  </>
}
