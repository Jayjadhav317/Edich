import { drawElement } from "./drawElement";

// Clears the canvas
export const clearCanvas = (canvas, ctx) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

// Redraws all retained elements
export const drawAllElements = (ctx, elements) => {
  elements.forEach((element) => {
    drawElement(ctx, element);
  });
};

// Draws a dashed selection border around the currently selected element
export const drawSelectionBox = (ctx, element) => {
  if (!element) return;

  let x, y, width, height;

  if (element.type === "line") {
    x = Math.min(element.x1, element.x2);
    y = Math.min(element.y1, element.y2);
    width = Math.abs(element.x2 - element.x1);
    height = Math.abs(element.y2 - element.y1);
  } else if (element.type === "pen") {
    if (!element.points || element.points.length === 0) return;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    element.points.forEach((p) => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });
    x = minX;
    y = minY;
    width = maxX - minX;
    height = maxY - minY;
  } else {
    // rectangle, ellipse, text
    x = Math.min(element.x, element.x + element.width);
    y = Math.min(element.y, element.y + element.height);
    width = Math.abs(element.width);
    height = Math.abs(element.height);
  }

  const padding = 8;

  ctx.save();
  ctx.strokeStyle = "#4f46e5"; // Indigo selection color
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]); // Dashed line
  ctx.beginPath();
  ctx.rect(x - padding, y - padding, width + padding * 2, height + padding * 2);
  ctx.stroke();

  // Draw square corner handles
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#4f46e5";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([]); // Reset to solid lines for handles

  const handleSize = 6;
  const handles = [
    { x: x - padding, y: y - padding }, // Top-Left
    { x: x + width + padding, y: y - padding }, // Top-Right
    { x: x - padding, y: y + height + padding }, // Bottom-Left
    { x: x + width + padding, y: y + height + padding }, // Bottom-Right
  ];

  handles.forEach((handle) => {
    ctx.beginPath();
    ctx.rect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
    ctx.fill();
    ctx.stroke();
  });

  ctx.restore();
};
