import Btn from "./Btn"

export const NavBar = () => {
  return (
    <nav className="flex flex-row items-center justify-between py-2 px-6 border-b border-b-black">
      <img src="/escribo.png" className="h-26" />
      <Btn func={() => ''} label="Novo Plano" color="blue-700" classname="text-white hover:bg-blue-900 transition-colors" />
    </nav>
  )
}

