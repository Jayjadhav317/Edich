import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { boardService } from "../services/boardService";
import Navbar from "../components/Navbar";
import BoardCard from "../components/BoardCard";
import ShareModal from "../components/ShareModal";
import { Plus, Search, Loader2, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [boards, setBoards] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [sharingBoard, setSharingBoard] = useState(null);

  const fetchBoards = async () => {
    setLoading(true);
    try {
      const data = await boardService.getBoards();
      setBoards(data);
    } catch (err) {
      console.error("Error fetching boards:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const handleCreateBoard = async () => {
    setCreating(true);
    try {
      const title = `Drawing - ${new Date().toLocaleDateString()}`;
      const response = await boardService.createBoard(title);
      // Backend returns { message, drawing }
      const newBoard = response.drawing;
      navigate(`/canvas/${newBoard._id}`);
    } catch (err) {
      console.error("Error creating board:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteBoard = async (id) => {
    if (!window.confirm("Are you sure you want to delete this drawing?")) return;
    try {
      await boardService.deleteBoard(id);
      setBoards(boards.filter((b) => b._id !== id));
    } catch (err) {
      console.error("Error deleting board:", err);
    }
  };

  // Filter boards by title
  const filteredBoards = boards.filter((board) =>
    (board.title || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Recent boards (sorted by last updated, up to 4 items)
  const recentBoards = [...boards]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Dashboard Header / Action */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
              Whiteboards
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Create, manage, and share your vector canvas drawings.
            </p>
          </div>

          <button
            onClick={handleCreateBoard}
            disabled={creating}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl shadow-lg shadow-indigo-150 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {creating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
            New Canvas
          </button>
        </div>

        {/* Search Bar on mobile screens */}
        <div className="relative mb-6 block md:hidden">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search your boards..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 text-sm"
          />
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
            <p className="text-sm font-semibold">Loading boards...</p>
          </div>
        ) : boards.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-xs flex flex-col items-center justify-center max-w-lg mx-auto">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-4">
              <Plus className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-1">Create your first board</h3>
            <p className="text-slate-500 text-sm mb-6">
              Start sketching, drawing, and organizing your thoughts. Invite collaborators to draw together.
            </p>
            <button
              onClick={handleCreateBoard}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              Get Started
            </button>
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in duration-200">
            {/* Recent Boards Section (only show when not searching) */}
            {!searchTerm && recentBoards.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-slate-700 uppercase tracking-wider mb-4">
                  Recent Boards
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {recentBoards.map((board) => (
                    <BoardCard
                      key={`recent-${board._id}`}
                      board={board}
                      onDelete={handleDeleteBoard}
                      onShare={setSharingBoard}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Boards Section */}
            <div>
              <h2 className="text-lg font-bold text-slate-700 uppercase tracking-wider mb-4">
                {searchTerm ? `Search Results (${filteredBoards.length})` : "My Boards"}
              </h2>
              {filteredBoards.length === 0 ? (
                <div className="text-center py-10 bg-white border border-slate-100 rounded-2xl text-slate-400">
                  No matching boards found.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredBoards.map((board) => (
                    <BoardCard
                      key={`all-${board._id}`}
                      board={board}
                      onDelete={handleDeleteBoard}
                      onShare={setSharingBoard}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {sharingBoard && (
        <ShareModal board={sharingBoard} onClose={() => setSharingBoard(null)} />
      )}
    </div>
  );
};

export default Dashboard;
