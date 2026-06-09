import { useNavigate, useOutletContext } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

// 1. Define a clear TypeScript type for your templates
export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  content: string; // Pre-filled document text
}

const Home = () => {
  const { darkMode } = useOutletContext<{ darkMode: boolean }>();
  const navigate = useNavigate();
  const handleCreateDocument = () => {
    navigate(`/document/${uuidv4()}`);
  };

  return (
    <div
      className={`h-full flex flex-col justify-center overflow-hidden ${!darkMode ? "bg-white" : "bg-[#18181b]"}`}
    >
      <div
        className="w-full bg-[#252525] p-6 text-white select-none"
        onClick={() => handleCreateDocument()}
      >
        {/* Container header matching standard desktop layouts */}
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Start a new document
        </h2>

        <div>
          <button className="group flex w-35 flex-col items-center text-center focus:outline-none">
            {/* Paper Thumbnail Wrapper */}
            <div className="relative aspect-3/4 w-full overflow-hidden border border-zinc-700 bg-white p-1 shadow-sm transition-all group-hover:border-zinc-400 group-hover:shadow-md group-focus:border-blue-500 group-focus:ring-2 group-focus:ring-blue-500/50">
              {/* Clean White Page Content Area */}
              <div className="flex h-full w-full items-center justify-center bg-white text-zinc-300 transition-colors group-hover:text-blue-500">
                {/* Subtle visual plus indicator */}
                <svg
                  xmlns="http://w3.org"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-8 w-8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
              </div>
            </div>

            {/* Label matching the layout style */}
            <span className="mt-2 w-full truncate px-1 text-xs font-medium text-zinc-300 group-hover:text-white">
              Blank document
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
