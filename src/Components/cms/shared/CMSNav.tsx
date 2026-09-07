// src/Components/cms/shared/CMSNav.tsx
import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/cms/content", label: "All Content" },
  { to: "/cms/videos", label: "Videos" },
  { to: "/cms/documents", label: "Documents" },
  { to: "/cms/quizzes", label: "Quizzes" },
  { to: "/cms/lessons", label: "Lessons" },
];

export function CMSNav() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? "border-[#238B45] text-[#238B45]"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}