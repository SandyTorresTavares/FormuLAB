import { LogOut, Menu, UserCheck, X } from "lucide-react";
import LogoFormulab from "./LogoFormulab.jsx";
import { navItems } from "../../constants/appData.js";

function Navigation({ activeTab, onChange, mobile = false }) {
  return <nav className={mobile ? "md:hidden border-t p-3 bg-white space-y-1" : "space-y-1"}>
    {navItems.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => onChange(id)} className={`w-full flex items-center gap-3 p-3 rounded-xl text-xs font-semibold ${activeTab === id ? "bg-purple-100 text-purple-900" : "text-slate-600 hover:bg-slate-100"}`}>
      <Icon size={17} className="text-purple-600" /> {label}
    </button>)}
  </nav>;
}

export function Sidebar({ activeTab, onChange }) {
  return <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col justify-between p-4">
    <div>
      <div className="flex items-center gap-3 px-2 py-4 mb-7"><LogoFormulab className="w-11 h-11" /><div><h1 className="font-extrabold text-xl">Formu<span className="text-purple-600">Lab</span></h1><p className="text-[10px] text-slate-400">Gerenciamento de Formulações</p></div></div>
      <p className="text-[10px] font-bold text-slate-400 uppercase px-3 mb-3">Painel Geral</p>
      <Navigation activeTab={activeTab} onChange={onChange} />
    </div>
    <div className="border-t pt-4 text-center text-[11px] text-slate-400">FormuLab © 2026</div>
  </aside>;
}

export function AppHeader({ pageTitle, activeTab, onChange, mobileMenuOpen, onToggleMobileMenu, isUserMenuOpen, onToggleUserMenu }) {
  return <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
    <div className="h-16 px-4 sm:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3"><div className="md:hidden flex items-center gap-2"><LogoFormulab className="w-8 h-8" /><b>FormuLab</b></div><div className="hidden sm:block text-xs text-slate-500">FormuLab / <b className="text-slate-800">{pageTitle}</b></div></div>
      <div className="flex items-center gap-2"><div className="relative">
        <button onClick={onToggleUserMenu} className="flex items-center gap-2 bg-slate-50 border rounded-full px-3 py-1.5"><span className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center text-xs font-bold">ST</span><span className="hidden sm:block text-left"><b className="block text-xs">Sandy Torres Tavares</b><small className="text-teal-600">Status: Ativo</small></span></button>
        {isUserMenuOpen && <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border shadow-xl p-2 z-50"><p className="text-xs font-bold p-2">Sessão Atual</p><p className="text-[10px] text-slate-400 px-2 pb-2">Lab Sinergia Química</p><button onClick={() => { onToggleUserMenu(); alert("Integre aqui a troca de usuário."); }} className="w-full text-left p-2 text-xs hover:bg-slate-50 rounded-lg flex gap-2"><UserCheck size={15} /> Trocar de Usuário</button><button onClick={() => { onToggleUserMenu(); alert("Integre aqui o encerramento da sessão."); }} className="w-full text-left p-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex gap-2"><LogOut size={15} /> Sair</button></div>}
      </div><button className="md:hidden p-2 hover:bg-slate-100 rounded-lg" onClick={onToggleMobileMenu}>{mobileMenuOpen ? <X /> : <Menu />}</button></div>
    </div>
    {mobileMenuOpen && <Navigation mobile activeTab={activeTab} onChange={onChange} />}
  </header>;
}
