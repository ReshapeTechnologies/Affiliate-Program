import { LayoutDashboard, LineChart } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const navItems = [
    { icon: LayoutDashboard, label: "Home", path: "/" },
    {
      icon: LineChart,
      label: "Analytics",
      path: "/analytics",
      disabled: false,
      comingSoon: false,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="flex items-center justify-center px-6 border-b border-gray-200 bg-black min-h-[90px]">
        <img src="/Logo.png" alt="Reshape" className="h-10 object-contain" />
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors relative ${
                item.disabled
                  ? "text-gray-400 cursor-not-allowed bg-gray-50"
                  : isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-700 hover:bg-gray-50"
              }`
            }
            onClick={(e) => {
              if (item.disabled) {
                e.preventDefault();
              }
            }}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
            {/* {item.comingSoon && (
              <span className="ml-auto text-xs font-semibold px-2 py-1 bg-amber-100 text-amber-800 rounded">
                Coming Soon
              </span>
            )} */}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
