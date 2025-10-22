import type { Route } from "./+types/home";
import { AuthScreen } from "../pages/auth";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
    <>
      <AuthScreen />
    </>
  );
}
