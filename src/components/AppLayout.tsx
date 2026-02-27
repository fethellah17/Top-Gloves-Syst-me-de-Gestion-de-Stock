import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Tags,
  MapPin,
  ArrowLeftRight,
  ClipboardCheck,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Factory,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import logoImg from "@/assets/logo-topgloves.jpg";

const navItems = [
  { to: "/dashboard", label: "Tableau de Bord", icon: LayoutDashboard },
  { to: "/articles", label: "Articles", icon: Package },
  { to: "/categories", label: "Catégories", icon: Tags },
  { to: "/emplacements", label: "Emplacements", icon: MapPin },
  { to: "/mouvements", label: "Mouvements", icon: ArrowLeftRight },
  { to: "/inventaire", label: "Inventaire", icon: ClipboardCheck },
];

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar flex flex-col transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
          <img src={logoImg} alt="Top Gloves Logo" className="w-9 h-9 rounded-lg object-cover" />
          <div>
            <h1 className="text-base font-bold text-sidebar-accent-foreground tracking-tight">Top Gloves</h1>
            <p className="text-[11px] text-sidebar-muted">Gestion de Stock</p>
          </div>
          <button className="lg:hidden ml-auto text-sidebar-foreground" onClick={() => setMobileOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `sidebar-link ${isActive ? "sidebar-link-active" : ""}`}
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Admin + Logout */}
        <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
          <NavLink
            to="/admin"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => `sidebar-link ${isActive ? "sidebar-link-active" : ""}`}
          >
            <ShieldCheck className="w-[18px] h-[18px]" />
            Accès Admin
            {isAdmin && (
              <span className="ml-auto w-2 h-2 rounded-full bg-success" />
            )}
          </NavLink>
          <button onClick={handleLogout} className="sidebar-link w-full">
            <LogOut className="w-[18px] h-[18px]" />
            Déconnexion
          </button>
        </div>

        {/* User */}
        <div className="px-5 py-3 border-t border-sidebar-border">
          <p className="text-xs font-medium text-sidebar-accent-foreground">{user?.name}</p>
          <p className="text-[11px] text-sidebar-muted">{user?.role}</p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 border-b bg-card flex items-center px-4 lg:px-6 shrink-0">
          <button className="lg:hidden mr-3 text-foreground" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="text-xs text-muted-foreground font-mono">
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
