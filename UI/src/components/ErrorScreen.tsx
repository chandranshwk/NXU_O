import { FiAlertTriangle, FiRefreshCw, FiHome } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

interface ErrorScreenProps {
  error?: unknown;
  is404?: boolean;
}

export const ErrorScreen = ({ error, is404 }: ErrorScreenProps) => {
  const navigate = useNavigate();

  let errorMessage = "";
  if (error) {
    if (error instanceof Error) {
      errorMessage = error.stack || error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    } else {
      errorMessage = JSON.stringify(error, null, 2);
    }
  }

  return (
    <div className="h-screen w-full flex items-center justify-center bg-zinc-950 text-zinc-200 font-sans p-8">
      <div className="max-w-2xl w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
          <FiAlertTriangle size={32} className="text-red-500" />
        </div>

        <h1 className="text-2xl font-bold mb-2">
          {is404 ? "Page Not Found" : "Something went wrong"}
        </h1>
        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
          {is404
            ? "The page you are looking for doesn't exist or has been moved."
            : "The application encountered an unexpected error. Don't worry, your local files and notes are safe."}
        </p>

        {errorMessage && !is404 && (
          <div className="w-full bg-black/50 rounded-lg p-4 mb-6 text-left border border-zinc-800 max-h-60 overflow-y-auto">
            <code className="text-[11px] text-red-400 font-mono whitespace-pre-wrap break-all leading-relaxed">
              {errorMessage}
            </code>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-semibold rounded-lg transition-colors active:scale-95"
          >
            <FiRefreshCw size={16} />
            Reload
          </button>

          {is404 && (
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-5 py-2.5 bg-zinc-100 hover:bg-white text-zinc-900 text-sm font-semibold rounded-lg transition-colors active:scale-95"
            >
              <FiHome size={16} />
              Go Home
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
