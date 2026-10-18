/**
 * @file NodeContentFactory.tsx
 * @component NodeContentFactory
 * @description Factory router that maps a node's `type` to its concrete
 * renderer component.
 *
 * @architecture
 * - Receives the raw `MockPageNode` from `CanvasNodeWrapper`.
 * - Routes each known type to its renderer; unknown types fall through to a
 *   visible error boundary so silent blanks don't ship to production.
 */

import React from "react";
import TextNode from "../Helper/Text-Node/TextNode";
import type { MockPageNode } from "../assets/SAMPLE";

interface NodeContentFactoryProps {
  /** Raw node payload from the page's `nodes` array. */
  node: MockPageNode;
}

export const NodeContentFactory: React.FC<NodeContentFactoryProps> = ({
  node,
}) => {
  switch (node.type) {
    case "text":
      return <TextNode content={node.content} nodeId={node.id} />;

    case "map":
      // MAP_BLOCK: swap this placeholder once the map component ships.
      return (
        <div className="py-2 text-xs font-mono opacity-60">
          Map view — coming soon
        </div>
      );

    default: {
      return (
        <div className="text-xs text-red-500">
          Unrecognized node type: {String(node.type)}
        </div>
      );
    }
  }
};
