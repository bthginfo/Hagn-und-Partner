import { cmsAppearanceColor, cmsTypeface, type CmsAppearance } from "./cms-typefaces";

type AppearanceSection = {id: string; design: CmsAppearance; content: {items?: {id: string; appearance?: CmsAppearance}[]}};

// Attribute selector values come from authored IDs. Escape everything outside a conservative alphabet,
// including angle brackets so this stays safe in the initial HTML style element.
const cssText = (value: string) => Array.from(value, character => /[a-z0-9_-]/i.test(character)
  ? character : "\\" + character.codePointAt(0)!.toString(16) + " ").join("");
const titles = ":is(h1,h2,h3,h4,[data-cms-role=heading])";
const body = ":is(p,figcaption,blockquote,li,dt,dd,address,label,[data-cms-role=body])";
const buttons = ":is([data-cms-role=primary],.ws-button-primary,.ic-button,.nr-button,.ne-button,.ed-button,.ws-panorama-appointment)";
const links = ":is([data-cms-role=secondary],.ws-text-button,.ws-inline-link,.ic-text-link,.nr-link,.ws-panorama-secondary)";
const cards = ":is([data-item-id],.ws-card,.ws-feature-card,.ws-person-card,.ws-price-card,.ws-card-grid>article)";
const icons = ":is([data-cms-role=icon],.ws-icon-edit-trigger,.ws-card-icon,.ws-service-icon) svg";

function appearanceRules(scope: string, look: CmsAppearance, item: boolean) {
  const rules: string[] = [];
  const rule = (selector: string, property: string, value: string | undefined, important = false) => {
    if (value) rules.push(selector + "{" + property + ":" + value + (important ? "!important" : "") + "}");
  };
  const color = (selector: string, property: string, value?: string) => {
    if (cmsAppearanceColor(value)) rule(selector, property, value, true);
  };
  const scale = (value?: number) => typeof value === "number" && value >= .75 && value <= 1.4 && value !== 1 ? String(value) : undefined;
  const heading = scope + " " + titles, text = scope + " " + body;
  rule(heading, "font-family", cmsTypeface(look.headingTypeface), true);
  rule(text + "," + scope + " " + buttons + "," + scope + " " + links, "font-family", cmsTypeface(look.bodyTypeface), true);
  rule(heading, "zoom", scale(look.headingScale), true);
  rule(text, "zoom", scale(look.bodyScale), true);
  color(heading, "color", look.headingColor);
  if (item) {
    color(scope, "background-color", look.background);
    color(text + "," + heading, "color", look.textColor);
  }
  color(item ? scope : scope + " " + cards, "background-color", look.cardBackground);
  color(scope + " " + buttons, "background-color", look.buttonBackground);
  color(scope + " " + buttons + "," + scope + " " + buttons + ">span", "color", look.buttonTextColor);
  color(scope + " " + links, "color", look.secondaryLinkColor);
  color(scope + " " + icons, "color", look.iconColor);
  return rules.join("");
}

/** The same sanitized rules style the editing canvas and the public page. */
export function cmsAppearanceCss(id: string, sections: readonly AppearanceSection[]) {
  const canvas = '[data-cms-style-scope="' + cssText(id) + '"]';
  return sections.map(section => {
    const scope = canvas + ' [data-section-id="' + cssText(section.id) + '"]';
    return appearanceRules(scope, section.design, false) +
      (section.content.items ?? []).filter(item => item.appearance).map(item =>
        appearanceRules(scope + ' [data-item-id="' + cssText(item.id) + '"]', item.appearance!, true)).join("");
  }).join("");
}
