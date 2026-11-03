import { LogOut, Menu, X } from "lucide-react";
import LogoFormulab from "./LogoFormulab.jsx";

const roleLabels = { ADMIN: "Administrador", OPERATOR: "Operador", VIEWER: "Visualizador" };
function Navigation({ items, activeTab, onChange, mobile = false }) {
  return <nav className={mobile ? "md:hidden border-t p-3 bg-white space-y-1" : "space-y-1"}>
    {items.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => onChange(id)} className={`w-full flex items-center gap-3 p-3 rounded-xl text-xs font-semibold transition-colors ${activeTab === id ? "bg-purple-100 text-purple-900" : "text-slate-600 hover:bg-slate-100"}`}>
      <Icon size={17} className="text-purple-600" /> {label}
    </button>)}
  </nav>;
}

export function Sidebar({ activeTab, onChange, items }) {
  return <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col justify-between p-4">
    <div>
      <div className="flex items-center gap-3 px-2 py-4 mb-7"><LogoFormulab className="w-11 h-11" /><div><h1 className="font-extrabold text-xl">Formu<span className="text-purple-600">Lab</span></h1><p className="text-[10px] text-slate-400">Gerenciamento de Formulações</p></div></div>
      <p className="text-[10px] font-bold text-slate-400 uppercase px-3 mb-3">Painel Geral</p>
      <Navigation items={items} activeTab={activeTab} onChange={onChange} />
    </div>
    <div className="border-t pt-4 text-center text-[11px] text-slate-400">FormuLab © 2026</div>
  </aside>;
}

export function AppHeader({ pageTitle, activeTab, onChange, mobileMenuOpen, onToggleMobileMenu, user, onLogout, items }) {
  const initials = String(user?.name || "U").split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();
  return <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
    <div className="h-16 px-4 sm:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3"><div className="md:hidden flex items-center gap-2"><LogoFormulab className="w-8 h-8" /><b>FormuLab</b></div><div className="hidden sm:block text-xs text-slate-500">FormuLab / <b className="text-slate-800">{pageTitle}</b></div></div>
      <div className="flex items-center gap-2"><div className="flex items-center gap-2 rounded-full border bg-slate-50 px-3 py-1.5"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500 text-xs font-bold text-white">{initials}</span><span className="hidden text-left sm:block"><b className="block max-w-40 truncate text-xs">{user.name}</b><small className="text-teal-700">{roleLabels[user.role] || user.role}</small></span><button title="Sair" aria-label="Sair" onClick={onLogout} className="rounded-full p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"><LogOut size={15} /></button></div><button className="rounded-lg p-2 hover:bg-slate-100 md:hidden" onClick={onToggleMobileMenu}>{mobileMenuOpen ? <X /> : <Menu />}</button></div>
    </div>
    {mobileMenuOpen && <Navigation mobile items={items} activeTab={activeTab} onChange={onChange} />}
  </header>;
}