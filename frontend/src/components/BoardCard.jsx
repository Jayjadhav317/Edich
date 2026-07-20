import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Trash2, Share2, ExternalLink, Clock, User, FileText } from "lucide-react";

const BoardCard = ({ board, onDelete, onShare }) => {
  const { user } = useContext(AuthContext);

  const isOwner = board.owner?._id === user?.id || board.owner === user?.id;

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-lg transition-all rounded-xl p-5 flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base line-clamp-1 group-hover:text-indigo-600 transition-colors">
                {board.title || "Untitled Drawing"}
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <User className="w-3 h-3" />
                {isOwner ? "Owned by me" : `By ${board.owner?.name || "Collaborator"}`}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-1.5 text-xs text-slate-500 mt-4 border-t border-slate-50 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Created
            </span>
            <span className="font-medium text-slate-600">
              {formatDate(board.createdAt)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Updated
            </span>
            <span className="font-medium text-slate-600">
              {formatDate(board.updatedAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-100">
        <Link
          to={`/canvas/${board._id}`}
          className="mr-auto px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Open
        </Link>

        {isOwner && (
          <button
            onClick={() => onShare(board)}
            title="Share with collaborators"
            className="p-1.5 bg-slate-50 hover:bg-sky-50 text-slate-500 hover:text-sky-600 border border-slate-200 hover:border-sky-200 rounded-lg transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
          </button>
        )}

        {isOwner && (
          <button
            onClick={() => onDelete(board._id)}
            title="Delete board"
            className="p-1.5 bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default BoardCard;
