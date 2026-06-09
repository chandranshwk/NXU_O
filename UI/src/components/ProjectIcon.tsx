import React from "react";

interface ProjectIconProps {
  color: string; // "from-indigo-500 to-purple-600"
}

const ProjectIcon: React.FC<ProjectIconProps> = ({ color }) => {
  return (
    /* The container should match the width of your sidebar items to ensure perfect centering */
    <div className="flex items-center justify-center w-full py-2">
      <div
        className={`
          shrink-0 size-2 rounded-full transition-all duration-300 ease-in-out
          bg-linear-to-br ${color} 
          group-hover:scale-150 group-hover:shadow-[0_0_10px_rgba(0,0,0,0.2)]
        `}
      />
    </div>
  );
};

export default ProjectIcon;
