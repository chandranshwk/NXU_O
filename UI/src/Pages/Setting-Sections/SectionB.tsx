import React from "react";
import { Cards } from "../../components/Cards";
import { FiType } from "react-icons/fi";
import type { settingsContextType } from "../../contexts/settingsContext";
import { COLORS, FONTS, ORDEREDLISTRESPRESENTER } from "../../assets/assets";
import { formatName } from "../../assets/functions";

interface props {
  darkMode: boolean;
  settings: settingsContextType;
}

const SectionB: React.FC<props> = ({ darkMode, settings }) => {
  return (
    <div className="flex flex-col gap-2 mt-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 px-1">
        <FiType className="w-3.5 h-3.5" /> Typography & Font Mapping
      </h3>

      {/* POWERTOYS HORIZONTAL CARD 3: DEFAULT FONT SIZE */}
      <Cards
        type="normal"
        title="Base Text Scale Default"
        description="Lock your baseline paragraph font sizing metric rule upon fresh document scratchpad load."
        darkMode={darkMode}
      >
        <select
          value={settings.defaultFontSize}
          onChange={(e) => {
            const nextFontSize = e.target.value;

            settings.setDefaultFontSize(nextFontSize);
          }}
          className={`text-xs px-2.5 py-1.5 rounded border outline-none font-medium cursor-pointer ${
            darkMode
              ? "bg-zinc-800 border-zinc-700 text-zinc-200"
              : "bg-zinc-50 border-zinc-300 text-zinc-700"
          }`}
        >
          <option value="12px">12px (High Density)</option>
          <option value="14px">14px (Compact)</option>
          <option value="16px">16px (Standard)</option>
        </select>
      </Cards>

      {/* POWERTOYS HORIZONTAL CARD 4: LINE LEADING */}

      <Cards
        type="normal"
        title="Line Splay Padding Scale"
        description="Fine-tune vertical line height proportions across active rich text paragraph views."
        darkMode={darkMode}
      >
        <select
          value={settings.lineHeight}
          onChange={(e) => {
            const nextLineHeight = parseFloat(e.target.value);

            settings.setLineHeight(nextLineHeight);
          }}
          className={`text-xs px-2.5 py-1.5 rounded border outline-none font-medium cursor-pointer ${
            darkMode
              ? "bg-zinc-800 border-zinc-700 text-zinc-200"
              : "bg-zinc-50 border-zinc-300 text-zinc-700"
          }`}
        >
          <option value={1.2}>Tight (Dense Lines - 1.2)</option>
          <option value={1.5}>Normal (Standard - 1.5)</option>
          <option value={1.8}>Relaxed (Balanced View - 1.8)</option>
          <option value={2.1}>Loose (Spacious Text - 2.1)</option>
        </select>
      </Cards>

      {/* POWERTOYS HORIZONTAL CARD 4: FONT FAMILY */}

      <Cards
        type="normal"
        title="Line Splay Padding Scale"
        description="Fine-tune vertical line height proportions across active rich text paragraph views."
        darkMode={darkMode}
      >
        <select
          value={settings.defaultFont}
          onChange={(e) => {
            const font = e.target.value;

            settings.setDefaultFont(font);
          }}
          className={`text-xs px-2.5 py-1.5 rounded border outline-none font-medium cursor-pointer ${
            darkMode
              ? "bg-zinc-800 border-zinc-700 text-zinc-200"
              : "bg-zinc-50 border-zinc-300 text-zinc-700"
          }`}
        >
          {FONTS.map((font, idx) => (
            <option value={font} key={idx}>
              {formatName(font)}
            </option>
          ))}
        </select>
      </Cards>

      {/* POWERTOYS HORIZONTAL CARD 4: TEXT COLOR */}

      <Cards
        type="normal"
        title="Font Color"
        description="Select a color, to quick-start your thinking with (list representers will reflect only the default color)."
        darkMode={darkMode}
      >
        <select
          value={settings.defaultColor}
          onChange={(e) => {
            const color = e.target.value;

            settings.setDefaultColor(color);
          }}
          className={`text-xs px-2.5 py-1.5 rounded border outline-none font-medium cursor-pointer ${
            darkMode
              ? "bg-zinc-800 border-zinc-700"
              : "bg-zinc-50 border-zinc-300"
          }`}
          style={{ color: settings.defaultColor }}
        >
          {COLORS.map((color, idx) => (
            <option value={color} key={idx} style={{ color: color }}>
              Abc
            </option>
          ))}
        </select>
      </Cards>

      {/* POWERTOYS HORIZONTAL CARD 5: ORDERED LIST REPRESENTATIVE */}

      <Cards
        type="normal"
        title="Ordered List Representer"
        description="Select what you want as a representer for ordered lists."
        darkMode={darkMode}
      >
        <select
          value={settings.defaultOLRepresenter}
          onChange={(e) => {
            const font = e.target.value;

            settings.setDefaultOLRepresenter(font);
          }}
          className={`text-xs px-2.5 py-1.5 rounded border outline-none font-medium cursor-pointer ${
            darkMode
              ? "bg-zinc-800 border-zinc-700 text-zinc-200"
              : "bg-zinc-50 border-zinc-300 text-zinc-700"
          }`}
        >
          {ORDEREDLISTRESPRESENTER.map((font, idx) => (
            <option value={font} key={idx}>
              {formatName(font)}
            </option>
          ))}
        </select>
      </Cards>
    </div>
  );
};

export default SectionB;
