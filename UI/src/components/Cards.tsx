export const Cards = ({
  type,
  darkMode,
  icon,
  title,
  description,
  children,
}: {
  type: "normal" | "destructive";
  darkMode: boolean;
  icon?: React.ReactNode;
  title: string;
  description: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col gap-2 max-w-full">
      {/* POWERTOYS HORIZONTAL CARD 1: AUTO SAVE DELAY SLIDER */}
      <div
        className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-150 ${
          darkMode ? "bg-[#121212] border-zinc-800" : "bg-white border-zinc-200"
        }`}
      >
        <div className="flex w-3xl gap-3 items-center">
          {icon && <div>{icon}</div>}
          <div className="flex flex-col max-w-[70%]">
            <span
              className={`  ${type === "normal" ? "font-medium text-sm" : "text-red-700 tracking-wider font-semibold text-[13.5px]"}`}
            >
              {title}
            </span>
            <span
              className={`text-xs  mt-0.5 ${type === "normal" ? "text-zinc-400" : "text-red-400"}`}
            >
              {description}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">{children}</div>
      </div>
    </div>
  );
};
