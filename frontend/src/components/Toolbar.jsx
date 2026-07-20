import React from "react";
import {
  Ban,
  PenIcon,
  TextCursorIcon,
  Slash,
  RectangleHorizontal,
  Circle,
  BoxSelect,
  Eraser,
  Undo2,
  Redo2
} from "lucide-react";
import { TOOLS } from "../constants/tools";

const toolArray = [
  { name: "Select Mode", icon: Ban, type: TOOLS.NONE },
  { name: "Pen Tool", icon: PenIcon, type: TOOLS.PEN },
  { name: "Text Tool", icon: TextCursorIcon, type: TOOLS.TEXT },
  { name: "Line Tool", icon: Slash, type: TOOLS.LINE },
  { name: "Rectangle Tool", icon: RectangleHorizontal, type: TOOLS.RECTANGLE },
  { name: "Ellipse Tool", icon: Circle, type: TOOLS.ELLIPSE },
  { name: "Select Shape", icon: BoxSelect, type: TOOLS.SELECT },
  { name: "Eraser Tool", icon: Eraser, type: TOOLS.ERASER }
];

const Toolbar = ({ selectedTool, setSelectedTool, undo, redo, canUndo, canRedo }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      <div className="absolute top-20 left-6 pointer-events-auto flex gap-4 bg-white p-2 rounded shadow border border-gray-200">
        {/* Draw Tools */}
        <ul className="flex gap-2 border-r border-gray-200 pr-4">
          {toolArray.map((tool) => (
            <li
              key={tool.name}
              title={tool.name}
              onClick={() => setSelectedTool(tool.type)}
              className={`p-2 rounded cursor-pointer border transition-colors ${
                selectedTool === tool.type
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
              }`}
            >
              <tool.icon size={20} />
            </li>
          ))}
        </ul>

        {/* History Tools */}
        <div className="flex gap-2">
          <button
            title="Undo"
            onClick={undo}
            disabled={!canUndo}
            className={`p-2 rounded border transition-colors ${
              canUndo
                ? "bg-white hover:bg-gray-50 text-gray-700 border-gray-200 cursor-pointer"
                : "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
            }`}
          >
            <Undo2 size={20} />
          </button>
          <button
            title="Redo"
            onClick={redo}
            disabled={!canRedo}
            className={`p-2 rounded border transition-colors ${
              canRedo
                ? "bg-white hover:bg-gray-50 text-gray-700 border-gray-200 cursor-pointer"
                : "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
            }`}
          >
            <Redo2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
