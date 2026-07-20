import React, { useState } from "react";
import { X, Mail, Send, Loader2 } from "lucide-react";
import { boardService } from "../services/boardService";

const ShareModal = ({ board, onClose }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      await boardService.shareBoard(board._id, email);
      setMessage({
        text: `Successfully shared board with ${email}!`,
        type: "success",
      });
      setEmail("");
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Failed to share board.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Share Board</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Invite collaborators to view or edit "{board.title}"
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {message.text && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm font-medium border ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                  : "bg-rose-50 text-rose-800 border-rose-100"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Collaborator's Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800 text-sm transition-all"
                />
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Invite Collaborator
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
