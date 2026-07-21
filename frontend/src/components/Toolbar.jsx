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
  { name: "Select Mode", icon: Ban, type: TOOLS.NONE, hotkey: "1" },
  { name: "Pen Tool", icon: PenIcon, type: TOOLS.PEN, hotkey: "7" },
  { name: "Text Tool", icon: TextCursorIcon, type: TOOLS.TEXT, hotkey: "8" },
  { name: "Line Tool", icon: Slash, type: TOOLS.LINE, hotkey: "6" },
  { name: "Rectangle Tool", icon: RectangleHorizontal, type: TOOLS.RECTANGLE, hotkey: "2" },
  { name: "Ellipse Tool", icon: Circle, type: TOOLS.ELLIPSE, hotkey: "4" },
  { name: "Select Shape", icon: BoxSelect, type: TOOLS.SELECT, hotkey: "9" },
  { name: "Eraser Tool", icon: Eraser, type: TOOLS.ERASER, hotkey: "0" }
];

const Toolbar = ({ selectedTool, setSelectedTool, undo, redo, canUndo, canRedo }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {/* Top Center Main Toolbar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-auto flex items-center bg-white p-1.5 rounded-2xl shadow-lg border border-gray-200/80">
        <ul className="flex gap-1">
          {toolArray.map((tool) => (
            <li
              key={tool.name}
              title={tool.name}
              onClick={() => setSelectedTool(tool.type)}
              className={`relative p-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-center border ${
                selectedTool === tool.type
                  ? "bg-[#6965db] text-white border-[#6965db] shadow-sm"
                  : "bg-white hover:bg-slate-50 text-slate-700 border-transparent"
              }`}
              style={{ width: "42px", height: "42px" }}
            >
              <tool.icon size={20} />
              {tool.hotkey && (
                <span
                  className={`absolute bottom-0.5 right-1 text-[8px] font-semibold leading-none ${
                    selectedTool === tool.type ? "text-purple-200" : "text-slate-400"
                  }`}
                >
                  {tool.hotkey}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom Left Undo/Redo Toolbar */}
      <div className="absolute bottom-6 left-6 pointer-events-auto flex gap-1.5 bg-white p-1.5 rounded-2xl shadow-lg border border-gray-200/80">
        <button
          title="Undo"
          onClick={undo}
          disabled={!canUndo}
          className={`p-2 rounded-xl transition-all flex items-center justify-center border ${
            canUndo
              ? "bg-white hover:bg-slate-50 text-slate-700 border-transparent cursor-pointer"
              : "bg-slate-50 text-slate-300 border-transparent cursor-not-allowed"
          }`}
          style={{ width: "36px", height: "36px" }}
        >
          <Undo2 size={18} />
        </button>
        <button
          title="Redo"
          onClick={redo}
          disabled={!canRedo}
          className={`p-2 rounded-xl transition-all flex items-center justify-center border ${
            canRedo
              ? "bg-white hover:bg-slate-50 text-slate-700 border-transparent cursor-pointer"
              : "bg-slate-50 text-slate-300 border-transparent cursor-not-allowed"
          }`}
          style={{ width: "36px", height: "36px" }}
        >
          <Redo2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
