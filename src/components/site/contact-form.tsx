"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { ArrowUpRight, Check, LoaderCircle, RotateCcw } from "lucide-react";

export function ContactForm({ editable = false }: { editable?: boolean }) {
  const id = useId();
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [startedAt] = useState(() => Date.now());
  const [subject, setSubject] = useState("");
  useEffect(() => { if (!editable) setSubject(new URLSearchParams(window.location.search).get("thema")?.slice(0, 200) ?? ""); }, [editable]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (editable || status === "sending") return;
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    setStatus("sending");
    setError("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"), email: data.get("email"), phone: data.get("phone"),
          subject: data.get("subject"), message: data.get("message"),
          consent: data.get("consent") === "on", website: data.get("website") ?? "", startedAt,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error ?? "Ihre Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut oder rufen Sie uns an.");
      setStatus("success");
      form.reset();
    } catch (reason) {
      setError(reason instanceof TypeError ? "Bitte prüfen Sie Ihre Internetverbindung und versuchen Sie es erneut." : reason instanceof Error ? reason.message : "Ihre Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut.");
      setStatus("error");
    }
  }
  if (status === "success") return <div className="hp-contact-success" role="status" aria-live="polite">
    <span className="hp-success-icon"><Check size={30} /></span><h3>Vielen Dank für Ihre Nachricht.</h3>
    <p>Ihre Anfrage ist bei uns eingegangen. Wir melden uns bei Ihnen.</p>
    <button className="hp-text-button" type="button" onClick={() => setStatus("idle")}>Weitere Nachricht schreiben <RotateCcw size={17} /></button>
  </div>;
  return <form className="hp-contact-form" onSubmit={submit} aria-label="Kontaktformular">
    {editable && <p className="hp-form-editor-note">Kontaktformular · Anfragen werden im Posteingang gespeichert.</p>}
    <fieldset disabled={editable || status === "sending"}>
      <div className="hp-form-row"><label htmlFor={`${id}-name`}><span>Ihr Name <span aria-hidden="true">*</span></span><input id={`${id}-name`} name="name" autoComplete="name" required maxLength={150} placeholder="Vor- und Nachname" /></label>
        <label htmlFor={`${id}-email`}><span>E-Mail-Adresse <span aria-hidden="true">*</span></span><input id={`${id}-email`} name="email" type="email" autoComplete="email" required maxLength={254} placeholder="name@beispiel.de" /></label></div>
      <div className="hp-form-row"><label htmlFor={`${id}-phone`}><span>Telefon <span className="hp-optional">(optional)</span></span><input id={`${id}-phone`} name="phone" type="tel" autoComplete="tel" maxLength={60} placeholder="Für einen Rückruf" /></label>
        <label htmlFor={`${id}-subject`}><span>Ihr Anliegen <span aria-hidden="true">*</span></span><input id={`${id}-subject`} name="subject" required maxLength={200} placeholder="Worum geht es?" value={subject} onChange={(event) => setSubject(event.target.value)} /></label></div>
      <label htmlFor={`${id}-message`}><span>Ihre Nachricht <span aria-hidden="true">*</span></span><textarea id={`${id}-message`} name="message" rows={4} required minLength={10} maxLength={10000} placeholder="Beschreiben Sie uns Ihr Anliegen in wenigen Sätzen." /></label>
      <div className="hp-honeypot" aria-hidden="true"><label htmlFor={`${id}-website`}>Website<input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" /></label></div>
      <label className="hp-checkbox-label" htmlFor={`${id}-consent`}><input id={`${id}-consent`} name="consent" type="checkbox" required /><span>Ich habe die <a href="/datenschutz">Datenschutzhinweise</a> zur Verarbeitung meiner Angaben gelesen. <span aria-hidden="true">*</span></span></label>
      <p className="hp-form-help">Mit * gekennzeichnete Felder sind erforderlich. Bitte senden Sie zunächst keine vertraulichen Unterlagen. Ein Mandatsverhältnis entsteht erst durch unsere ausdrückliche Bestätigung.</p>
      {error && <p className="hp-form-error" role="alert">{error}</p>}
      <button className="hp-button hp-button-dark" type="submit" disabled={editable || status === "sending"}>{status === "sending" ? <>Wird gesendet <LoaderCircle size={18} className="hp-spin" /></> : <>Nachricht senden <ArrowUpRight size={20} /></>}</button>
    </fieldset>
  </form>;
}
