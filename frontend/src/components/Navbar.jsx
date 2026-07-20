import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { LogOut, Paintbrush, Search } from "lucide-react";

const Navbar = ({ searchTerm, setSearchTerm, showSearch = true }) => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
          <Paintbrush className="w-5 h-5" />
        </div>
        <span className="font-extrabold text-slate-800 text-lg tracking-tight">
          Excalidraw <span className="text-indigo-600">Clone</span>
        </span>
      </div>

      {showSearch && (
        <div className="relative max-w-md w-full mx-8 hidden md:block">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search your boards..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-700 text-sm transition-all"
          />
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
          <div className="w-6 h-6 bg-indigo-100 text-indigo-700 font-bold rounded-full flex items-center justify-center text-xs">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <span className="text-sm font-semibold text-slate-700 hidden sm:block">
            {user?.name || "User"}
          </span>
        </div>

        <button
          onClick={logout}
          className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100 cursor-pointer"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
