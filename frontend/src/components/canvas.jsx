import React, { useRef, useEffect, useState } from "react";
import { TOOLS } from "../constants/tools";
import { getElementAtPosition, getResizeHandleAtPosition } from "../utils/hitTest";
import { drawAllElements, drawSelectionBox, clearCanvas } from "../utils/canvasHelpers";

const FONT_SIZE = 20;
const FONT_FAMILY = "Arial";
const FONT_STYLE = `${FONT_SIZE}px ${FONT_FAMILY}`;
const LINE_HEIGHT_MULTIPLIER = 1.25;
const LINE_HEIGHT_PX = FONT_SIZE * LINE_HEIGHT_MULTIPLIER;
const VERTICAL_OFFSET = (LINE_HEIGHT_PX - FONT_SIZE) / 2;

const Canvas = ({ selectedTool, elements, setElements, rawSetElements, broadcastElements }) => {
  const canvasRef = useRef(null);
  const [selectedElement, setSelectedElement] = useState(null);

  const elementsRef = useRef(elements);
  const actionRef = useRef("none");
  const startCoordsRef = useRef({ x: 0, y: 0 });
  const snapshotElementRef = useRef(null);
  const resizeHandleRef = useRef(null);
  const isAddingTextRef = useRef(false);
  const isClickingCanvasRef = useRef(false);

  useEffect(() => {
    elementsRef.current = elements;
  }, [elements]);

  const [text, setText] = useState("");
  const [textBox, setTextBox] = useState(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textBox && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [textBox]);

  const [strokeColor, setStrokeColor] = useState("#1e1e1e");
  const [fillColor, setFillColor] = useState("transparent");
  const [strokeWidth, setStrokeWidth] = useState(2);

  useEffect(() => {
    if (selectedElement) {
      const current = elements.find((el) => el.id === selectedElement.id);
      if (current) {
        setStrokeColor(current.strokeColor || "#1e1e1e");
        setFillColor(current.fillColor || "transparent");
        setStrokeWidth(current.strokeWidth || 2);
      }
    }
  }, [selectedElement, elements]);

  const updateAttribute = (type, value) => {
    if (type === "strokeColor") {
      setStrokeColor(value);
      if (selectedElement) {
        const next = elementsRef.current.map((el) => {
          if (el.id === selectedElement.id) {
            return { ...el, strokeColor: value };
          }
          return el;
        });
        elementsRef.current = next;
        setElements(next);
        if (broadcastElements) broadcastElements(next);
      }
    } else if (type === "fillColor") {
      setFillColor(value);
      if (selectedElement) {
        const next = elementsRef.current.map((el) => {
          if (el.id === selectedElement.id) {
            return { ...el, fillColor: value };
          }
          return el;
        });
        elementsRef.current = next;
        setElements(next);
        if (broadcastElements) broadcastElements(next);
      }
    } else if (type === "strokeWidth") {
      setStrokeWidth(value);
      if (selectedElement) {
        const next = elementsRef.current.map((el) => {
          if (el.id === selectedElement.id) {
            return { ...el, strokeWidth: value };
          }
          return el;
        });
        elementsRef.current = next;
        setElements(next);
        if (broadcastElements) broadcastElements(next);
      }
    }
  };

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

    console.log({
      selectedTool,
      tool,
      RECTANGLE: TOOLS.RECTANGLE,
      LINE: TOOLS.LINE,
      PEN: TOOLS.PEN,
    });

    if (tool !== TOOLS.SELECT) {
      setSelectedElement(null);
    }
    if (tool !== TOOLS.TEXT) {
      if (textBox) {
        addText();
      }
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

  const addText = (newTextBoxAfter = null) => {
    if (isAddingTextRef.current) return;
    isAddingTextRef.current = true;

    try {
      if (!textBox) {
        setText("");
        return;
      }

      if (!text.trim()) {
        setText("");
        setTextBox(newTextBoxAfter);
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
        strokeColor: strokeColor,
        strokeWidth: strokeWidth,
      };

      const nextElements = [...elementsRef.current, textElement];
      elementsRef.current = nextElements;
      setElements(nextElements);
      if (broadcastElements) broadcastElements(nextElements);
      setText("");
      setTextBox(newTextBoxAfter);
    } finally {
      isAddingTextRef.current = false;
    }
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
    isClickingCanvasRef.current = true;
    setTimeout(() => {
      isClickingCanvasRef.current = false;
    }, 0);

    const { x, y } = getMousePosition(e);
    console.log("Canvas handleMouseDown - selectedTool:", selectedTool, "x:", x, "y:", y);

    const tool = Number(selectedTool);

    if (tool === TOOLS.TEXT) {
      e.preventDefault();
    }

    if (textBox && tool === TOOLS.TEXT) {
      addText({ x, y });
      return;
    }

    if (tool === TOOLS.PEN) {
      actionRef.current = "drawing";
      const newElement = {
        id: Date.now().toString(),
        type: "pen",
        points: [{ x, y }],
        strokeColor: strokeColor,
        strokeWidth: strokeWidth,
      };
      const nextElements = [...elementsRef.current, newElement];
      elementsRef.current = nextElements;
      setElements(nextElements);
      if (broadcastElements) broadcastElements(nextElements);
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
        strokeColor: strokeColor,
        strokeWidth: strokeWidth,
      };
      const nextElements = [...elementsRef.current, newElement];
      elementsRef.current = nextElements;
      setElements(nextElements);
      if (broadcastElements) broadcastElements(nextElements);
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
        strokeColor: strokeColor,
        strokeWidth: strokeWidth,
        fillColor: fillColor,
      };
      const nextElements = [...elementsRef.current, newElement];
      elementsRef.current = nextElements;
      setElements(nextElements);
      if (broadcastElements) broadcastElements(nextElements);
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
        strokeColor: strokeColor,
        strokeWidth: strokeWidth,
        fillColor: fillColor,
      };
      const nextElements = [...elementsRef.current, newElement];
      elementsRef.current = nextElements;
      setElements(nextElements);
      if (broadcastElements) broadcastElements(nextElements);
      return;
    }

    if (tool === TOOLS.TEXT) {
      setText("");
      setTextBox({ x, y });
      return;
    }

    if (tool === TOOLS.SELECT) {
      const handle = getResizeHandleAtPosition(x, y, selectedElement);
      if (handle) {
        actionRef.current = "resizing";
        resizeHandleRef.current = handle;
        snapshotElementRef.current = JSON.parse(JSON.stringify(selectedElement));
        startCoordsRef.current = { x, y };
      } else {
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
        if (broadcastElements) broadcastElements(nextElements);
      }
      return;
    }
  };

  const handleMouseMove = (e) => {
    const { x, y } = getMousePosition(e);
    console.log("Current action:", actionRef.current);

    if (actionRef.current === "drawing") {
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
      if (broadcastElements) broadcastElements(updatedElements);
      return;
    }

    if (actionRef.current === "moving" && snapshotElementRef.current) {
      const dx = x - startCoordsRef.current.x;
      const dy = y - startCoordsRef.current.y;

      const updatedElements = elementsRef.current.map((el) => {
        if (el.id !== snapshotElementRef.current.id) return el;

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
      if (broadcastElements) broadcastElements(updatedElements);
      return;
    }

    if (actionRef.current === "resizing" && snapshotElementRef.current) {
      const updatedElements = [...elementsRef.current];
      const index = updatedElements.findIndex((el) => el.id === snapshotElementRef.current.id);
      if (index === -1) return;
      const element = updatedElements[index];

      if (element.type === "line") {
        if (resizeHandleRef.current === "x1y1") {
          updatedElements[index] = {
            ...element,
            x1: x,
            y1: y,
          };
        } else if (resizeHandleRef.current === "x2y2") {
          updatedElements[index] = {
            ...element,
            x2: x,
            y2: y,
          };
        }
      } else {
        const snap = snapshotElementRef.current;
        if (resizeHandleRef.current === "br") {
          updatedElements[index] = {
            ...element,
            width: x - element.x,
            height: y - element.y,
          };
        } else if (resizeHandleRef.current === "tl") {
          updatedElements[index] = {
            ...element,
            x: x,
            y: y,
            width: snap.x + snap.width - x,
            height: snap.y + snap.height - y,
          };
        } else if (resizeHandleRef.current === "tr") {
          updatedElements[index] = {
            ...element,
            y: y,
            width: x - element.x,
            height: snap.y + snap.height - y,
          };
        } else if (resizeHandleRef.current === "bl") {
          updatedElements[index] = {
            ...element,
            x: x,
            width: snap.x + snap.width - x,
            height: y - element.y,
          };
        }
      }

      elementsRef.current = updatedElements;
      rawSetElements(updatedElements);
      if (broadcastElements) broadcastElements(updatedElements);
      return;
    }

    if (actionRef.current === "erasing") {
      const hit = getElementAtPosition(x, y, elementsRef.current);
      if (hit) {
        const nextElements = elementsRef.current.filter((el) => el.id !== hit.id);
        elementsRef.current = nextElements;
        setElements(nextElements);
        if (broadcastElements) broadcastElements(nextElements);
      }
      return;
    }
  };

  const handleMouseUp = () => {
    console.log("Canvas handleMouseUp - action:", actionRef.current, "elements length:", elementsRef.current.length);
    if (actionRef.current === "drawing" || actionRef.current === "moving" || actionRef.current === "resizing") {
      actionRef.current = "none";
      snapshotElementRef.current = null;
      resizeHandleRef.current = null;

      if (selectedElement) {
        const updated = elementsRef.current.find((el) => el.id === selectedElement.id);
        if (updated) {
          setSelectedElement(updated);
        }
      }

      setElements([...elementsRef.current]);
      if (broadcastElements) broadcastElements(elementsRef.current);
    } else if (actionRef.current === "erasing") {
      actionRef.current = "none";
    }
  };

  const dims = getTextAreaDims();

  const strokeColors = [
    { value: "#1e1e1e", label: "Charcoal" },
    { value: "#ff6b6b", label: "Red" },
    { value: "#40c057", label: "Green" },
    { value: "#228be6", label: "Blue" },
    { value: "#fab005", label: "Yellow" },
    { value: "#fd7e14", label: "Orange" }
  ];

  const fillColors = [
    { value: "transparent", label: "Transparent" },
    { value: "#ffc9c9", label: "Light Red" },
    { value: "#b2f2bb", label: "Light Green" },
    { value: "#a5d8ff", label: "Light Blue" },
    { value: "#ffec99", label: "Light Yellow" },
    { value: "#ffd8a8", label: "Light Orange" }
  ];

  const showOptions = [
    TOOLS.PEN,
    TOOLS.TEXT,
    TOOLS.LINE,
    TOOLS.RECTANGLE,
    TOOLS.ELLIPSE,
    TOOLS.SELECT
  ].includes(Number(selectedTool));

  return (
    <div className="relative w-full h-full">
      {showOptions && (
        <div className="absolute top-20 left-6 z-30 pointer-events-auto flex flex-col gap-4 bg-white p-4 rounded-2xl shadow-lg border border-gray-200 w-52 text-left">
          {/* Stroke section */}
          <div>
            <div className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Stroke</div>
            <div className="flex gap-2 flex-wrap">
              {strokeColors.map((c) => (
                <button
                  key={c.value}
                  onClick={() => updateAttribute("strokeColor", c.value)}
                  className={`w-7 h-7 rounded-lg border transition-all cursor-pointer ${
                    strokeColor === c.value
                      ? "ring-2 ring-indigo-500 ring-offset-2 scale-105 border-transparent"
                      : "border-gray-200 hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Background section */}
          {[TOOLS.RECTANGLE, TOOLS.ELLIPSE, TOOLS.SELECT].includes(Number(selectedTool)) && (
            <div>
              <div className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Background</div>
              <div className="flex gap-2 flex-wrap">
                {fillColors.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => updateAttribute("fillColor", c.value)}
                    className={`w-7 h-7 rounded-lg border transition-all flex items-center justify-center cursor-pointer ${
                      fillColor === c.value
                        ? "ring-2 ring-indigo-500 ring-offset-2 scale-105 border-transparent"
                        : "border-gray-200 hover:scale-105"
                    }`}
                    style={{
                      backgroundColor: c.value === "transparent" ? "#ffffff" : c.value,
                      position: "relative",
                      overflow: "hidden"
                    }}
                    title={c.label}
                  >
                    {c.value === "transparent" && (
                      <div className="w-full h-[1.5px] bg-red-500 rotate-45" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stroke Width section */}
          <div>
            <div className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Stroke Width</div>
            <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
              {[
                { value: 2, label: "Thin" },
                { value: 4, label: "Medium" },
                { value: 8, label: "Thick" }
              ].map((w) => (
                <button
                  key={w.value}
                  onClick={() => updateAttribute("strokeWidth", w.value)}
                  className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition-all cursor-pointer ${
                    strokeWidth === w.value
                      ? "bg-white text-[#6965db] shadow-xs"
                      : "text-gray-600 hover:bg-white/50"
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="absolute inset-0 bg-white z-0 cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />

      {textBox && (
        <textarea
          ref={textareaRef}
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              addText();
            }
          }}
          onBlur={() => {
            if (!isClickingCanvasRef.current) {
              addText();
            }
          }}
          style={{
            position: "absolute",
            left: `${textBox.x}px`,
            top: `${textBox.y}px`,
            width: `${dims.width}px`,
            height: `${dims.height}px`,
            zIndex: 20,

            fontFamily: FONT_FAMILY,
            fontSize: `${FONT_SIZE}px`,
            lineHeight: `${LINE_HEIGHT_PX}px`,
            fontWeight: "normal",
            padding: 0,
            margin: 0,
            border: "none",
            outline: "1px dashed #4f46e5",

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
    </div>
  );
};

export default Canvas;