import React from "react";
import type { SampleProblemData } from "./CodeIDE.SAMPLE";

interface ProblemInstructionTrackProps {
  data: SampleProblemData;
  darkMode: boolean;
}

/**
 * @component ProblemInstructionTrack
 * @description Isolates the static markdown/HTML prompt renderings, structured variable examples,
 * and program limitations into an independent scrollable layout container.
 */
export const ProblemInstructionTrack: React.FC<
  ProblemInstructionTrackProps
> = ({ data, darkMode }) => {
  // Map standard parameters to explicit semantic badges without decorators
  const Mode = localStorage.getItem("ide_workspace_mode") === "practice";

  return (
    <div
      className={`h-full flex flex-col p-5 border rounded-xl overflow-y-auto no-scrollbar select-text transition-colors duration-200 ${
        darkMode
          ? "bg-zinc-900/40 border-zinc-800/80"
          : "bg-white border-zinc-200"
      }`}
    >
      {/* Meta Context Line */}
      <span className="text-[10px] font-mono uppercase tracking-wider opacity-40 mb-1 block">
        {data.category}
      </span>

      {/* Main Title Heading */}
      <h1 className="text-base font-bold tracking-tight mb-3">
        {!Mode && `${data.id}.`} {data.title}
      </h1>

      {/* Core Question HTML Target Layer */}
      <div
        className={`prose max-w-full font-sans text-xs leading-relaxed tracking-normal mb-6
          ${darkMode ? "prose-invert text-zinc-300 [&_code]:text-indigo-300 [&_code]:bg-zinc-800/50" : "text-zinc-600 [&_code]:text-indigo-700 [&_code]:bg-zinc-100/80"}
          [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-[11px]`}
        dangerouslySetInnerHTML={{ __html: data.description.html }}
      />

      {/* Input / Output Variations Deck */}
      <div className="flex flex-col gap-3 mb-6 select-text">
        {data.examples.map((example) => (
          <div
            key={example.id}
            className={`p-3 rounded-lg border font-mono text-[11px] ${
              darkMode
                ? "bg-zinc-950/40 border-zinc-800/60"
                : "bg-zinc-50/50 border-zinc-200/80"
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 block mb-1.5">
              Example {example.id}
            </span>
            <div className="space-y-1">
              <div className="break-all">
                <span className="opacity-40">Input:</span> {example.input}
              </div>
              <div className="break-all">
                <span className="opacity-40">Output:</span> {example.output}
              </div>
              {example.explanation && (
                <div className="mt-2 pt-2 border-t border-dashed border-zinc-200 dark:border-zinc-800/60 font-sans text-zinc-400 leading-normal">
                  <span className="italic opacity-60">Explanation:</span>{" "}
                  {example.explanation}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic Program Validation Constraints Section */}
      <div className="mt-auto pt-4 border-t border-zinc-200/60 dark:border-zinc-800/40">
        <h3 className="text-[10px] font-bold uppercase tracking-wider opacity-40 mb-2">
          Constraints
        </h3>
        <ul className="flex flex-col gap-1.5">
          {data.constraints.map((constraint, idx) => (
            <li
              key={idx}
              className={`font-mono text-[11px] px-2.5 py-1 rounded-md border w-max max-w-full truncate ${
                darkMode
                  ? "bg-zinc-900/60 border-zinc-800/50 text-zinc-300"
                  : "bg-zinc-50 border-zinc-200 text-zinc-600"
              }`}
            >
              {constraint}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
