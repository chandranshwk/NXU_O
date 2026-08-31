/**
 * @file NodeContentFactory.tsx
 * @component NodeContentFactory
 * @description A dynamic component router that acts as a Factory pattern. It reads
 * the node type attribute from your canvas state configuration and returns the corresponding
 * functional block component.
 *
 * @architecture
 * - Receives configuration payload bundles from `src/contexts/CanvasNodeWrapper`.
 * - Maps the text block stream data straight into the verified `<TextNode />` system.
 * - Serves as your expansion routing springboard where you can plug in upcoming modules
 *   like the Calendar Node or Todo Block trackers.
 */

import React from "react";
import type { CanvasNodeData } from "../contexts/CanvasNodeWrapper";
import TextNode from "../Helper/TextNode";
import CalenderNode from "../Helper/CalenderNode";

interface NodeContentFactoryProps {
  /** Core configuration payload object defining the active block type, id, and content string */
  node: CanvasNodeData;
}

export const NodeContentFactory: React.FC<NodeContentFactoryProps> = ({
  node,
}) => {
  // Evaluates string parameters to route elements down to the matching structural layouts
  switch (node.type) {
    case "text":
      return <TextNode content={node.content} nodeId={node.id} />;

    case "calendar":
      return <CalenderNode />;

    case "todo":
      /* TODO_BLOCK PLUG-IN ROUTE MARKER: Swap this placeholder out once your list board file is built */
      return (
        <div className="py-2 text-xs font-mono opacity-60">
          [Clean List Task Tracker Tracker Component Viewport]
        </div>
      );

    default:
      /* FALLBACK SAFETY BOUNDARY CHASSIS: Catches unrecognized layout exceptions gracefully */
      return (
        <div className="text-xs text-red-500">
          Unrecognized structural element node data signature
        </div>
      );
  }
};
