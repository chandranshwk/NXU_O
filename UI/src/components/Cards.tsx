/**
 * @file Cards.tsx
 * @component Cards
 * @description A reusable configuration panel card. It displays a title, an icon,
 * and a description string alongside custom child settings controls (like inputs, sliders, or buttons).
 *
 * @architecture
 * - Used as the core UI blueprint for preference options inside Sections A through D.
 * - Supports theme variations through its `type` property ("normal" vs "destructive").
 * - Features high-density truncation layers to prevent text layouts from clipping the controls block.
 */

interface CardsProps {
  /** Switches layout styles between standard settings elements and colored warning boxes */
  type: "normal" | "destructive";
  /** Shared dark mode setting flag used to switch visual palette ranges */
  darkMode: boolean;
  /** Optional icon graphic snippet preceding the title string block */
  icon?: React.ReactNode;
  /** The display heading label title string assigned to this config row */
  title: string;
  /** Descriptive explainer text string or custom element mapping the control functionality */
  description: string | React.ReactNode;
  /** Child setting components (toggles, inputs, sliders) rendered on the right edge */
  children: React.ReactNode;
}

export const Cards: React.FC<CardsProps> = ({
  type,
  darkMode,
  icon,
  title,
  description,
  children,
}) => {
  return (
    <div className="flex flex-col gap-2 max-w-full">
      {/* ==========================================
          HORIZONTAL INTEGRATION PANELS ROW CONTAINER
          ========================================== */}
      <div
        className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-150 ${
          darkMode ? "bg-[#121212] border-zinc-800" : "bg-white border-zinc-200"
        }`}
      >
        {/* LEFT COLUMN: TITLE ICON METADATA CLUSTER */}
        <div className="flex w-3xl gap-3 items-center">
          {icon && <div>{icon}</div>}

          <div className="flex flex-col max-w-[70%]">
            {/* Setting Item Headline Label */}
            <span
              className={`  ${type === "normal" ? "font-medium text-sm" : "text-red-700 tracking-wider font-semibold text-[13.5px]"}`}
            >
              {title}
            </span>

            {/* Setting Explainer Subtext Description String */}
            <span
              className={`text-xs  mt-0.5 ${type === "normal" ? "text-zinc-400" : "text-red-400"}`}
            >
              {description}
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: ACTION VALUE OPERATOR FIELDS (Injected Children) */}
        <div className="flex items-center gap-2">{children}</div>
      </div>
    </div>
  );
};
