import { Form, NavLink } from "react-router";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/faqs", label: "FAQs" },
  { to: "/admin/plans", label: "Plans" },
  { to: "/admin/testimonials", label: "Testimonials" },
  { to: "/admin/team", label: "Team" },
  { to: "/admin/meals", label: "Meals" },
  { to: "/admin/settings", label: "Settings" },
];

export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-gray-800 text-white flex flex-col h-screen sticky top-0">
      <div className="px-6 py-5 border-b border-gray-700">
        <span className="text-green-500 font-bold text-xl">NutriTrack</span>
        <span className="text-gray-400 text-xs ml-2 uppercase tracking-widest">Admin</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-green-600 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-gray-700">
        <Form method="post" action="/admin/logout">
          <button
            type="submit"
            className="w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors text-left"
          >
            Sign Out
          </button>
        </Form>
      </div>
    </aside>
  );
}
