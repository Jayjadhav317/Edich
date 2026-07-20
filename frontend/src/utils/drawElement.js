export const drawElement = (ctx, element) => {
  console.log("drawElement: rendering element of type:", element.type, element);
  ctx.save();
  ctx.strokeStyle = element.strokeColor || "black";
  ctx.lineWidth = element.strokeWidth || 2;
  ctx.fillStyle = element.fillColor || "transparent";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  switch (element.type) {
    case "pen":
      if (element.points && element.points.length > 0) {
        ctx.beginPath();
        ctx.moveTo(element.points[0].x, element.points[0].y);
        for (let i = 1; i < element.points.length; i++) {
          ctx.lineTo(element.points[i].x, element.points[i].y);
        }
        ctx.stroke();
      }
      break;

    case "line":
      ctx.beginPath();
      ctx.moveTo(element.x1, element.y1);
      ctx.lineTo(element.x2, element.y2);
      ctx.stroke();
      break;

    case "rectangle":
      ctx.beginPath();
      ctx.rect(element.x, element.y, element.width, element.height);
      ctx.stroke();
      if (element.fillColor && element.fillColor !== "transparent") {
        ctx.fill();
      }
      break;

    case "ellipse": {
      ctx.beginPath();
      const cx = element.x + element.width / 2;
      const cy = element.y + element.height / 2;
      const rx = Math.abs(element.width / 2);
      const ry = Math.abs(element.height / 2);
      ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
      ctx.stroke();
      if (element.fillColor && element.fillColor !== "transparent") {
        ctx.fill();
      }
      break;
    }

    case "text": {
      const fontSize = element.fontSize || 20;
      const fontFamily = element.fontFamily || "Arial";
      const lineHeightPx = element.lineHeight || (fontSize * 1.25);
      const verticalOffset = (lineHeightPx - fontSize) / 2;

      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.fillStyle = element.strokeColor || "black";
      ctx.textBaseline = "top";
      ctx.textAlign = "left";

      const lines = element.text.split("\n");
      lines.forEach((line, index) => {
        const lineY = element.y + index * lineHeightPx + verticalOffset;
        ctx.fillText(line, element.x, lineY);
      });
      break;
    }

    default:
      break;
  }

  ctx.restore();
};
