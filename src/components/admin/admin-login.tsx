"use client";

import { useState, type FormEvent } from "react";
import { Button, Eye, EyeOff, Field, IconButton, Input, Notice, ShieldCheck, api, errorMessage } from "./admin-ui";

export function AdminLogin() {
  const [password, setPassword] = useState(""); const [visible, setVisible] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function submit(event: FormEvent) { event.preventDefault(); setBusy(true); setError(""); try { await api("/api/admin/login", { method: "POST", body: JSON.stringify({ password }) }); window.location.assign("/admin"); } catch (error) { setError(errorMessage(error)); setBusy(false); } }
  return <main className="cms-root cms-login"><a href="/" className="cms-login-brand">Hagn <span>&</span> Partner<span className="cms-brand-sub">Rechtsanwälte · Ingolstadt</span></a><section className="cms-login-panel"><div className="cms-login-mark"><ShieldCheck size={27} strokeWidth={1.4} /></div><h1>Ihre Website.<br />Alles an einem Ort.</h1><p>Melden Sie sich an, um Inhalte zu bearbeiten und Anfragen zu lesen.</p><form onSubmit={submit}><Field label="Passwort"><span className="cms-password"><Input required type={visible ? "text" : "password"} name="password" autoComplete="current-password" autoFocus value={password} onChange={event => setPassword(event.target.value)} /><IconButton label={visible ? "Passwort verbergen" : "Passwort anzeigen"} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</IconButton></span></Field>{error && <Notice tone="error">{error}</Notice>}<Button type="submit" variant="primary" busy={busy} disabled={!password}>Anmelden</Button></form><a href="/" className="cms-text-link">Zur öffentlichen Website</a></section><p className="cms-login-note">Verwaltung für Hagn, Deckert, Stemmer & Partner PartG mbB</p></main>;
}
