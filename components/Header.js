"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

const Header = () => {
  const router = useRouter();
  const [userRole, setUserRole] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const res = await axios.get("/api/auth/user", {
          withCredentials: true,
        });
        setUserRole(res.data.user?.role);
      } catch (err) {
        setUserRole(null);
      }
    };

    fetchUserRole();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout");
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  return (
    <header className="bg-gradient-to-r from-blue-700 to-blue-500 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-white text-3xl hover:opacity-80">
            🎓
          </Link>
          <span className="text-2xl font-bold text-white tracking-wide">
             ScoreMate
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-4">
          {userRole === "examiner" && (
            <>
              <Link
                href="/dashboard"
                className="text-white hover:bg-white hover:text-blue-700 px-4 py-2 rounded transition font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/analitics"
                className="text-white hover:bg-white hover:text-blue-700 px-4 py-2 rounded transition font-medium"
              >
                Analytics
              </Link>
              <Link
                href="/exam"
                className="text-white hover:bg-white hover:text-blue-700 px-4 py-2 rounded transition font-medium"
              >
                Create Exam
              </Link>
              <Link
                href="/pendingResults"
                className="text-white hover:bg-white hover:text-blue-700 px-4 py-2 rounded transition font-medium"
              >
                Pending Results
              </Link>
            </>
          )}
          <button
            onClick={handleLogout}
            className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-4 py-2 rounded transition"
          >
            Logout
          </button>
        </nav>

        {/* Mobile Hamburger */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white focus:outline-none"
          >
            {menuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2 bg-blue-600 text-white">
          {userRole === "examiner" && (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 hover:bg-blue-500 rounded"
              >
                Dashboard
              </Link>
              <Link
                href="/analitics"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 hover:bg-blue-500 rounded"
              >
                Analytics
              </Link>
              <Link
                href="/exam"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 hover:bg-blue-500 rounded"
              >
                Create Exam
              </Link>
              <Link
                href="/pendingResults"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 hover:bg-blue-500 rounded"
              >
                Pending Results
              </Link>
            </>
          )}
          <button
            onClick={() => {
              setMenuOpen(false);
              handleLogout();
            }}
            className="w-full text-left px-4 py-2 bg-white text-blue-600 hover:bg-gray-100 rounded font-semibold"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
