export const LessonPlanCard = ({
  main_theme,
  secondary_theme,
  age_group,
  objective,
  subject,
  duration
}:
  {
    main_theme: string,
    secondary_theme: string,
    age_group: string,
    objective: string,
    subject: string,
    duration: number
  }) => {
  return (
    <div className="w-fit flex flex-row gap-8 border border-black rounded-xl py-3 px-6">
      <ul className="list-none flex flex-col gap-3 text-xl">
        <li><b>Tema Principal:</b> {main_theme}</li>
        <li><b>Tema Secundario:</b> {secondary_theme}</li>
        <li><b>Faixa Etaria:</b> {age_group}</li>
      </ul>
      <ul className="list-none flex flex-col gap-3 text-xl">
        <li className="truncate w-xl"><b>Objetivo:</b> {objective}</li>
        <li><b>Materia:</b> {subject}</li>
        <li><b>Duracao:</b> {duration} minutos</li>
      </ul>
    </div>
  )
}
