import { Navigate, NavLink } from "react-router"
import Btn from "./Btn"

export const NavBar = () => {
  return (
    <nav className="flex flex-row items-center justify-between py-2 px-6 border-b border-b-black">
      <NavLink to="/">
        <img src="/escribo.png" className="h-26" />
      </NavLink>

      <NavLink to="/criar">

        <Btn func={() => ``} label="Novo Plano" color="bg-blue-700" classname="text-white hover:bg-blue-900 transition-colors" />
      </NavLink>
    </nav>
  )
}
