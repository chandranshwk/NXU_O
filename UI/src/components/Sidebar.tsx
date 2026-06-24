import { useEffect, useState } from "react";
import { LuNotepadText } from "react-icons/lu";

import { GrNodes } from "react-icons/gr";
import { AnimatePresence, motion } from "framer-motion";
import { FiSettings } from "react-icons/fi";
import { RiHomeLine } from "react-icons/ri";
import { getInitials } from "../assets/functions";
import ProjectIcon from "./ProjectIcon";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  darkMode: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ darkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const fullName = "User";
  const email = "johndoe@gmail.com";
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [, setOpenDialog] = useState<boolean>(false);
  const navigate = useNavigate();

  const NAVITEMS = [
    {
      label: "Grifty",
      color: "from-indigo-500 to-purple-600",
      link: "/project/grifty",
    },
    {
      label: "Llama TB",
      color: "from-emerald-500 to-teal-800",
      link: "/project/llamatb",
    },
    {
      label: "OXU_O",
      color: "from-orange-400 to-rose-500",
      link: "/project/OXU_O",
    },
    {
      label: "Samridh",
      color: "from-blue-500 to-cyan-500",
      link: "/project/samridh",
    },
  ];

  const PAGES = [
    {
      icon: <RiHomeLine size={22} />,
      label: "Home",
      link: "/",
    },
    {
      icon: <LuNotepadText size={22} />,
      label: "Scratch Pad",
      link: "/scratchpad",
    },
    {
      icon: <GrNodes size={22} />,
      label: "Graph View",
      link: "/graph",
    },
    {
      icon: <FiSettings size={20} />,
      label: "Settings",
      link: "/settings",
    },
  ];

  const [currentSite, setCurrentSide] = useState<{
    name: string;
    icon: React.ReactNode;
  }>({ name: "NXU_O", icon: null }); // Set a safe initial state

  useEffect(() => {
    const pathParts = location.pathname.split("/");

    // 1. Check if we are in a project route (e.g., /project/grifty)
    if (location.pathname.startsWith("/project") && pathParts[2]) {
      const projectId = pathParts[2];

      // Find the matching item in NAVITEMS to get its specific color
      const matchedProject = NAVITEMS.find(
        (item) => item.link === `/project/${projectId}`,
      );

      if (matchedProject) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrentSide({
          name: matchedProject.label,
          icon: (
            <div
              className={`h-8 w-8 rounded-full hover:scale-110 relative shrink-0 size-5 transition-transform duration-300 group-hover:scale-110 border bg-linear-to-br ${matchedProject.color} p-px rounded-full flex items-center justify-center shadow-lg shadow-orange-500/10`}
            />
          ),
        });
        return; // Exit early if found
      }
    }

    // 2. Default Fallback (OXU_O)
    setCurrentSide({
      name: "NXU_O",
      icon: (
        <img
          src="/icon-OXU_O.png"
          alt="Logo"
          className={`h-8 w-8 rounded-full border transition-transform duration-300 group-hover:scale-110 relative ${
            darkMode
              ? "border-slate-700 shadow-lg"
              : "border-slate-200 shadow-sm"
          }`}
        />
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, darkMode]);

  const filteredItems = NAVITEMS.filter(
    (item) => item.link !== location.pathname,
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpenDialog(false);
  }, [isOpen]);

  return (
    <div className="mr-1 xl:block sm:hidden">
      <motion.div
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => {
          setIsOpen(false);
          setActiveMenu(null);
        }}
        animate={{ width: isOpen ? "240px" : "55px" }}
        /* 1. SINGLE CONTAINER: Essential for consistent animation speed */
        className={`relative h-[calc(100vh-1rem)] justify-evenly gap-2 m-2 mt-2 mx-1 flex flex-col rounded-lg transition-colors duration-300 overflow-visible z-50 border-0`}
      >
        {/* TOP SECTION: Project Switcher */}
        <div
          className={`flex items-center p-3 gap-3 h-16 shrink-0 border-b border-transparent rounded-lg ${darkMode ? "bg-[#141414] text-white border-[#242425ab]" : "bg-white border-slate-100"}`}
        >
          <div className="relative shrink-0 flex items-center justify-center">
            {currentSite.icon}
            {darkMode && (
              <div className="absolute inset-0 bg-orange-500/10 blur-md rounded-full -z-10" />
            )}
          </div>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex-1 min-w-0 flex items-center justify-between ml-1"
              >
                <div
                  className={`font-bold tracking-tight text-sm truncate ${darkMode ? "text-slate-100" : "text-slate-900"}`}
                >
                  {currentSite.name}
                </div>

                <div className="relative mt-2"></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* NAVIGATION BODY: Scrollable area */}
        <div
          className={`flex-1 overflow-y-auto rounded-lg overflow-x-hidden justify-between flex flex-col p-3 pt-2 custom-scrollbar ${darkMode ? "bg-[#141414] text-white border-[#242425ab]" : "bg-white border-slate-100"}`}
        >
          <div>
            <div className="flex flex-col gap-2 mt-2">
              {/* Main Divider */}
              <div className="flex items-center h-2 pt-2 w-full px-1 mb-2">
                {isOpen ? (
                  <div className="flex items-center gap-3 w-full opacity-60">
                    <hr className="flex-1 border-t border-slate-300" />
                    <span
                      className={`font-bold uppercase text-[10px] ${darkMode ? "text-white" : "text-slate-900"} tracking-widest`}
                    >
                      Main
                    </span>
                    <hr className="flex-1 border-t border-slate-300" />
                  </div>
                ) : (
                  <hr className="w-full border-slate-200" />
                )}
              </div>

              {/* PAGES Mapping */}
              {PAGES.map((item, index) => {
                const isExpanded = activeMenu === index && isOpen;

                return (
                  <div
                    key={index}
                    className="flex flex-col w-full "
                    onClick={() => navigate(item.link)}
                  >
                    <div
                      onClick={() =>
                        isOpen && setActiveMenu(isExpanded ? null : index)
                      }
                      className={`flex items-center py-3 w-full gap-4 my-0 transition-all duration-300 cursor-pointer group p-2 rounded-xl 
                  ${isOpen ? (darkMode ? "justify-start hover:bg-[#27272bd4]" : "justify-start hover:bg-slate-50") : "justify-center"}`}
                    >
                      <div
                        className={`shrink-0 ${darkMode ? "text-slate-200 group-hover:text-white" : "text-slate-600 group-hover:text-indigo-600"}`}
                      >
                        {item.icon}
                      </div>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -5 }}
                            className="flex items-center justify-between flex-1 overflow-hidden"
                          >
                            <span
                              className={`whitespace-nowrap font-semibold ${darkMode ? "text-slate-50" : "text-slate-700"} text-sm`}
                            >
                              {item.label}
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              className={`flex flex-col mt-4 ${isOpen ? "gap-1" : "gap-3"} justify-center item-center w-full`}
            >
              {/* Divider / Section Label */}
              <div className="flex items-center h-6 w-full">
                {isOpen ? (
                  <div className="flex items-center gap-3 w-full opacity-60">
                    <hr className="flex-1 border-t border-slate-300" />
                    <span
                      className={`font-bold uppercase text-[10px] ${darkMode ? "text-white" : "text-slate-900"} tracking-widest whitespace-nowrap`}
                    >
                      Recent Projects
                    </span>
                    <hr className="flex-1 border-t border-slate-300" />
                  </div>
                ) : (
                  <hr className="w-full border-slate-200" />
                )}
              </div>

              {/* Projects Items */}
              <div className="flex flex-col gap-1">
                {/* 1. MAP PROJECT ITEMS */}
                <div className="flex flex-col gap-1">
                  <AnimatePresence initial={false}>
                    {filteredItems.map((item) => (
                      <motion.div
                        layout // 1. CRITICAL: Smoothly slides other items into new positions
                        key={item.label} // 2. MUST use a unique ID (not index) for layout to work
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{
                          opacity: 0,
                          scale: 0.9,
                          transition: { duration: 0.15 },
                        }}
                        whileHover={{ x: isOpen ? 5 : 0 }}
                        className={`flex items-center w-full gap-4 cursor-pointer group transition-all duration-300 ${isOpen ? "justify-start px-2 py-1.5 rounded-xl" : "justify-center p-2 py-1 rounded-2xl"} ${darkMode ? "hover:bg-[#27272bd4]" : "hover:bg-slate-50"} `}
                        onClick={() => {}}
                      >
                        <div className="shrink-0 flex items-center justify-center w-6">
                          <ProjectIcon color={item.color} />
                        </div>

                        <AnimatePresence mode="wait">
                          {isOpen && (
                            <motion.span
                              layout // Ensures text stays aligned with the sliding container
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -5 }}
                              className={`whitespace-nowrap text-[13px] font-bold flex-1 
                ${darkMode ? "text-slate-200 group-hover:text-slate-100" : "text-slate-600 group-hover:text-slate-900"}`}
                            >
                              {item.label}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>{" "}
          <div
            className={`flex flex-col gap-3.5 w-full text-nowrap border-t pt-4 mt-auto transition-all duration-300 ${
              isOpen ? "" : "px-0 items-center"
            } ${darkMode ? "border-slate-800/60" : "border-slate-100"}`}
          >
            {/* ITEM 2: User Profile Action Badge */}
            <button
              title={!isOpen ? `${fullName} (${email})` : undefined}
              className={`flex items-center rounded-xl py-1 transition-all duration-200 group text-left outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 ${
                isOpen ? "w-full gap-4" : "w-10 justify-center"
              }`}
            >
              <div
                className={`size-9 rounded-xl shrink-0 flex items-center justify-center uppercase font-bold text-[11px] tracking-wider transition-all duration-200 group-hover:scale-105 ${
                  darkMode
                    ? "bg-emerald-950 text-emerald-400 border border-emerald-800/50"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-100/70"
                }`}
              >
                {getInitials(fullName)}
              </div>

              <AnimatePresence mode="wait">
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -4 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col min-w-0 leading-tight"
                  >
                    <span
                      className={`text-[14px] font-medium tracking-wide truncate ${darkMode ? "text-slate-200" : "text-slate-700"}`}
                    >
                      {fullName || "John Doe"}
                    </span>
                    <span
                      className={`text-[11px] font-normal mt-0.5 truncate ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                    >
                      {email || "johndoe@gmail.com"}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Sidebar;
