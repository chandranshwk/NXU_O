const MODULES = ["TEXT_O", "ECHO_O", "FLOW_O", "AXIS_O", "SYSTEM"];
const LEVELS = ["INFO", "USER", "SYNC", "WARN"];
const ACTIONS = {
  TEXT_O: [
    "Document_Saved",
    "PDF_Export_Started",
    "Metadata_Updated",
    "Draft_Created",
  ],
  ECHO_O: ["Message_Sent", "Channel_Joined", "File_Shared", "Presence_Updated"],
  FLOW_O: [
    "Task_Completed",
    "Sprint_Initialized",
    "Priority_Changed",
    "Backlog_Updated",
  ],
  AXIS_O: [
    "Canvas_AutoSaved",
    "Layer_Merged",
    "Asset_Imported",
    "Grid_Aligned",
  ],
  SYSTEM: [
    "Lazy_Sync_Push",
    "IndexedDB_Handshake",
    "Cache_Invalidated",
    "Mesh_Reconnected",
  ],
};

/**
 * Generates a realistic log object for the terminal
 */
export const generateFakeLog = () => {
  const module = MODULES[Math.floor(Math.random() * MODULES.length)];
  const actionList = ACTIONS[module as keyof typeof ACTIONS];
  const action = actionList[Math.floor(Math.random() * actionList.length)];

  return {
    timestamp: new Date().toLocaleTimeString("en-GB"),
    module,
    action: `${module}_${action}`,
    level: LEVELS[Math.floor(Math.random() * LEVELS.length)],
  };
};
