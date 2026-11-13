"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Copy, GripVertical, Plus, Trash2 } from "lucide-react";
import { collectionLines } from "@/lib/collection-editing";

type CollectionEntry = { id: string; title: string; search?: string };
type Props = {
  title: string;
  entries: readonly CollectionEntry[];
  selected?: string;
  max?: number;
  min?: number;
  quickAdd?: boolean;
  singular?: string;
  onAdd: (titles?: readonly string[]) => string | undefined;
  onMove: (id: string, target: string) => void;
  onDuplicate: (id: string) => string | undefined;
  onRemove: (id: string) => void;
  children: (id: string, index: number) => ReactNode;
  translate?: (key: string) => string;
};

const literal = (text: string) => text;

export function CollectionManager({
  title, entries, selected, min = 0, max = 150, singular = "Eintrag", quickAdd = true,
  onAdd, onMove, onDuplicate, onRemove, children, translate: t = literal,
}: Props) {
  const uid = useId(), root = useRef<HTMLElement>(null), drag = useRef<string | null>(null);
  const focus = useRef<{ id: string; edit: boolean } | null>(null);
  const [open, setOpen] = useState<string | undefined>(selected);
  const [query, setQuery] = useState("");
  const [batch, setBatch] = useState(false);
  const [lines, setLines] = useState("");
  const [over, setOver] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const q = query.trim().toLocaleLowerCase();
  const visible = q ? entries.filter(item => (item.title + " " + (item.search ?? "")).toLocaleLowerCase().includes(q)) : entries;
  const remaining = Math.max(0, max - entries.length);
  const draft = collectionLines(lines);
  const validBatch = draft.length > 0 && draft.length <= remaining && draft.every(line => line.length <= 300);

  useEffect(() => { if (selected) setOpen(selected); }, [selected]);
  useEffect(() => {
    const job = focus.current;
    if (!job || !root.current) return;
    const row = Array.from(root.current.querySelectorAll<HTMLElement>("[data-collection-entry]")).find(el => el.dataset.collectionEntry === job.id);
    const target = (job.edit ? row?.querySelector<HTMLElement>("[data-collection-title]:not([disabled])") : undefined) ?? row?.querySelector<HTMLElement>(".cms-collection-toggle");
    if (target) { focus.current = null; target.focus({ preventScroll: true }); }
  }, [entries, open]);

  function showNew(id: string | undefined) {
    if (!id) return;
    setQuery(""); setOpen(id); focus.current = {id, edit: true};
    setNotice(t("Eintrag hinzugefügt."));
  }
  function move(id: string, target: string) {
    if (id === target || q) return;
    focus.current = {id, edit: false};
    onMove(id, target);
    setNotice(t("Reihenfolge geändert."));
  }
  function remove(id: string, index: number) {
    const next = entries[index + 1]?.id ?? entries[index - 1]?.id;
    if (next) focus.current = {id: next, edit: false};
    else root.current?.querySelector<HTMLButtonElement>(".cms-collection-add")?.focus({preventScroll:true});
    setOpen(previous => previous === id ? undefined : previous);
    onRemove(id);
    setNotice(t("Eintrag entfernt. Mit Rückgängig wiederherstellen."));
  }
  function submitBatch() {
    if (!validBatch) return;
    showNew(onAdd(draft)); setLines(""); setBatch(false);
  }

  return <section ref={root} className="cms-collection-manager" aria-labelledby={uid}>
    <header className="cms-collection-head">
      <h3 id={uid}>{title} <span className="cms-collection-count">{entries.length}</span></h3>
      <button type="button" className="cms-collection-add" disabled={!remaining} onClick={() => showNew(onAdd())}>
        <Plus size={17} aria-hidden="true" />{t("Hinzufügen")}
      </button>
    </header>
    {(entries.length > 5 || query) && <label className="cms-collection-search">
      <span>{t("Einträge finden")}</span>
      <input type="search" value={query} onChange={event => setQuery(event.target.value)} />
    </label>}
    {q && <p className="cms-collection-help">{t("Zum Sortieren die Suche leeren.")}</p>}
    <ol className="cms-collection-rows">
      {visible.map(item => {
        const index = entries.indexOf(item), expanded = open === item.id;
        const label = item.title || t(singular) + " " + (index + 1);
        const rowId = uid + "-" + index;
        return <li key={item.id} data-collection-entry={item.id} data-drop={over === item.id || undefined}
          onDragOver={event => { if (drag.current && drag.current !== item.id && !q) { event.preventDefault(); event.dataTransfer.dropEffect = "move"; setOver(item.id); } }}
          onDrop={event => {
            if (!drag.current || q) return;
            event.preventDefault(); move(drag.current, item.id); drag.current = null; setOver(null);
          }}>
          <div className="cms-collection-row">
            <span className="cms-collection-grip" draggable={!q && entries.length > 1}
              title={t("Ziehen zum Sortieren")} aria-hidden="true"
              onDragStart={event => { drag.current = item.id; event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", item.id); }}
              onDragEnd={() => { drag.current = null; setOver(null); }}>
              <GripVertical size={15} />
            </span>
            <button type="button" className="cms-collection-toggle" aria-expanded={expanded}
              aria-controls={expanded ? rowId : undefined} onClick={() => setOpen(expanded ? undefined : item.id)}>
              <span className="cms-collection-position" aria-hidden="true">{index + 1}</span>
              <span>{label}</span><ChevronDown size={15} aria-hidden="true" />
            </button>
            <div className="cms-collection-actions" role="group" aria-label={label}>
              <button type="button" title={t("Nach oben")} aria-label={t("Eintrag nach oben verschieben")} disabled={Boolean(q) || index === 0}
                onClick={() => move(item.id, entries[index - 1].id)}><ArrowUp size={16} aria-hidden="true" /></button>
              <button type="button" title={t("Nach unten")} aria-label={t("Eintrag nach unten verschieben")} disabled={Boolean(q) || index === entries.length - 1}
                onClick={() => move(item.id, entries[index + 1].id)}><ArrowDown size={16} aria-hidden="true" /></button>
              <button type="button" title={t("Entfernen")} aria-label={t("Eintrag entfernen")} disabled={entries.length <= min}
                onClick={() => remove(item.id, index)}><Trash2 size={16} aria-hidden="true" /></button>
            </div>
          </div>
          {expanded && <div id={rowId} className="cms-collection-entry-content">
            {children(item.id, index)}
            <button type="button" className="cms-collection-copy" disabled={!remaining} onClick={() => showNew(onDuplicate(item.id))}>
              <Copy size={15} aria-hidden="true" />{t("Eintrag duplizieren")}
            </button>
          </div>}
        </li>;
      })}
    </ol>
    {!entries.length && <p className="cms-collection-help">{t("Noch keine Einträge. Mit Hinzufügen beginnen.")}</p>}
    {q && !visible.length && <p className="cms-collection-help">{t("Keine passenden Einträge.")}</p>}
    {!remaining && <p className="cms-collection-help">{t("Die maximale Anzahl ist erreicht.")}</p>}
    {quickAdd && remaining > 1 && <div className="cms-collection-batch">
      <button type="button" className="cms-collection-copy" aria-expanded={batch} onClick={() => setBatch(!batch)}>
        <Plus size={15} aria-hidden="true" />{t("Mehrere einfügen")}
      </button>
      {batch && <div>
        <label>{t("Ein Titel pro Zeile")}
          <textarea value={lines} rows={4} maxLength={50000} onChange={event => setLines(event.target.value)} />
        </label>
        {draft.length > remaining && <p className="cms-collection-help">{t("Zu viele Zeilen für diesen Abschnitt.")}</p>}
        {draft.some(line => line.length > 300) && <p className="cms-collection-help">{t("Titel dürfen höchstens 300 Zeichen haben.")}</p>}
        <button type="button" className="cms-collection-add" disabled={!validBatch} onClick={submitBatch}>
          <Plus size={16} aria-hidden="true" />{t("Einträge übernehmen")} {draft.length || ""}
        </button>
      </div>}
    </div>}
    <p className="cms-collection-status" role="status">{notice}</p>
  </section>;
}
