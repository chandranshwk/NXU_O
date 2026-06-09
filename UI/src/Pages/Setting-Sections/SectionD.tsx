import React, { type SetStateAction } from "react";
import { Cards } from "../../components/Cards";
import { FiEye, FiTrash2 } from "react-icons/fi";

interface props {
  darkMode: boolean;
  marginPreset: string;
  setMarginPreset: React.Dispatch<SetStateAction<string>>;
}

const SectionD: React.FC<props> = ({
  darkMode,
  marginPreset,
  setMarginPreset,
}) => {
  return (
    <div className="flex flex-col gap-2 mt-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 px-1">
        <FiEye className="w-3.5 h-3.5" /> Interface Layout Presets
      </h3>

      {/* POWERTOYS HORIZONTAL CARD 5: MARGIN PADDING PRESET */}

      <Cards
        type="normal"
        title="Scratchpad Column Padding Preset"
        description="Toggle text side boundaries to choose between structured center columns or edge-to-edge views."
        darkMode={darkMode}
      >
        <select
          value={marginPreset}
          onChange={(e) => setMarginPreset(e.target.value)}
          className={`text-xs px-2.5 py-1.5 rounded border outline-none font-medium cursor-pointer ${
            darkMode
              ? "bg-zinc-800 border-zinc-700 text-zinc-200"
              : "bg-zinc-50 border-zinc-300 text-zinc-700"
          }`}
        >
          <option value="compact">Compact centered column</option>
          <option value="wide">Full width edge-to-edge</option>
        </select>
      </Cards>

      {/* POWERTOYS HORIZONTAL CARD 6: DESTRUCTIVE CACHE CLEAR OVERRIDE */}

      <Cards
        type="destructive"
        title="Destructive Cache Purge"
        description="Instantly clear out all cached scratchpad document storage matrices to fix corrupted text layers."
        darkMode={darkMode}
      >
        <button className="flex items-center gap-1.5 w-max px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-500/10 rounded border border-transparent transition-colors">
          <FiTrash2 className="w-3.5 h-3.5" /> Purge Cache
        </button>
      </Cards>
    </div>
  );
};

export default SectionD;
