import { Clock, History, User } from "lucide-react";

export default function HistoricoPage({ revisionHistory }) {
  return <div className="max-w-6xl mx-auto space-y-6">
    <div><h2 className="text-2xl font-bold">Formulações Revisadas</h2><p className="text-xs text-slate-500 mt-1">Histórico de alterações e auditorias do sistema.</p></div>
    <section className="bg-white border rounded-2xl overflow-hidden"><div className="p-4 border-b flex items-center gap-2"><History className="text-purple-600" size={18} /><h3 className="text-xs font-bold uppercase">Log de Modificações</h3></div>
      {revisionHistory.map(rev => <article key={rev.id} className="p-5 border-b last:border-0"><div className="flex flex-col sm:flex-row sm:justify-between gap-2"><div><h3 className="font-bold text-sm">{rev.formulaName}</h3><span className="inline-block mt-2 bg-purple-50 text-purple-700 px-2 py-1 rounded text-[10px] font-bold">{rev.fieldChanged}</span></div><span className="text-xs text-slate-400 flex items-center gap-1"><Clock size={14} /> {rev.date}</span></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl my-4 text-xs"><div><b className="text-rose-500 block mb-1">Valor anterior</b><p>{rev.oldValue}</p></div><div><b className="text-emerald-600 block mb-1">Novo valor</b><p>{rev.newValue}</p></div></div>
        <p className="text-xs text-slate-500 mb-3"><b className="text-slate-700">Motivo:</b> {rev.reason}</p><div className="text-[11px] text-slate-500 flex items-center gap-2"><User size={14} className="text-purple-600" />{rev.changedBy} — {rev.role}</div>
      </article>)}
      {revisionHistory.length === 0 && <p className="p-8 text-center text-xs text-slate-400">Nenhuma alteração registrada.</p>}
    </section>
  </div>;
}
