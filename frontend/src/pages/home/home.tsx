import { LessonPlanCard } from "../../components/LessonPlanCard"
import { NavBar } from "../../components/NavBar"

export const Home = () => {
  return <>
    <NavBar></NavBar>
    <div className="w-full flex flex-col items-center justify-center gap-6 mt-6">
      <LessonPlanCard
        main_theme="Aquecimento Global"
        secondary_theme="Aquecimento Global"
        age_group="oitavo ano"
        objective="Ensinar as criancas sobre os perigos do aquecimento global"
        subject="geografia"
        duration={45}
      />
    </div>
  </>
}
