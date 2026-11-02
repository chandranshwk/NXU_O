import { useOutletContext } from "react-router-dom";

const GraphView = () => {
  const { darkMode } = useOutletContext<{ darkMode: boolean }>();

  return (
    <div
      className={`p-8 text-xl font-bold ${!darkMode ? "text-gray-800" : "text-white"}`}
    >
      Graph View Network
    </div>
  );
};

export default GraphView;
