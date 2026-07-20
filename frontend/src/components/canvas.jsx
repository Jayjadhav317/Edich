import React, { useRef, useEffect, useState } from "react";
import { TOOLS } from "../constants/tools";
import { getElementAtPosition } from "../utils/hitTest";
import { drawAllElements, drawSelectionBox, clearCanvas } from "../utils/canvasHelpers";

const FONT_SIZE = 20;
const FONT_FAMILY = "Arial";
const FONT_STYLE = `${FONT_SIZE}px ${FONT_FAMILY}`;
const LINE_HEIGHT_MULTIPLIER = 1.25;
const LINE_HEIGHT_PX = FONT_SIZE * LINE_HEIGHT_MULTIPLIER;
const VERTICAL_OFFSET = (LINE_HEIGHT_PX - FONT_SIZE) / 2;

const Canvas = ({ selectedTool, elements, setElements, rawSetElements }) => {
  const canvasRef = useRef(null);
  const [selectedElement, setSelectedElement] = useState(null);
  
  const elementsRef = useRef(elements);
  const actionRef = useRef("none");
  const startCoordsRef = useRef({ x: 0, y: 0 });
  const snapshotElementRef = useRef(null);

  useEffect(() => {
    elementsRef.current = elements;
  }, [elements]);

  const [text, setText] = useState("");
  const [textBox, setTextBox] = useState(null);

  const [canvasSize, setCanvasSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setCanvasSize((prev) => {
        if (prev.width === window.innerWidth && prev.height === window.innerHeight) {
          return prev;
        }
        return {
          width: window.innerWidth,
          height: window.innerHeight,
        };
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasSize.width * dpr;
    canvas.height = canvasSize.height * dpr;
    canvas.style.width = `${canvasSize.width}px`;
    canvas.style.height = `${canvasSize.height}px`;

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
  }, [canvasSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    clearCanvas(canvas, ctx);
    drawAllElements(ctx, elements);

    if (Number(selectedTool) === TOOLS.SELECT && selectedElement) {
      const currentElement = elements.find((el) => el.id === selectedElement.id);
      if (currentElement) {
        drawSelectionBox(ctx, currentElement);
      }
    }
  }, [elements, selectedElement, selectedTool, canvasSize]);

  useEffect(() => {
    const tool = Number(selectedTool);
    if (tool !== TOOLS.SELECT) {
      setSelectedElement(null);
    }
    if (tool !== TOOLS.TEXT) {
      setTextBox(null);
      setText("");
    }
  }, [selectedTool]);

  const getMousePosition = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const addText = () => {
    if (!text.trim()) {
      setText("");
      setTextBox(null);
      return;
    }

    const dims = getTextAreaDims();
    const textElement = {
      id: Date.now().toString(),
      type: "text",
      x: textBox.x,
      y: textBox.y,
      text: text,
      fontSize: FONT_SIZE,
      fontFamily: FONT_FAMILY,
      lineHeight: LINE_HEIGHT_PX,
      width: dims.width,
      height: dims.height,
      strokeColor: "black",
      strokeWidth: 2,
    };

    const nextElements = [...elementsRef.current, textElement];
    elementsRef.current = nextElements;
    setElements(nextElements);
    setText("");
    setTextBox(null);
  };

  const getTextAreaDims = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return { width: 30, height: LINE_HEIGHT_PX };
    }
    const ctx = canvas.getContext("2d");
    const prevFont = ctx.font;
    ctx.font = FONT_STYLE;

    const lines = text.split("\n");
    let maxW = 0;
    lines.forEach((line) => {
      const metrics = ctx.measureText(line || " ");
      if (metrics.width > maxW) {
        maxW = metrics.width;
      }
    });
    ctx.font = prevFont;

    const width = maxW + 24;
    const height = Math.max(lines.length * LINE_HEIGHT_PX, LINE_HEIGHT_PX);
    return { width, height };
  };

  const handleMouseDown = (e) => {
    const { x, y } = getMousePosition(e);
    console.log("Canvas handleMouseDown - selectedTool:", selectedTool, "x:", x, "y:", y);

    const tool = Number(selectedTool);

    if (textBox && tool === TOOLS.TEXT) {
      addText();
      return;
    }

    if (tool === TOOLS.PEN) {
      actionRef.current = "drawing";
      const newElement = {
        id: Date.now().toString(),
        type: "pen",
        points: [{ x, y }],
        strokeColor: "black",
        strokeWidth: 2,
      };
      const nextElements = [...elementsRef.current, newElement];
      elementsRef.current = nextElements;
      setElements(nextElements);
      return;
    }

    if (tool === TOOLS.LINE) {
      actionRef.current = "drawing";
      startCoordsRef.current = { x, y };
      const newElement = {
        id: Date.now().toString(),
        type: "line",
        x1: x,
        y1: y,
        x2: x,
        y2: y,
        strokeColor: "black",
        strokeWidth: 2,
      };
      const nextElements = [...elementsRef.current, newElement];
      elementsRef.current = nextElements;
      setElements(nextElements);
      return;
    }

    if (tool === TOOLS.RECTANGLE) {
      actionRef.current = "drawing";
      startCoordsRef.current = { x, y };
      const newElement = {
        id: Date.now().toString(),
        type: "rectangle",
        x,
        y,
        width: 0,
        height: 0,
        strokeColor: "black",
        strokeWidth: 2,
      };
      const nextElements = [...elementsRef.current, newElement];
      elementsRef.current = nextElements;
      setElements(nextElements);
      return;
    }

    if (tool === TOOLS.ELLIPSE) {
      actionRef.current = "drawing";
      startCoordsRef.current = { x, y };
      const newElement = {
        id: Date.now().toString(),
        type: "ellipse",
        x,
        y,
        width: 0,
        height: 0,
        strokeColor: "black",
        strokeWidth: 2,
      };
      const nextElements = [...elementsRef.current, newElement];
      elementsRef.current = nextElements;
      setElements(nextElements);
      return;
    }

    if (tool === TOOLS.TEXT) {
      setText("");
      setTextBox({ x, y });
      return;
    }

    if (tool === TOOLS.SELECT) {
      const clickedElement = getElementAtPosition(x, y, elementsRef.current);
      if (clickedElement) {
        setSelectedElement(clickedElement);
        snapshotElementRef.current = JSON.parse(JSON.stringify(clickedElement));
        startCoordsRef.current = { x, y };
        actionRef.current = "moving";
      } else {
        setSelectedElement(null);
        actionRef.current = "none";
      }
      return;
    }

    if (tool === TOOLS.ERASER) {
      actionRef.current = "erasing";
      const hit = getElementAtPosition(x, y, elementsRef.current);
      if (hit) {
        const nextElements = elementsRef.current.filter((el) => el.id !== hit.id);
        elementsRef.current = nextElements;
        setElements(nextElements);
      }
      return;
    }
  };

  const handleMouseMove = (e) => {
    const { x, y } = getMousePosition(e);

    if (actionRef.current === "drawing") {
      console.log("Canvas handleMouseMove - action is drawing, elements length:", elementsRef.current.length);
      const updatedElements = [...elementsRef.current];
      const index = updatedElements.length - 1;
      const element = updatedElements[index];
      if (!element) return;

      switch (element.type) {
        case "pen":
          updatedElements[index] = {
            ...element,
            points: [...element.points, { x, y }],
          };
          break;
        case "line":
          updatedElements[index] = {
            ...element,
            x2: x,
            y2: y,
          };
          break;
        case "rectangle":
        case "ellipse":
          updatedElements[index] = {
            ...element,
            x: Math.min(startCoordsRef.current.x, x),
            y: Math.min(startCoordsRef.current.y, y),
            width: Math.abs(x - startCoordsRef.current.x),
            height: Math.abs(y - startCoordsRef.current.y),
          };
          break;
        default:
          break;
      }

      elementsRef.current = updatedElements;
      rawSetElements(updatedElements);
      return;
    }

    if (actionRef.current === "moving" && selectedElement && snapshotElementRef.current) {
      const dx = x - startCoordsRef.current.x;
      const dy = y - startCoordsRef.current.y;

      const updatedElements = elementsRef.current.map((el) => {
        if (el.id !== selectedElement.id) return el;

        if (el.type === "line") {
          return {
            ...el,
            x1: snapshotElementRef.current.x1 + dx,
            y1: snapshotElementRef.current.y1 + dy,
            x2: snapshotElementRef.current.x2 + dx,
            y2: snapshotElementRef.current.y2 + dy,
          };
        } else if (el.type === "pen") {
          return {
            ...el,
            points: snapshotElementRef.current.points.map((p) => ({
              x: p.x + dx,
              y: p.y + dy,
            })),
          };
        } else {
          return {
            ...el,
            x: snapshotElementRef.current.x + dx,
            y: snapshotElementRef.current.y + dy,
          };
        }
      });

      elementsRef.current = updatedElements;
      rawSetElements(updatedElements);
      return;
    }

    if (actionRef.current === "erasing") {
      const hit = getElementAtPosition(x, y, elementsRef.current);
      if (hit) {
        const nextElements = elementsRef.current.filter((el) => el.id !== hit.id);
        elementsRef.current = nextElements;
        setElements(nextElements);
      }
      return;
    }
  };

  const handleMouseUp = () => {
    console.log("Canvas handleMouseUp - action:", actionRef.current, "elements length:", elementsRef.current.length);
    if (actionRef.current === "drawing" || actionRef.current === "moving") {
      actionRef.current = "none";
      snapshotElementRef.current = null;
      setElements([...elementsRef.current]);
    } else if (actionRef.current === "erasing") {
      actionRef.current = "none";
    }
  };

  const dims = getTextAreaDims();

  return (
    <div className="relative w-full h-full">
      {textBox && (
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              addText();
            }
          }}
          onBlur={addText}
          style={{
            position: "absolute",
            left: textBox.x,
            top: textBox.y,
            width: `${dims.width}px`,
            height: `${dims.height}px`,
            zIndex: 20,

            fontFamily: FONT_FAMILY,
            fontSize: `${FONT_SIZE}px`,
            lineHeight: `${LINE_HEIGHT_PX}px`,
            fontWeight: "normal",
            padding: 0,
            margin: 0,
            border: 0,
            outline: 0,

            resize: "none",
            overflow: "hidden",
            background: "transparent",
            color: "black",
            whiteSpace: "pre",
            display: "block",
            boxSizing: "border-box",
          }}
        />
      )}

      <canvas
        ref={canvasRef}
        className="absolute inset-0 bg-white z-0 cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
};

export default Canvas;