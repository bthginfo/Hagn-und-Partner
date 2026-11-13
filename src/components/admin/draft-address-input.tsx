"use client";

import { useId, useState } from "react";
import { Input } from "./admin-ui";

export function DraftAddressInput({
  value, display = value, disabled, normalize, validate, onCommit, maxLength,
}: {
  value: string;
  display?: string;
  disabled?: boolean;
  normalize: (value: string) => string;
  validate?: (value: string) => string | undefined;
  onCommit: (value: string) => void;
  maxLength: number;
}) {
  const id = useId();
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState<string>();
  return <><Input value={editing ?? display} disabled={disabled} maxLength={maxLength} autoComplete="off"
    spellCheck={false} aria-describedby={error ? id : undefined}
    onChange={event => { setError(undefined); setEditing(event.target.value); }}
    onBlur={() => {
      if (editing === null) return;
      setEditing(null);
      const next = normalize(editing);
      if (next === value) return;
      const message = validate?.(next);
      setError(message);
      if (!message) onCommit(next);
    }}
    onKeyDown={event => {
      if (event.key === "Enter") { event.preventDefault(); event.currentTarget.blur(); }
      if (event.key === "Escape") { setEditing(null); setError(undefined); }
    }} />
    {error && <small id={id} role="status" className="cms-hint">{error}</small>}
  </>;
}
