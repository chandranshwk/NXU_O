import { useNavigate, useOutletContext } from "react-router-dom";
import { v4 as uuidv4 } from "uuid"; // Import the UUID library

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
  return (
    <div
      className={`p-8 text-xl font-bold ${!darkMode ? "text-gray-800" : "text-white"}`}
    >
      HOME
      <button
        className={`mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600`}
        onClick={() => navigate(`document/${uuidv4()}`)}
      >
        Create new note
      </button>
    </div>
  );
};

export default Home;
