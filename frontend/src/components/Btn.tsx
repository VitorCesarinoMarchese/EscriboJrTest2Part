function Btn({
  func,
  label,
  color,
  classname,
  w = "w-fit",
  disable = false
}: {
  func?: () => void;
  label: string;
  color: string;
  classname?: string;
  w?: string;
  disable?: boolean
}) {
  return (
    <>
      <button
        className={`bg-${color} ${w} h-14 p-4 rounded-xl text-2xl flex items-center justify-center cursor-pointer ${classname}`}
        onClick={func}
        disabled={disable}
      >
        {label}
      </button>
    </>
  );
}

export default Btn;
