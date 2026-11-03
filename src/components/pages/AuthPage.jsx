import { useState } from "react";
import { KeyRound, FlaskConical } from "lucide-react";
import { entrar, recuperarSenha, registrar } from "../../actions/auth.js";
import { setAuthToken } from "../../actions/http.js";
import { AppFooter } from "../layout/AppShell.jsx";

const initial = { name: "", email: "", password: "", recoveryCode: "", newPassword: "" };
export default function AuthPage({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(null);
  const [recoveryCode, setRecoveryCode] = useState("");
  const [copied, setCopied] = useState(false);
  const change = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const submit = async event => {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      if (mode === "register") {
        const result = await registrar({ name: form.name, email: form.email, password: form.password });
        setPending(result); setRecoveryCode(result.recoveryCode); setCopied(false);
      } else if (mode === "forgot") {
        const result = await recuperarSenha({ email: form.email, recoveryCode: form.recoveryCode, newPassword: form.newPassword });
        setRecoveryCode(result.recoveryCode); setPending(null); setMode("recovery-done"); setCopied(false);
      } else {
        const result = await entrar({ email: form.email, password: form.password });
        setAuthToken(result.token); onAuthenticated(result);
      }
    } catch (err) { setError(err.message || "Não foi possível concluir a operação."); }
    finally { setBusy(false); }
  };
  const completeRegistration = () => { setAuthToken(pending.token); onAuthenticated(pending); };
  const copyCode = async () => { await navigator.clipboard.writeText(recoveryCode); setCopied(true); };
  const title = mode === "register" ? "Criar conta" : mode === "forgot" ? "Recuperar acesso" : mode === "recovery-done" ? "Senha atualizada" : "Entrar no FormuLab";
  return <div className="min-h-screen bg-slate-50 flex flex-col"><main className="flex flex-1 items-center justify-center p-4">
    <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-xl">
      <div className="mb-6 flex items-center gap-3"><span className="rounded-xl bg-purple-50 p-3 text-purple-600"><FlaskConical /></span><div><h1 className="text-xl font-extrabold">Formu<span className="text-purple-600">Lab</span></h1><p className="text-xs text-slate-500">Acesso ao gerenciamento de formulações</p></div></div>
      <h2 className="text-lg font-bold">{title}</h2>
      {pending || mode === "recovery-done" ? <div className="mt-4 space-y-4 text-sm"><p className="text-slate-600">Guarde este código de recuperação. Ele é exibido apenas agora e será substituído após cada recuperação de senha.</p><div className="rounded-xl bg-slate-900 p-4 text-center font-mono text-lg tracking-wider text-white">{recoveryCode}</div><button onClick={copyCode} className="w-full rounded-lg border p-3 text-sm font-semibold hover:bg-slate-50">{copied ? "Código copiado" : "Copiar código"}</button>{pending && <><p className="text-xs text-slate-500">{pending.firstAccount ? "Sua conta recebeu o papel de Administrador inicial." : "Sua conta foi criada como Visualizador. Um administrador pode alterar seu papel."}</p><button onClick={completeRegistration} className="w-full rounded-lg bg-purple-600 p-3 font-bold text-white hover:bg-purple-700">Continuar para o sistema</button></>}{mode === "recovery-done" && <button onClick={() => { setMode("login"); setForm(initial); }} className="w-full rounded-lg bg-purple-600 p-3 font-bold text-white hover:bg-purple-700">Voltar ao login</button>}</div> : <form className="mt-5 space-y-4" onSubmit={submit}>
        {mode === "register" && <Field label="Nome completo" value={form.name} onChange={value => change("name", value)} autoComplete="name" required />}
        <Field label="E-mail" type="email" value={form.email} onChange={value => change("email", value)} autoComplete="email" required />
        {mode === "forgot" ? <><Field label="Código de recuperação" value={form.recoveryCode} onChange={value => change("recoveryCode", value)} required /><Field label="Nova senha" type="password" value={form.newPassword} onChange={value => change("newPassword", value)} autoComplete="new-password" required minLength={10} /></> : <Field label="Senha" type="password" value={form.password} onChange={value => change("password", value)} autoComplete={mode === "register" ? "new-password" : "current-password"} required minLength={mode === "register" ? 10 : undefined} />}
        {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        <button disabled={busy} className="w-full rounded-lg bg-purple-600 p-3 font-bold text-white hover:bg-purple-700 disabled:opacity-60">{busy ? "Aguarde..." : mode === "forgot" ? "Redefinir senha" : mode === "register" ? "Criar conta" : "Entrar"}</button>
      </form>}
      {!pending && mode !== "recovery-done" && <div className="mt-5 flex flex-wrap justify-between gap-3 border-t pt-4 text-xs"><button className="text-purple-700 hover:underline" onClick={() => { setError(""); setMode(mode === "register" ? "login" : "register"); }}> {mode === "register" ? "Já tenho uma conta" : "Criar conta"}</button><button className="text-slate-500 hover:text-purple-700" onClick={() => { setError(""); setMode(mode === "forgot" ? "login" : "forgot"); }}><KeyRound className="mr-1 inline" size={13} />Esqueci a senha</button></div>}
    </section>
  </main><AppFooter /></div>;
}
function Field({ label, value, onChange, type = "text", ...props }) { return <label className="block text-xs font-semibold text-slate-700">{label}<input {...props} type={type} value={value} onChange={event => onChange(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100" /></label>; }