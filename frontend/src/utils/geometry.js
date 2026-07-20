// Calculates perpendicular distance from point P(x, y) to line segment AB (x1, y1) -> (x2, y2)
export const distanceToSegment = (x, y, x1, y1, x2, y2) => {
  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  if (lenSq !== 0) param = dot / lenSq;

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = x - xx;
  const dy = y - yy;
  return Math.sqrt(dx * dx + dy * dy);
};

// Calculates if point P(x, y) is inside the ellipse boundary
export const isPointInEllipse = (x, y, ex, ey, width, height) => {
  const cx = ex + width / 2;
  const cy = ey + height / 2;
  const rx = Math.abs(width / 2);
  const ry = Math.abs(height / 2);

  if (rx === 0 || ry === 0) return false;

  const normX = (x - cx) / rx;
  const normY = (y - cy) / ry;

  return normX * normX + normY * normY <= 1.05; // 1.05 for slightly generous margin
};

// Calculates minimum distance from P(x, y) to a path of points (freehand pen drawing)
export const distanceToPath = (x, y, points) => {
  if (points.length === 0) return Infinity;
  if (points.length === 1) {
    const dx = x - points[0].x;
    const dy = y - points[0].y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  let minDistance = Infinity;
  for (let i = 0; i < points.length - 1; i++) {
    const dist = distanceToSegment(x, y, points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
    if (dist < minDistance) {
      minDistance = dist;
    }
  }
  return minDistance;
};
