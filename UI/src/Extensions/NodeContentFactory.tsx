import React from "react";
import type { CanvasNodeData } from "../contexts/CanvasNodeWrapper";
import TextNode from "../Helper/TextNode";

interface NodeContentFactoryProps {
  node: CanvasNodeData;
}

export const NodeContentFactory: React.FC<NodeContentFactoryProps> = ({
  node,
}) => {
  switch (node.type) {
    case "text":
      return <TextNode content={node.content} nodeId={node.id} />;

    case "calendar":
      return (
        <div className="py-2 text-xs font-mono opacity-60">
          [Local Desktop Calendar Matrix Component Viewport]
        </div>
      );

    case "todo":
      return (
        <div className="py-2 text-xs font-mono opacity-60">
          [Clean List Task Tracker Tracker Component Viewport]
        </div>
      );

    default:
      return (
        <div className="text-xs text-red-500">
          Unrecognized structural element node data signature
        </div>
      );
  }
};
