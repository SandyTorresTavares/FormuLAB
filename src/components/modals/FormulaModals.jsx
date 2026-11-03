import { X } from "lucide-react";

export function DetalhesModal({ formula, onClose }) {
  if (!formula) return null;
  return <div className="modal-backdrop fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"><div className="modal-panel bg-white w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
    <div className="p-5 border-b flex justify-between items-center bg-slate-50"><div><h3 className="font-bold">{formula.name}</h3><p className="text-xs text-purple-600 mt-1">{formula.lab}</p></div><button onClick={onClose}><X /></button></div>
    <div className="p-6 overflow-y-auto space-y-5 text-xs"><div><b className="uppercase text-[10px] text-slate-500">Resumo executivo</b><p className="bg-slate-50 p-4 rounded-xl mt-2 leading-relaxed">{formula.summary}</p></div>
      <div><b className="uppercase text-[10px] text-slate-500">Ingredientes</b><div className="flex flex-wrap gap-2 mt-2">{formula.ingredients.length > 0 ? formula.ingredients.map((ing, i) => <span key={i} className="bg-purple-50 text-purple-800 border border-purple-100 px-3 py-2 rounded-lg">{ing}</span>) : <p className="text-slate-400">Ingredientes ainda não identificados.</p>}</div></div>
      <div><b className="uppercase text-[10px] text-slate-500">Texto extraído</b><pre className="bg-slate-900 text-slate-100 p-4 rounded-xl mt-2 whitespace-pre-wrap break-words font-mono text-[11px]">{formula.extractedText}</pre></div>
      <div><b className="text-slate-500">Arquivo original:</b><p className="mt-1">{formula.type}</p></div>
    </div><div className="p-4 border-t flex justify-end"><button onClick={onClose} className="bg-purple-600 text-white px-5 py-2 rounded-lg text-xs font-bold">Fechar</button></div>
  </div></div>;
}

export function EditarModal({ form, error, saving, onChange, onClose, onSave }) {
  if (!form.item) return null;
  return <div className="modal-backdrop fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"><form onSubmit={onSave} className="modal-panel bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
    <div className="p-5 border-b flex justify-between items-center"><h3 className="font-bold flex items-center gap-2">Editar Formulação</h3><button type="button" onClick={onClose} disabled={saving} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"><X /></button></div>
    <div className="p-6 space-y-4 text-xs"><div><label className="font-bold block mb-2">Nome do produto</label><input required value={form.name} onChange={e => onChange("name", e.target.value)} className="w-full border rounded-lg p-3 outline-none focus:border-purple-500" /></div>
      <div><label className="font-bold block mb-2">Laboratório</label><input required value={form.lab} onChange={e => onChange("lab", e.target.value)} className="w-full border rounded-lg p-3 outline-none focus:border-purple-500" /></div>
      <div><label className="font-bold block mb-2">Status</label><select value={form.status} onChange={e => onChange("status", e.target.value)} className="w-full border rounded-lg p-3"><option>Aguardando Análise</option><option>Em Análise</option><option>Aprovado</option><option>Reprovado</option></select></div>
      <div><label className="font-bold block mb-2">Resumo / Especificações</label><textarea required rows={5} value={form.summary} onChange={e => onChange("summary", e.target.value)} className="w-full border rounded-lg p-3 outline-none focus:border-purple-500 resize-y" /></div>
    </div>{error && <p role="alert" className="mx-6 mb-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</p>}<div className="p-4 border-t bg-slate-50 flex justify-end gap-2"><button type="button" onClick={onClose} disabled={saving} className="px-4 py-2 border bg-white rounded-lg text-xs font-bold hover:bg-slate-100 disabled:opacity-50">Cancelar</button><button type="submit" disabled={saving} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700 disabled:cursor-wait disabled:opacity-60">{saving ? "Salvando..." : "Salvar Alterações"}</button></div>
  </form></div>;
}
