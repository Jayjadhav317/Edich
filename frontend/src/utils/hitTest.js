import { distanceToSegment, isPointInEllipse, distanceToPath } from "./geometry";

// Checks if coordinates (x, y) intersect/hit the element
export const isHit = (x, y, element) => {
  const { type, strokeWidth = 2 } = element;
  const threshold = strokeWidth + 6; // Click padding threshold

  switch (type) {
    case "pen": {
      const dist = distanceToPath(x, y, element.points);
      return dist <= threshold;
    }
    case "line": {
      const dist = distanceToSegment(x, y, element.x1, element.y1, element.x2, element.y2);
      return dist <= threshold;
    }
    case "rectangle": {
      const minX = Math.min(element.x, element.x + element.width);
      const maxX = Math.max(element.x, element.x + element.width);
      const minY = Math.min(element.y, element.y + element.height);
      const maxY = Math.max(element.y, element.y + element.height);

      // Border bounds checks (close to edges)
      const nearLeft = Math.abs(x - minX) <= threshold && y >= minY - threshold && y <= maxY + threshold;
      const nearRight = Math.abs(x - maxX) <= threshold && y >= minY - threshold && y <= maxY + threshold;
      const nearTop = Math.abs(y - minY) <= threshold && x >= minX - threshold && x <= maxX + threshold;
      const nearBottom = Math.abs(y - maxY) <= threshold && x >= minX - threshold && x <= maxX + threshold;

      // Inside check
      const isInside = x >= minX && x <= maxX && y >= minY && y <= maxY;

      return nearLeft || nearRight || nearTop || nearBottom || isInside;
    }
    case "ellipse": {
      return isPointInEllipse(x, y, element.x, element.y, element.width, element.height);
    }
    case "text": {
      const minX = element.x;
      const maxX = element.x + element.width;
      const minY = element.y;
      const maxY = element.y + element.height;

      return x >= minX && x <= maxX && y >= minY && y <= maxY;
    }
    default:
      return false;
  }
};

// Gets the top-most element at the clicked position (top to bottom)
export const getElementAtPosition = (x, y, elements) => {
  for (let i = elements.length - 1; i >= 0; i--) {
    const element = elements[i];
    if (isHit(x, y, element)) {
      return element;
    }
  }
  return null;
};

// Checks if coordinates (x, y) hit a resize handle of the selected element
export const getResizeHandleAtPosition = (x, y, element) => {
  if (!element) return null;

  const handleSize = 6;
  const padding = 8;

  if (element.type === "line") {
    // Treat the two endpoints as handles
    if (Math.abs(x - element.x1) <= handleSize + 4 && Math.abs(y - element.y1) <= handleSize + 4) {
      return "x1y1";
    }
    if (Math.abs(x - element.x2) <= handleSize + 4 && Math.abs(y - element.y2) <= handleSize + 4) {
      return "x2y2";
    }
    return null;
  }

  if (element.type === "pen") {
    // Pencil strokes/pen paths do not support standard corner handle resizing
    return null;
  }

  // Rectangle, Ellipse, Text
  const minX = Math.min(element.x, element.x + element.width);
  const maxX = Math.max(element.x, element.x + element.width);
  const minY = Math.min(element.y, element.y + element.height);
  const maxY = Math.max(element.y, element.y + element.height);

  const handles = {
    tl: { x: minX - padding, y: minY - padding },
    tr: { x: maxX + padding, y: minY - padding },
    bl: { x: minX - padding, y: maxY + padding },
    br: { x: maxX + padding, y: maxY + padding },
  };

  for (const [name, pos] of Object.entries(handles)) {
    if (Math.abs(x - pos.x) <= handleSize + 4 && Math.abs(y - pos.y) <= handleSize + 4) {
      return name;
    }
  }

  return null;
};

