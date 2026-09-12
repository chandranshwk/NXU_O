export type BrushType = "pencil" | "pen" | "marker" | "brush" | "sketch-pen";

export const renderTexturedLine = (
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  width: number,
  alpha: number,
  type: BrushType,
) => {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  ctx.lineJoin = "round";

  switch (type) {
    case "pencil":
      ctx.lineCap = "round";
      ctx.lineWidth = Math.max(1.5, width * 0.5);
      break;

    case "marker":
      ctx.lineCap = "round"; // Rounded caps blend continuously without leaving square dots
      ctx.lineWidth = width * 2.2;
      break;

    case "brush":
      ctx.lineCap = "round";
      ctx.lineWidth = width * 3.5;
      break;

    case "sketch-pen":
      ctx.lineCap = "round";
      ctx.lineWidth = width * 1.4;
      break;

    case "pen":
    default:
      ctx.lineCap = "round";
      ctx.lineWidth = width;
      break;
  }

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  ctx.restore();
};
