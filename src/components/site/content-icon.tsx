"use client";

import {
  Accessibility, ArrowDown, ArrowRight, ArrowUpRight, Award, Baby, BadgeCheck, Bike, BookMarked, BookOpen,
  BriefcaseBusiness, Building2, CalendarCheck2, CalendarDays, Camera, Car, Check, ChevronDown, CircleAlert, CircleCheck,
  Euro, CircleHelp, Clock3, Columns3, Compass, CreditCard, Download, ExternalLink, Eye, Factory,
  FileCheck2, Files, FileText, Fingerprint, Flag, FolderOpen, Gavel, Globe, GraduationCap, Hammer,
  HandHeart, Handshake, HardHat, HeartHandshake, HeartPulse, Hourglass, House, Image, Images, Info,
  KeyRound, Landmark, Languages, LayoutGrid, Leaf, LifeBuoy, Lightbulb, Link, ListChecks, LockKeyhole,
  Mail, MapPin, MessageSquare, MessagesSquare, Monitor, Network, Phone, Plane, Plus, ReceiptText, Route,
  Scale, Search, Send, Shield, ShieldCheck, Siren, Smartphone, Store, Target, Timer, TrainFront,
  TrendingUp, Truck, Umbrella, Upload, UserRound, UsersRound, Video, Wallet, Wrench,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = { Accessibility, ArrowDown, ArrowRight, ArrowUpRight, Award, Baby, BadgeCheck, Bike, BookMarked, BookOpen, BriefcaseBusiness, Building2, CalendarCheck2, CalendarDays, Camera, Car, Check, CircleAlert, CircleCheck, Euro, CircleHelp, Clock3, Columns3, Compass, CreditCard, Download, ExternalLink, Eye, Factory, FileCheck2, Files, FileText, Fingerprint, Flag, FolderOpen, Gavel, Globe, GraduationCap, Hammer, HandHeart, Handshake, HardHat, HeartHandshake, HeartPulse, Hourglass, House, Image, Images, Info, KeyRound, Landmark, Languages, LayoutGrid, Leaf, LifeBuoy, Lightbulb, Link, ListChecks, LockKeyhole, Mail, MapPin, MessageSquare, MessagesSquare, Monitor, Network, Phone, Plane, ReceiptText, Route, Scale, Search, Send, Shield, ShieldCheck, Siren, Smartphone, Store, Target, Timer, TrainFront, TrendingUp, Truck, Umbrella, Upload, UserRound, UsersRound, Video, Wallet, Wrench };
const normalized = Object.fromEntries(Object.entries(icons).map(([key, icon]) => [key.toLowerCase(), icon]));
const aliases: Record<string, LucideIcon> = { arrow: ArrowUpRight, briefcase: BriefcaseBusiness, work: BriefcaseBusiness, building: Building2, business: Building2, home: House, users: UsersRound, family: UsersRound, heart: HeartHandshake, handshake: HeartHandshake, shield: ShieldCheck, calendar: CalendarDays, clock: Clock3, file: FileText, chevrondown: ChevronDown, circleeuro: Euro };

export function ContentIcon({ name, size = 23, editable, itemId, sectionId, className = "" }: { name?: string; size?: number; editable?: boolean; itemId?: string; sectionId?: string; className?: string }) {
  const key = (name ?? "").toLowerCase().replace(/[-_ ]/g, "");
  if (key === "none") return editable && itemId && sectionId ? <button type="button" className={`hp-icon-edit-trigger hp-icon-edit-empty ${className}`} aria-label="Symbol hinzufügen" data-icon-item-id={itemId} data-icon-section-id={sectionId}><Plus size={Math.min(size, 22)} strokeWidth={1.5} aria-hidden="true" /></button> : null;
  const Icon = icons[name ?? ""] ?? aliases[key] ?? normalized[key] ?? ArrowUpRight;
  if (editable && itemId && sectionId) return <button type="button" className={`hp-icon-edit-trigger ${className}`} aria-label="Symbol bearbeiten" data-icon-item-id={itemId} data-icon-section-id={sectionId}><Icon size={size} strokeWidth={1.65} aria-hidden="true" /></button>;
  return <Icon size={size} strokeWidth={1.65} aria-hidden="true" className={className} />;
}
