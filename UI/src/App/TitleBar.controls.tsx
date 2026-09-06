import { IoClose, IoRemove, IoSquareOutline } from "react-icons/io5";
import type { Window } from "@tauri-apps/api/window";

interface props {
  appWindow: Window;
  darkMode: boolean;
}

const TitleBarControl: React.FC<props> = ({ darkMode, appWindow }) => {
  return (
    <div
      className="flex items-center space-x-2.5 mr-5 h-full group/controls select-none"
      data-tauri-drag-region={false}
    >
      <button
        onClick={() => appWindow.minimize()}
        className={`size-6 rounded-full flex items-center justify-center border transition-all duration-150 relative text-xs
                ${darkMode ? "bg-[#E5C07B] border-[#E5C07B] text-zinc-950 hover:text-transparent hover:bg-[#E5C07B]/60" : "bg-[#E5C07B]/20 border-[#E5C07B]/40 text-[#B68A35] hover:bg-[#B68A35]"}`}
      >
        <IoRemove className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={() => appWindow.toggleMaximize()}
        className={`size-6 rounded-full flex items-center justify-center border transition-all duration-150 relative text-xs
                ${darkMode ? "bg-[#98C379] border-[#98C379] text-zinc-950 hover:text-transparent hover:bg-[#98C379]/60" : "bg-[#98C379]/20 border-[#98C379]/40 text-[#60943B] hover:bg-[#60943B]"}`}
      >
        <IoSquareOutline className="w-2.5 h-2.5" />
      </button>

      <button
        onClick={() => appWindow.close()}
        className={`size-6 rounded-full flex items-center justify-center border transition-all duration-150 relative text-xs
                ${darkMode ? "bg-[#E06C75] border-[#E06C75] text-white hover:text-transparent hover:bg-[#E06C75]/60" : "bg-[#E06C75]/15 border-[#E06C75]/30 text-[#D14A55] hover:bg-[#D14A55]"}`}
      >
        <IoClose className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default TitleBarControl;
