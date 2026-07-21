import React, { useState, useEffect, useRef, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { boardService } from "../services/boardService";
import { useCanvas } from "../hooks/useCanvas";
import Canvas from "../components/Canvas";
import Toolbar from "../components/Toolbar";
import ShareModal from "../components/ShareModal";
import { AuthContext } from "../context/AuthContext";
import { ArrowLeft, Save, Share2, Loader2, Check, AlertCircle } from "lucide-react";
import { io } from "socket.io-client";

const CanvasPage = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const {
    elements,
    setElements,
    rawSetElements,
    initializeElements,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useCanvas();

  const [selectedTool, setSelectedTool] = useState(0);
  const [board, setBoard] = useState(null);
  const [title, setTitle] = useState("Untitled Drawing");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("saved");
  const [showShare, setShowShare] = useState(false);

  const initialLoadRef = useRef(true);
  const socketRef = useRef(null);

  useEffect(() => {
    const fetchBoardDetails = async () => {
      try {
        const data = await boardService.getBoardById(boardId);
        setBoard(data);
        setTitle(data.title || "Untitled Drawing");
        initializeElements(data.elements || []);
      } catch (err) {
        console.error("Error loading board:", err);
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchBoardDetails();

    // Establish Socket.IO real-time connection
    const socket = io("http://localhost:3000");
    socketRef.current = socket;
    socket.emit("join-room", boardId);

    // Receive drawing events in real-time
    socket.on("canvas-update", (updatedElements) => {
      rawSetElements(updatedElements);
    });

    return () => {
      socket.disconnect();
    };
  }, [boardId]);

  // Track edits to flag unsaved changes
  useEffect(() => {
    if (loading) return;
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }
    setSaveStatus("modified");
  }, [elements, title]);

  const broadcastElements = (updatedElements) => {
    if (socketRef.current) {
      socketRef.current.emit("canvas-update", { boardId, elements: updatedElements });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus("saving");
    try {
      await boardService.updateBoard(boardId, title, elements);
      setSaveStatus("saved");
    } catch (err) {
      console.error("Error saving board:", err);
      setSaveStatus("modified");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading drawing canvas...</p>
      </div>
    );
  }

  const isOwner = board?.owner?._id === user?.id || board?.owner === user?.id;

  return (
    <div className="relative h-screen overflow-hidden flex flex-col">
      {/* Top Navbar */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-40 relative">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-semibold hidden sm:inline">Dashboard</span>
          </button>

          <div className="h-5 w-px bg-slate-200" />

          {/* Editable Title Input */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={!isOwner}
            className="text-base font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none px-1 py-0.5 max-w-[200px] sm:max-w-xs transition-all"
            title="Click to edit board title"
          />

          {/* Save status badge */}
          <div className="flex items-center gap-1.5 ml-2">
            {saveStatus === "saved" && (
              <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-500" /> Cloud Saved
              </span>
            )}
            {saveStatus === "saving" && (
              <span className="text-xs text-indigo-500 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100 flex items-center gap-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
              </span>
            )}
            {saveStatus === "modified" && (
              <span className="text-xs text-amber-500 bg-amber-50 px-2 py-1 rounded-md border border-amber-100 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Unsaved changes
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOwner && (
            <button
              onClick={() => setShowShare(true)}
              className="px-4 py-2 hover:bg-slate-100 text-slate-600 font-semibold text-sm rounded-lg flex items-center gap-1.5 border border-slate-200 transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-sm rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save
          </button>
        </div>
      </header>

      <div className="relative flex-1 bg-slate-50 overflow-hidden">
        <div id="parentDomID" className="absolute inset-0 z-0"></div>

        <Canvas
          selectedTool={selectedTool}
          elements={elements}
          setElements={setElements}
          rawSetElements={rawSetElements}
          broadcastElements={broadcastElements}
        />

        {/* Overlay drawing tools Toolbar */}
        <Toolbar
          selectedTool={selectedTool}
          setSelectedTool={setSelectedTool}
          undo={undo}
          redo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
        />

        {/* Absolute Right Sidebar */}
        <div className="absolute top-20 right-6 z-30 pointer-events-auto flex flex-col gap-2">
          <button
            onClick={handleSave}
            title="Save elements to cloud"
            className="p-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl shadow-md flex items-center justify-center transition-colors cursor-pointer"
          >
            <Save className="w-5 h-5" />
          </button>
          {isOwner && (
            <button
              onClick={() => setShowShare(true)}
              title="Share workspace"
              className="p-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl shadow-md flex items-center justify-center transition-colors cursor-pointer"
            >
              <Share2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {showShare && board && (
        <ShareModal board={board} onClose={() => setShowShare(false)} />
      )}
    </div>
  );
};

export default CanvasPage;
