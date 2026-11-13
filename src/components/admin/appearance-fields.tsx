"use client";

import { CMS_TYPEFACES, type CmsAppearance, type CmsTypeface } from "@/lib/cms-typefaces";
import { Field, Select } from "./admin-ui";
import { ColorField } from "./color-field";

const roles = [
  ["headingColor", "Überschriften"],
  ["cardBackground", "Kartenhintergrund"],
  ["buttonBackground", "Button-Hintergrund"],
  ["buttonTextColor", "Button-Text"],
  ["secondaryLinkColor", "Linkfarbe"],
  ["iconColor", "Symbolfarbe"],
] as const;

export function AppearanceFields({value, onChange, item = false}: {
  value?: CmsAppearance; onChange: (value: CmsAppearance) => void; item?: boolean;
}) {
  const t = (label: string) => label;
  const appearance = value ?? {};
  function change<K extends keyof CmsAppearance>(key: K, next: CmsAppearance[K]) {
    onChange({ ...appearance, [key]: next });
  }
  return <details className="cms-details cms-appearance-fields">
    <summary>{t(item ? "Gestaltung dieses Eintrags" : "Schriften und Elementfarben")}</summary>
    {(["headingTypeface", "bodyTypeface"] as const).map((key, index) => <Field key={key} label={t(index === 0 ? "Überschriftenschrift" : "Fließtextschrift")}>
      <Select value={appearance[key] ?? ""} onChange={event => change(key, (event.target.value || undefined) as CmsTypeface | undefined)}>
        <option value="">{t("Aus dem Design übernehmen")}</option>
        {Object.entries(CMS_TYPEFACES).map(([id, [name]]) => <option key={id} value={id}>{name}</option>)}
      </Select>
    </Field>)}
    <Field label={t("Fließtextgröße")}>
      <input className="cms-range" type="range" min=".75" max="1.4" step=".05" value={appearance.bodyScale ?? 1}
        onChange={event => change("bodyScale", Number(event.target.value) === 1 ? undefined : Number(event.target.value))} />
      <output>{Math.round((appearance.bodyScale ?? 1) * 100)} %</output>
    </Field>
    {item && <>
      <Field label={t("Überschriftengröße")}>
        <input className="cms-range" type="range" min=".75" max="1.4" step=".05" value={appearance.headingScale ?? 1}
          onChange={event => change("headingScale", Number(event.target.value) === 1 ? undefined : Number(event.target.value))} />
        <output>{Math.round((appearance.headingScale ?? 1) * 100)} %</output>
      </Field>
      <ColorField label={t("Hintergrund")} value={appearance.background} onChange={color => change("background", color)} optional />
      <ColorField label={t("Textfarbe")} value={appearance.textColor} onChange={color => change("textColor", color)} optional />
    </>}
    {roles.filter(([key]) => !item || key !== "cardBackground").map(([key, label]) => <ColorField key={key}
      label={t(label)} value={appearance[key]} onChange={color => change(key, color)} optional />)}
  </details>;
}
