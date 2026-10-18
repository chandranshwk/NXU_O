/**
 * @file Sidebar.tsx (Snippet 1)
 * @component Sidebar
 * @description The application's left navigation sidebar. It features a responsive,
 * expanding grid width layout that scales dynamically on mouse hover, combining project workspaces,
 * page routers, and global preference quick-links.
 *
 * @architecture
 * - Leverages `framer-motion` to handle sidebar panel expansions between 55px and 240px width frames.
 * - Monitors window router addresses using `useLocation` to compute active site icon overlays.
 * - Collapses itself to 0px width states when deeply nested inside whiteboards (`/document` routes).
 */

import { useEffect, useState } from "react";
import { LuCode, LuNotepadText } from "react-icons/lu";

import { AnimatePresence, motion } from "framer-motion";
import { FiPlus, FiSettings } from "react-icons/fi";
import { RiHomeLine } from "react-icons/ri";
import { useLocation, useNavigate } from "react-router-dom";
import { GrNodes } from "react-icons/gr";

interface SidebarProps {
  /** Shared dark mode setting flag used to switch visual palette layouts */
  darkMode: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ darkMode }) => {
  /** Visibility toggle flag controlling expandable layout widths on mouse interactions */
  const [isOpen, setIsOpen] = useState(false);
  /** Tracks the index pointer identifying which sub-menu branch stands toggled open */
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [, setOpenDialog] = useState<boolean>(false);
  const navigate = useNavigate();

  /** Static parameters grouping the application's root pages and navigation icons */
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
      icon: <LuCode size={22} />,
      label: "Code IDE",
      link: "/ide",
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

  const location = useLocation();
  /** Collapse modifier reporting true if deeply nested inside fullscreen document panels */
  const show = location.pathname.startsWith("/document");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpenDialog(false);
  }, [isOpen]);

  return (
    /* MAIN SHIELD WRAPPER: Collapses panel down to 0px width whenever open documents take focus */
    <div
      className={`xl:block sm:hidden  transition-all duration-300 ease-in-out ${
        show ? "w-0 overflow-hidden mr-0" : "w-auto mr-1"
      }`}
    >
      {/* EXPANDABLE MOTION BOUNDARY LAYOUT CORE */}
      <motion.div
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => {
          setIsOpen(false);
          setActiveMenu(null);
        }}
        animate={{
          width: isOpen ? "240px" : "55px",
        }}
        className={`relative h-[calc(100vh-3rem)] justify-between gap-2 m-2 mt-1 mx-1 flex flex-col rounded-lg transition-colors duration-300 overflow-visible z-50 border-0`}
      >
        {/* ==========================================
            MIDDLE NAVIGATION RAILS BODY: LINK LISTINGS
            ========================================== */}
        <div
          className={`flex-1 overflow-y-auto rounded-lg overflow-x-hidden justify-between flex flex-col p-3 pt-2 custom-scrollbar ${darkMode ? "bg-[#141414] text-white border-[#242425ab]" : "bg-white border-slate-100"}`}
        >
          <div>
            <div className="flex flex-col gap-2 mt-2">
              {/* ROUTER PAGES MAPPING LIST STREAMS */}
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
                      {/* Interactive graphic visual marker link */}
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

            {/* ==========================================
                CATEGORY MATRIX B: RECENT PROJECT WORKSPACES
                ========================================== */}
            <div
              className={`flex flex-col mt-4 ${isOpen ? "gap-1" : "gap-3"} justify-center item-center w-full`}
            >
              {/* Category Partition Segment Line */}
              <div className="flex items-center h-6 w-full">
                {isOpen ? (
                  <div className="flex items-center gap-3 w-full opacity-60">
                    <hr className="flex-1 border-t border-slate-300" />
                    <span
                      className={`font-bold uppercase text-[10px] ${darkMode ? "text-white" : "text-slate-900"} tracking-widest whitespace-nowrap`}
                    >
                      Workspaces
                    </span>
                    <hr className="flex-1 border-t border-slate-300" />
                  </div>
                ) : (
                  <hr className="w-full border-slate-200" />
                )}
              </div>

              <div className="flex flex-col w-full ">
                <div
                  className={`flex items-center py-3 w-full gap-4 my-0 transition-all duration-300 cursor-pointer group p-2 rounded-xl 
                  ${isOpen ? (darkMode ? "justify-start hover:bg-[#27272bd4]" : "justify-start hover:bg-slate-50") : "justify-center"}`}
                >
                  {/* Interactive graphic visual marker link */}
                  <div
                    className={`shrink-0 ${darkMode ? "text-slate-200 group-hover:text-white" : "text-slate-600 group-hover:text-indigo-600"}`}
                  >
                    <FiPlus size={22} />
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
                          Add Workspace
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>{" "}
        </div>
      </motion.div>
    </div>
  );
};

export default Sidebar;
