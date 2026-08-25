import { useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import type { MockSection } from "../assets/SAMPLE";
import { useNotebookStore } from "../contexts/notebook";

const Home = () => {
  const { darkMode } = useOutletContext<{ darkMode: boolean }>();
  const navigate = useNavigate();

  // Connect to our central state engine
  const { notebooks, initializeData } = useNotebookStore();

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  return (
    <div
      className={`p-8 w-full min-h-screen transition-colors duration-200 ${
        darkMode ? "bg-zinc-950 text-white" : "bg-gray-50 text-gray-800"
      }`}
    >
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 mb-8 border-zinc-800">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Workspace Repository
          </h1>
          <p
            className={`text-sm mt-1 ${darkMode ? "text-zinc-400" : "text-gray-500"}`}
          >
            Local-first database workspace manager
          </p>
        </div>
        <button
          className="px-5 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-500 shadow-md transition-all"
          onClick={() => navigate(`document/${uuidv4()}`)}
        >
          Create New Note
        </button>
      </div>

      {/* Grid Wrapper */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {notebooks.map((notebook) => (
          <div
            key={notebook.id}
            onClick={() => navigate(`document/${notebook.id}`)}
            className={`border rounded-xl p-5 shadow-sm transition-all cursor-pointer hover:border-blue-500/50 ${
              darkMode
                ? "bg-zinc-900 border-zinc-800"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="mb-4">
              <span
                className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full ${
                  darkMode
                    ? "bg-zinc-800 text-zinc-400"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                Notebook
              </span>
              <h2 className="text-xl font-bold mt-1.5">{notebook.title}</h2>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">
                {notebook.id}
              </p>
            </div>

            <div className="flex flex-col gap-4 mt-2">
              {notebook.sections.map((section: MockSection) => (
                <div
                  key={section.id}
                  className="border-l-2 pl-4 py-1"
                  style={{ borderLeftColor: section.colorHex }}
                >
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm">{section.title}</h3>
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: section.colorHex }}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {section.pages.map((page) => (
                      <div
                        key={page.id}
                        onClick={(e) => {
                          e.stopPropagation(); // Stops parent notebook navigation card click from firing
                          navigate(`document/${notebook.id}?page=${page.id}`);
                        }}
                        className={`text-xs p-2 rounded border cursor-pointer font-medium transition-all truncate ${
                          darkMode
                            ? "bg-zinc-850 border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white"
                            : "bg-gray-50 border-gray-150 hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        {String(page.title)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
