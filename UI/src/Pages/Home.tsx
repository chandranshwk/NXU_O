import { useOutletContext } from "react-router-dom";

// 1. Define a clear TypeScript type for your templates
export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  content: string; // Pre-filled document text
}

const Home = () => {
  const { darkMode } = useOutletContext<{ darkMode: boolean }>();

  return (
    <div
      className={`p-8 text-xl font-bold ${!darkMode ? "text-gray-800" : "text-white"}`}
    >
      HOME
    </div>
  );
};

export default Home;
