"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Building2,
  ChevronDown,
  Copy,
  Download,
  Eye,
  FilePlus2,
  FileText,
  FolderOpen,
  ImagePlus,
  Landmark,
  ListOrdered,
  Loader2,
  Palette,
  PenLine,
  Percent,
  Plus,
  Save,
  Share2,
  SquarePen,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import {
  blankDoc,
  blankItem,
  BRAND_COLORS,
  computeTotals,
  CURRENCIES,
  docTitle,
  FONTS,
  formatDate,
  formatMoney,
  KIND_BY_ID,
  KINDS,
  nextNumber,
  renumberForKind,
  sampleDoc,
  TEMPLATES,
  today,
  uid,
  type DocKind,
  type InvoiceDoc,
  type LineItem,
  type TemplateId,
} from "@/lib/invoice/model";
import { buildView, fileName } from "@/lib/invoice/view";
import { fileToDataUrl } from "@/lib/invoice/images";
import {
  deleteDoc,
  loadDocs,
  loadDraft,
  loadProfile,
  recentClients,
  recentItems,
  saveDoc,
  saveDraft,
  saveProfile,
  profileOf,
  type Profile,
} from "@/lib/invoice/storage";
import { track } from "@/lib/track-client";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Field,
  inputClass,
  NumberField,
  NumberInput,
  Section,
  Segmented,
  SelectField,
  TextAreaField,
  TextField,
  Toggle,
} from "./fields";
import { A4, InvoicePreview } from "./invoice-preview";
import { SignaturePad } from "./signature-pad";
import { SoftwareNudge } from "./software-ad";

type Tab = "edit" | "preview";

function startingDoc(): { doc: InvoiceDoc; sample: boolean } {
  const draft = loadDraft();
  if (draft) return { doc: draft, sample: false };
  const profile = loadProfile();
  if (profile) return { doc: withProfile(blankDoc(), profile), sample: false };
  return { doc: sampleDoc(), sample: true };
}

function withProfile(doc: InvoiceDoc, profile: Profile | null): InvoiceDoc {
  if (!profile) return doc;
  return {
    ...doc,
    ...profile,
    from: { ...doc.from, ...profile.from },
    branding: { ...doc.branding, ...profile.branding },
    payment: { ...doc.payment, ...profile.payment },
  };
}

export default function InvoiceGenerator() {
  const [{ doc, sample }, setState] = useState(startingDoc);
  const [docs, setDocs] = useState<InvoiceDoc[]>(loadDocs);
  const [tab, setTab] = useState<Tab>("edit");
  const rootRef = useRef<HTMLDivElement>(null);
  const [showDocs, setShowDocs] = useState(false);
  const [busy, setBusy] = useState<"download" | "share" | null>(null);
  const [notice, setNotice] = useState<"downloaded" | "saved" | "error" | null>(
    null,
  );
  const [canShare] = useState(() => {
    try {
      const probe = new File([""], "x.pdf", { type: "application/pdf" });
      return (
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [probe] })
      );
    } catch {
      return false;
    }
  });

  const setDoc = (fn: (d: InvoiceDoc) => InvoiceDoc) =>
    setState((s) => ({
      doc: { ...fn(s.doc), updatedAt: new Date().toISOString() },
      sample: false,
    }));
  const update = (patch: Partial<InvoiceDoc>) =>
    setDoc((d) => ({ ...d, ...patch }));

  // Autosave the draft and the business profile (browser only).
  useEffect(() => {
    if (sample) return;
    const t = setTimeout(() => {
      saveDraft(doc);
      saveProfile(doc);
    }, 400);
    return () => clearTimeout(t);
  }, [doc, sample]);

  const deferred = useDeferredValue(doc);
  const view = useMemo(() => buildView(deferred), [deferred]);
  const totals = useMemo(() => computeTotals(doc), [doc]);
  const clients = useMemo(() => recentClients(docs), [docs]);
  const savedItems = useMemo(() => recentItems(docs), [docs]);

  function openDoc(next: InvoiceDoc, isSample = false) {
    setState({ doc: next, sample: isSample });
    setNotice(null);
    setShowDocs(false);
  }

  function newDoc(kind: DocKind) {
    const profile = loadProfile() ?? (sample ? null : profileOf(doc));
    const base = withProfile(blankDoc(kind), profile);
    const prefix = KIND_BY_ID.get(kind)!.prefix;
    const last = docs.find((d) => d.kind === kind)?.number;
    openDoc({ ...base, number: last ? nextNumber(last, prefix) : base.number });
  }

  /** Same content as a new document: duplicate, or convert quote → invoice → receipt. */
  function copyAs(kind: DocKind) {
    const prefix = KIND_BY_ID.get(kind)!.prefix;
    const last = docs.find((d) => d.kind === kind)?.number;
    const number = last
      ? nextNumber(last, prefix)
      : kind === doc.kind
        ? nextNumber(doc.number, prefix)
        : renumberForKind(doc.number, kind);
    openDoc({
      ...doc,
      id: uid(),
      kind,
      number,
      customTitle: kind === doc.kind ? doc.customTitle : "",
      issueDate: today(),
      reference: kind !== doc.kind ? doc.number : doc.reference,
      stamp: kind === "receipt" ? "paid" : "none",
      items: doc.items.map((i) => ({ ...i, id: uid() })),
    });
  }

  function save() {
    setDocs(saveDoc(doc));
    setNotice("saved");
  }

  async function makePdf() {
    const [{ pdf }, { InvoicePdf }] = await Promise.all([
      import("@react-pdf/renderer"),
      import("./invoice-pdf"),
    ]);
    return pdf(
      <InvoicePdf
        view={buildView(doc)}
        title={`${docTitle(doc)} ${doc.number}`.trim()}
      />,
    ).toBlob();
  }

  async function download() {
    setBusy("download");
    try {
      const blob = await makePdf();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName(doc);
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      if (!sample) setDocs(saveDoc(doc));
      setNotice("downloaded");
      track("invoice_downloaded");
    } catch {
      setNotice("error");
    } finally {
      setBusy(null);
    }
  }

  async function share() {
    setBusy("share");
    try {
      const blob = await makePdf();
      const file = new File([blob], fileName(doc), { type: "application/pdf" });
      await navigator.share({
        files: [file],
        title: `${docTitle(doc)} ${doc.number}`,
      });
      if (!sample) setDocs(saveDoc(doc));
      track("invoice_downloaded");
    } catch (e) {
      if ((e as Error)?.name !== "AbortError") setNotice("error");
    } finally {
      setBusy(null);
    }
  }

  const kind = KIND_BY_ID.get(doc.kind)!;

  return (
    <div ref={rootRef} className="flex flex-col gap-5">
      {/* Phones: switch between the form and the preview. */}
      <div className="fixed bottom-6 left-1/2 z-40 w-44 -translate-x-1/2 rounded-2xl shadow-[0_8px_24px_-6px_rgba(13,23,38,0.35)] lg:hidden">
        <Segmented<Tab>
          label="View"
          className="bg-navy-950 [&_[aria-checked=false]]:text-navy-200 [&_[aria-checked=false]]:hover:text-white"
          value={tab}
          onChange={(t) => {
            setTab(t);
            const top = rootRef.current?.getBoundingClientRect().top ?? 0;
            if (top < 0) window.scrollTo({ top: window.scrollY + top - 72 });
          }}
          options={[
            { value: "edit", label: "Edit" },
            { value: "preview", label: "Preview" },
          ]}
        />
      </div>
      {/* Toolbar */}
      <div className="sticky top-16 z-30 -mx-4 border-y border-navy-100 bg-white/95 px-4 py-3 backdrop-blur-xl sm:top-20 sm:mx-0 sm:rounded-2xl sm:border sm:shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={download}
            disabled={busy !== null}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-navy-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-navy-800 disabled:opacity-70"
          >
            {busy === "download" ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="size-4" aria-hidden="true" />
            )}
            Download<span className="hidden min-[400px]:inline"> PDF</span>
          </button>
          {canShare ? (
            <ToolButton onClick={share} disabled={busy !== null} label="Share">
              {busy === "share" ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Share2 className="size-4" aria-hidden="true" />
              )}
            </ToolButton>
          ) : null}
          <ToolButton onClick={save} label="Save">
            <Save className="size-4" aria-hidden="true" />
          </ToolButton>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-navy-200 bg-white px-3 text-sm font-medium text-navy-800 hover:border-navy-300"
                >
                  <FilePlus2 className="size-4" aria-hidden="true" />
                  <span className="hidden sm:inline">New</span>
                  <ChevronDown className="size-3.5" aria-hidden="true" />
                </button>
              }
            />
            <DropdownMenuContent className="min-w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Start a new</DropdownMenuLabel>
                {KINDS.map((k) => (
                  <DropdownMenuItem key={k.id} onClick={() => newDoc(k.id)}>
                    <FileText aria-hidden="true" /> {k.title}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  From this {kind.label.toLowerCase()}
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => copyAs(doc.kind)}>
                  <Copy aria-hidden="true" /> Duplicate
                </DropdownMenuItem>
                {KINDS.filter((k) => k.id !== doc.kind).map((k) => (
                  <DropdownMenuItem key={k.id} onClick={() => copyAs(k.id)}>
                    <SquarePen aria-hidden="true" /> Convert to{" "}
                    {k.title.toLowerCase()}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <ToolButton
            onClick={() => setShowDocs((v) => !v)}
            label={`My documents${docs.length ? ` (${docs.length})` : ""}`}
          >
            <FolderOpen className="size-4" aria-hidden="true" />
          </ToolButton>

          <p className="ml-auto hidden text-sm text-navy-500 lg:block">
            {kind.label} total{" "}
            <span className="font-semibold text-navy-950 tabular-nums">
              {formatMoney(totals.total, doc)}
            </span>
          </p>
        </div>
      </div>

      {sample ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-navy-100 bg-white p-4 sm:flex-row sm:items-center">
          <p className="flex-1 text-sm text-navy-700">
            <span className="font-semibold text-navy-950">
              This is an example invoice.
            </span>{" "}
            Edit it, or start with a blank one. Your details are remembered in
            this browser only.
          </p>
          <button
            type="button"
            onClick={() => openDoc(blankDoc("invoice"))}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-gold-500 px-3 text-sm font-semibold text-white hover:bg-gold-600"
          >
            Start blank
          </button>
        </div>
      ) : null}

      {notice === "downloaded" ? (
        <SoftwareNudge onClose={() => setNotice(null)} />
      ) : null}
      {notice === "saved" ? (
        <Banner onClose={() => setNotice(null)}>
          Saved to My documents in this browser.
        </Banner>
      ) : null}
      {notice === "error" ? (
        <Banner tone="error" onClose={() => setNotice(null)}>
          The PDF couldn&rsquo;t be created. Try a different logo image, or
          refresh the page and try again.
        </Banner>
      ) : null}

      {showDocs ? (
        <DocsPanel
          docs={docs}
          currentId={doc.id}
          onOpen={(d) =>
            openDoc({
              ...d,
              branding: { ...d.branding, logo: doc.branding.logo },
              signature: doc.signature,
            })
          }
          onDelete={(id) => setDocs(deleteDoc(id))}
          onClose={() => setShowDocs(false)}
        />
      ) : null}

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,27rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,30rem)_minmax(0,1fr)]">
        <div
          className={cn(
            "flex flex-col gap-4",
            tab === "preview" && "hidden lg:flex",
          )}
          key={doc.id}
        >
          <Editor
            doc={doc}
            setDoc={setDoc}
            update={update}
            clients={clients}
            savedItems={savedItems}
          />
        </div>
        <div className={cn(tab === "edit" && "hidden lg:block")}>
          <div className="lg:sticky lg:top-40">
            <PreviewPane>
              <InvoicePreview view={view} />
            </PreviewPane>
            <p className="mt-3 text-center text-xs text-navy-500">
              Live preview. Your PDF downloads exactly like this, with no
              watermark.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolButton({
  onClick,
  label,
  disabled,
  children,
}: {
  onClick: () => void;
  label: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-navy-200 bg-white px-3 text-sm font-medium text-navy-800 transition hover:border-navy-300 disabled:opacity-60"
    >
      {children}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function Banner({
  children,
  tone = "info",
  onClose,
}: {
  children: React.ReactNode;
  tone?: "info" | "error";
  onClose: () => void;
}) {
  return (
    <div
      role="status"
      className={cn(
        "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm",
        tone === "error"
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-navy-100 bg-white text-navy-800",
      )}
    >
      <span className="flex-1">{children}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss"
        className="text-navy-400 hover:text-navy-900"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

function DocsPanel({
  docs,
  currentId,
  onOpen,
  onDelete,
  onClose,
}: {
  docs: InvoiceDoc[];
  currentId: string;
  onOpen: (doc: InvoiceDoc) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  const [filter, setFilter] = useState<DocKind | "all">("all");
  const shown = docs.filter((d) => filter === "all" || d.kind === filter);
  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="font-heading text-lg font-semibold text-navy-950">
          My documents
        </h3>
        <select
          aria-label="Filter documents"
          className={cn(inputClass, "h-9 w-auto")}
          value={filter}
          onChange={(e) => setFilter(e.target.value as DocKind | "all")}
        >
          <option value="all">All</option>
          {KINDS.map((k) => (
            <option key={k.id} value={k.id}>
              {k.title}s
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="ml-auto text-navy-400 hover:text-navy-900"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>
      {shown.length === 0 ? (
        <p className="mt-4 text-sm text-navy-600">
          Nothing saved yet. Documents are saved here when you download or press
          Save. They stay in this browser only.
        </p>
      ) : (
        <ul className="mt-3 flex max-h-80 flex-col divide-y divide-navy-100 overflow-y-auto">
          {shown.map((d) => {
            const total = computeTotals(d).total;
            return (
              <li key={d.id} className="flex items-center gap-3 py-2.5">
                <button
                  type="button"
                  onClick={() => onOpen(d)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <span className="w-16 shrink-0 rounded-md bg-navy-50 px-2 py-1 text-center text-[11px] font-semibold text-navy-700">
                    {KIND_BY_ID.get(d.kind)!.label}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-navy-950">
                      {d.number} {d.to.name ? `· ${d.to.name}` : ""}
                    </span>
                    <span className="block text-xs text-navy-500">
                      {formatDate(d.issueDate)} · {formatMoney(total, d)}
                      {d.id === currentId ? " · open now" : ""}
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete ${d.number}? This can't be undone.`))
                      onDelete(d.id);
                  }}
                  aria-label={`Delete ${d.number}`}
                  className="text-navy-300 hover:text-red-600"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** Scales the A4 sheet to the available width. */
function PreviewPane({ children }: { children: React.ReactNode }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ scale: 1, height: A4.height });

  useEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    const measure = () => {
      const scale = Math.min(1.25, o.clientWidth / A4.width);
      setSize({ scale, height: i.offsetHeight * scale });
    };
    const ro = new ResizeObserver(measure);
    ro.observe(o);
    ro.observe(i);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={outer} className="w-full">
      <div
        className="relative mx-auto overflow-hidden rounded-md bg-white shadow-[0_1px_2px_rgba(13,23,38,0.06),0_12px_32px_-8px_rgba(13,23,38,0.18)] ring-1 ring-navy-100"
        style={{ width: A4.width * size.scale, height: size.height }}
      >
        <div
          ref={inner}
          style={{
            width: A4.width,
            transform: `scale(${size.scale})`,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function Editor({
  doc,
  setDoc,
  update,
  clients,
  savedItems,
}: {
  doc: InvoiceDoc;
  setDoc: (fn: (d: InvoiceDoc) => InvoiceDoc) => void;
  update: (patch: Partial<InvoiceDoc>) => void;
  clients: InvoiceDoc["to"][];
  savedItems: ReturnType<typeof recentItems>;
}) {
  const kind = KIND_BY_ID.get(doc.kind)!;
  const setFrom = (patch: Partial<InvoiceDoc["from"]>) =>
    setDoc((d) => ({ ...d, from: { ...d.from, ...patch } }));
  const setTo = (patch: Partial<InvoiceDoc["to"]>) =>
    setDoc((d) => ({ ...d, to: { ...d.to, ...patch } }));
  const setBrand = (patch: Partial<InvoiceDoc["branding"]>) =>
    setDoc((d) => ({ ...d, branding: { ...d.branding, ...patch } }));
  const setPay = (patch: Partial<InvoiceDoc["payment"]>) =>
    setDoc((d) => ({ ...d, payment: { ...d.payment, ...patch } }));
  const setItem = (id: string, patch: Partial<LineItem>) =>
    setDoc((d) => ({
      ...d,
      items: d.items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    }));
  const moveItem = (index: number, by: number) =>
    setDoc((d) => {
      const items = [...d.items];
      const [item] = items.splice(index, 1);
      items.splice(Math.max(0, Math.min(items.length, index + by)), 0, item);
      return { ...d, items };
    });
  const [logoError, setLogoError] = useState("");

  return (
    <>
      <Section
        title="Document"
        icon={FileText}
        hint={`${docTitle(doc)} ${doc.number}`}
      >
        <Segmented<DocKind>
          label="Document type"
          value={doc.kind}
          onChange={(k) =>
            update({
              kind: k,
              number: renumberForKind(doc.number, k),
              stamp:
                k === "receipt" && doc.stamp === "none" ? "paid" : doc.stamp,
            })
          }
          options={KINDS.map((k) => ({ value: k.id, label: k.label }))}
        />
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label={`${kind.label} number`}
            value={doc.number}
            onChange={(v) => update({ number: v })}
          />
          <TextField
            label="Title on document"
            value={doc.customTitle}
            placeholder={kind.title}
            onChange={(v) => update({ customTitle: v })}
          />
          <TextField
            label={doc.kind === "receipt" ? "Payment date" : "Date"}
            type="date"
            value={doc.issueDate}
            onChange={(v) => update({ issueDate: v })}
          />
          {kind.dueLabel ? (
            <TextField
              label={kind.dueLabel}
              type="date"
              value={doc.dueDate}
              onChange={(v) => update({ dueDate: v })}
            />
          ) : (
            <div />
          )}
          <TextField
            label={
              doc.kind === "receipt"
                ? "Payment ref (e.g. M-Pesa code)"
                : "Reference / PO no."
            }
            value={doc.reference}
            placeholder="Optional"
            onChange={(v) => update({ reference: v })}
          />
          <SelectField
            label="Currency"
            value={doc.currency}
            onChange={(v) => update({ currency: v })}
            options={CURRENCIES.map((c) => ({ value: c, label: c }))}
          />
        </div>
      </Section>

      <Section
        title="Branding"
        icon={Palette}
        hint="Logo, colour, template and font"
      >
        <Field label="Logo">
          {(id) => (
            <div className="flex items-center gap-3">
              <label
                htmlFor={id}
                className="flex h-16 w-28 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-navy-300 bg-navy-50 text-navy-500 hover:border-gold-500 hover:text-gold-700"
              >
                {doc.branding.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element -- local data URL
                  <img
                    src={doc.branding.logo}
                    alt="Your logo"
                    className="max-h-14 max-w-24 object-contain"
                  />
                ) : (
                  <ImagePlus className="size-5" aria-hidden="true" />
                )}
              </label>
              <input
                id={id}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="sr-only"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  try {
                    setLogoError("");
                    setBrand({ logo: await fileToDataUrl(file) });
                  } catch {
                    setLogoError(
                      "That image couldn't be read. Try a PNG or JPG.",
                    );
                  }
                }}
              />
              <div className="flex min-w-0 flex-col gap-2">
                <Segmented<"s" | "m" | "l">
                  label="Logo size"
                  value={doc.branding.logoSize}
                  onChange={(v) => setBrand({ logoSize: v })}
                  options={[
                    { value: "s", label: "S" },
                    { value: "m", label: "M" },
                    { value: "l", label: "L" },
                  ]}
                />
                {doc.branding.logo ? (
                  <button
                    type="button"
                    onClick={() => setBrand({ logo: "" })}
                    className="self-start text-xs font-semibold text-navy-500 hover:text-red-600"
                  >
                    Remove logo
                  </button>
                ) : (
                  <span className="text-xs text-navy-500">PNG, JPG or SVG</span>
                )}
              </div>
            </div>
          )}
        </Field>
        {logoError ? (
          <p className="-mt-2 text-xs text-red-600">{logoError}</p>
        ) : null}

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-navy-700">
            Brand colour
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {BRAND_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Colour ${c}`}
                aria-pressed={doc.branding.color === c}
                onClick={() => setBrand({ color: c })}
                className={cn(
                  "size-8 rounded-full ring-offset-2 transition outline-none focus-visible:ring-3 focus-visible:ring-gold-400",
                  doc.branding.color === c
                    ? "ring-2 ring-navy-950"
                    : "hover:scale-110",
                )}
                style={{ background: c }}
              />
            ))}
            <label className="relative flex h-8 items-center gap-2 rounded-full border border-navy-200 bg-white pr-3 pl-1 text-xs font-medium text-navy-700">
              <input
                type="color"
                value={doc.branding.color}
                onChange={(e) => setBrand({ color: e.target.value })}
                className="size-6 cursor-pointer rounded-full border-0 bg-transparent p-0"
                aria-label="Custom colour"
              />
              <input
                aria-label="Colour hex code"
                value={doc.branding.color}
                onChange={(e) => {
                  const v = e.target.value.startsWith("#")
                    ? e.target.value
                    : `#${e.target.value}`;
                  if (/^#[0-9a-f]{0,6}$/i.test(v)) setBrand({ color: v });
                }}
                className="w-16 bg-transparent font-mono uppercase outline-none"
              />
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-navy-700">Template</span>
          <div className="grid grid-cols-3 gap-2">
            {TEMPLATES.map((t) => (
              <TemplateThumb
                key={t.id}
                id={t.id}
                label={t.label}
                color={doc.branding.color}
                active={doc.branding.template === t.id}
                onClick={() => setBrand({ template: t.id })}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-navy-700">Font</span>
          <Segmented
            label="Font"
            value={doc.branding.font}
            onChange={(v) => setBrand({ font: v })}
            options={FONTS.map((f) => ({ value: f.id, label: f.label }))}
          />
        </div>
      </Section>

      <Section
        title="Your business"
        icon={Building2}
        hint={doc.from.name || "Who the document is from"}
      >
        <TextField
          label="Business name"
          value={doc.from.name}
          onChange={(v) => setFrom({ name: v })}
        />
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Contact person"
            value={doc.from.contact}
            onChange={(v) => setFrom({ contact: v })}
          />
          <TextField
            label="KRA PIN / Tax no."
            value={doc.from.taxId}
            onChange={(v) => setFrom({ taxId: v })}
          />
          <TextField
            label="Phone"
            type="tel"
            value={doc.from.phone}
            onChange={(v) => setFrom({ phone: v })}
          />
          <TextField
            label="Email"
            type="email"
            value={doc.from.email}
            onChange={(v) => setFrom({ email: v })}
          />
        </div>
        <TextAreaField
          label="Address"
          rows={2}
          value={doc.from.address}
          onChange={(v) => setFrom({ address: v })}
        />
        <TextField
          label="Website"
          value={doc.from.website}
          onChange={(v) => setFrom({ website: v })}
        />
      </Section>

      <Section
        title={kind.toLabel}
        icon={UserRound}
        hint={doc.to.name || "Your client"}
      >
        <Field label="Client name">
          {(id) => (
            <>
              <input
                id={id}
                list="bluvig-clients"
                className={inputClass}
                value={doc.to.name}
                onChange={(e) => {
                  const v = e.target.value;
                  const known = clients.find(
                    (c) =>
                      c.name.trim().toLowerCase() === v.trim().toLowerCase(),
                  );
                  const blank =
                    !doc.to.email && !doc.to.phone && !doc.to.address;
                  setTo(known && blank ? { ...known, name: v } : { name: v });
                }}
              />
              <datalist id="bluvig-clients">
                {clients.map((c) => (
                  <option key={c.name} value={c.name} />
                ))}
              </datalist>
            </>
          )}
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Contact person"
            value={doc.to.contact}
            onChange={(v) => setTo({ contact: v })}
          />
          <TextField
            label="KRA PIN / Tax no."
            value={doc.to.taxId}
            onChange={(v) => setTo({ taxId: v })}
          />
          <TextField
            label="Phone"
            type="tel"
            value={doc.to.phone}
            onChange={(v) => setTo({ phone: v })}
          />
          <TextField
            label="Email"
            type="email"
            value={doc.to.email}
            onChange={(v) => setTo({ email: v })}
          />
        </div>
        <TextAreaField
          label="Address"
          rows={2}
          value={doc.to.address}
          onChange={(v) => setTo({ address: v })}
        />
      </Section>

      <Section
        title="Items"
        icon={ListOrdered}
        hint={`${doc.items.length} line${doc.items.length === 1 ? "" : "s"}`}
      >
        <datalist id="bluvig-items">
          {savedItems.map((i) => (
            <option key={i.name} value={i.name} />
          ))}
        </datalist>
        <ol className="flex flex-col gap-3">
          {doc.items.map((item, index) => (
            <li
              key={item.id}
              className="rounded-xl border border-navy-100 bg-navy-50/60 p-3"
            >
              <div className="flex items-start gap-2">
                <span className="mt-2.5 w-5 shrink-0 text-xs font-semibold text-navy-400">
                  {index + 1}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <input
                    list="bluvig-items"
                    aria-label="Item name"
                    placeholder="Item or service"
                    className={cn(inputClass, "font-medium")}
                    value={item.name}
                    onChange={(e) => {
                      const v = e.target.value;
                      const known = savedItems.find(
                        (s) => s.name.toLowerCase() === v.trim().toLowerCase(),
                      );
                      setItem(
                        item.id,
                        known && !item.rate
                          ? {
                              name: v,
                              description: known.description,
                              unit: known.unit,
                              rate: known.rate,
                            }
                          : { name: v },
                      );
                    }}
                  />
                  <textarea
                    aria-label="Item description"
                    rows={1}
                    placeholder="Description (optional)"
                    className={cn(
                      inputClass,
                      "h-auto resize-y py-2 text-[13px]",
                    )}
                    value={item.description}
                    onChange={(e) =>
                      setItem(item.id, { description: e.target.value })
                    }
                  />
                  {doc.showQuantities ? (
                    <div className="grid grid-cols-[4.5rem_4.5rem_minmax(0,1fr)_4rem] gap-2">
                      <MiniField label="Qty">
                        <NumberInput
                          ariaLabel="Quantity"
                          value={item.qty}
                          onChange={(v) => setItem(item.id, { qty: v })}
                        />
                      </MiniField>
                      <MiniField label="Unit">
                        <input
                          aria-label="Unit"
                          placeholder="pcs"
                          className={inputClass}
                          value={item.unit}
                          onChange={(e) =>
                            setItem(item.id, { unit: e.target.value })
                          }
                        />
                      </MiniField>
                      <MiniField label={`Rate (${doc.currency})`}>
                        <NumberInput
                          ariaLabel="Rate"
                          value={item.rate}
                          onChange={(v) => setItem(item.id, { rate: v })}
                        />
                      </MiniField>
                      <MiniField label="Disc %">
                        <NumberInput
                          ariaLabel="Discount percent"
                          value={item.discount}
                          onChange={(v) =>
                            setItem(item.id, {
                              discount: Math.min(100, Math.max(0, v)),
                            })
                          }
                        />
                      </MiniField>
                    </div>
                  ) : (
                    <MiniField label={`Amount (${doc.currency})`}>
                      <NumberInput
                        ariaLabel="Amount"
                        value={item.rate}
                        onChange={(v) => setItem(item.id, { rate: v, qty: 1 })}
                      />
                    </MiniField>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    {doc.taxRate > 0 ? (
                      <label className="flex items-center gap-2 text-xs text-navy-600">
                        <input
                          type="checkbox"
                          checked={item.taxable}
                          onChange={(e) =>
                            setItem(item.id, { taxable: e.target.checked })
                          }
                          className="size-4 accent-gold-600"
                        />
                        {doc.taxLabel || "Tax"} applies
                      </label>
                    ) : (
                      <span />
                    )}
                    <span className="text-sm font-semibold text-navy-950 tabular-nums">
                      {formatMoney(
                        (item.qty || 0) *
                          (item.rate || 0) *
                          (1 - (item.discount || 0) / 100),
                        doc,
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <IconButton
                    label="Move up"
                    disabled={index === 0}
                    onClick={() => moveItem(index, -1)}
                  >
                    <ArrowUp className="size-3.5" aria-hidden="true" />
                  </IconButton>
                  <IconButton
                    label="Move down"
                    disabled={index === doc.items.length - 1}
                    onClick={() => moveItem(index, 1)}
                  >
                    <ArrowDown className="size-3.5" aria-hidden="true" />
                  </IconButton>
                  <IconButton
                    label="Remove item"
                    danger
                    onClick={() =>
                      setDoc((d) => ({
                        ...d,
                        items:
                          d.items.length > 1
                            ? d.items.filter((i) => i.id !== item.id)
                            : [blankItem()],
                      }))
                    }
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                  </IconButton>
                </div>
              </div>
            </li>
          ))}
        </ol>
        <button
          type="button"
          onClick={() =>
            setDoc((d) => ({ ...d, items: [...d.items, blankItem()] }))
          }
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-dashed border-navy-300 text-sm font-semibold text-navy-700 hover:border-gold-500 hover:text-gold-700"
        >
          <Plus className="size-4" aria-hidden="true" /> Add item
        </button>
        <div className="flex flex-col gap-3 border-t border-navy-100 pt-4">
          <Toggle
            label="Quantity and rate columns"
            hint="Turn off for a simple list of amounts"
            checked={doc.showQuantities}
            onChange={(v) => update({ showQuantities: v })}
          />
          <Toggle
            label="Number the items"
            checked={doc.showItemNumbers}
            onChange={(v) => update({ showItemNumbers: v })}
          />
        </div>
      </Section>

      <Section
        title="Tax, discount & totals"
        icon={Percent}
        hint={formatMoney(computeTotals(doc).total, doc)}
      >
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Tax name"
            value={doc.taxLabel}
            onChange={(v) => update({ taxLabel: v })}
          />
          <NumberField
            label="Tax rate (%)"
            value={doc.taxRate}
            onChange={(v) => update({ taxRate: Math.max(0, v) })}
          />
        </div>
        <Toggle
          label="Prices already include tax"
          hint="Tax is worked out from inside the prices instead of added on top"
          checked={doc.taxInclusive}
          onChange={(v) => update({ taxInclusive: v })}
        />
        <div className="grid grid-cols-2 gap-3">
          <SelectField
            label="Discount on total"
            value={doc.discountType}
            onChange={(v) => update({ discountType: v })}
            options={[
              { value: "percent", label: "Percent (%)" },
              { value: "amount", label: `Amount (${doc.currency})` },
            ]}
          />
          <NumberField
            label="Discount"
            value={doc.discountValue}
            onChange={(v) => update({ discountValue: Math.max(0, v) })}
          />
          <TextField
            label="Extra charge name"
            value={doc.shippingLabel}
            onChange={(v) => update({ shippingLabel: v })}
          />
          <NumberField
            label="Extra charge"
            value={doc.shipping}
            onChange={(v) => update({ shipping: Math.max(0, v) })}
          />
          {doc.kind === "invoice" || doc.kind === "proforma" ? (
            <NumberField
              label="Amount already paid"
              value={doc.amountPaid}
              onChange={(v) => update({ amountPaid: Math.max(0, v) })}
            />
          ) : null}
        </div>
        <Toggle
          label="Show cents (.00)"
          checked={doc.decimals}
          onChange={(v) => update({ decimals: v })}
        />
        <TotalsSummary doc={doc} />
      </Section>

      <Section
        title="How to pay"
        icon={Landmark}
        hint="M-Pesa, bank and other details"
        defaultOpen={doc.kind !== "receipt"}
      >
        <SelectField
          label="M-Pesa"
          value={doc.payment.mpesa}
          onChange={(v) => setPay({ mpesa: v })}
          options={[
            { value: "none", label: "Don't show M-Pesa" },
            { value: "paybill", label: "Paybill" },
            { value: "till", label: "Buy Goods (Till)" },
            { value: "phone", label: "Send Money (phone)" },
          ]}
        />
        {doc.payment.mpesa !== "none" ? (
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label={
                doc.payment.mpesa === "paybill"
                  ? "Paybill number"
                  : doc.payment.mpesa === "till"
                    ? "Till number"
                    : "Phone number"
              }
              inputMode="numeric"
              value={doc.payment.mpesaNumber}
              onChange={(v) => setPay({ mpesaNumber: v })}
            />
            {doc.payment.mpesa !== "till" ? (
              <TextField
                label={
                  doc.payment.mpesa === "paybill"
                    ? "Account number"
                    : "Registered name"
                }
                value={doc.payment.mpesaAccount}
                onChange={(v) => setPay({ mpesaAccount: v })}
              />
            ) : null}
          </div>
        ) : null}
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Bank"
            value={doc.payment.bankName}
            onChange={(v) => setPay({ bankName: v })}
          />
          <TextField
            label="Branch"
            value={doc.payment.bankBranch}
            onChange={(v) => setPay({ bankBranch: v })}
          />
          <TextField
            label="Account name"
            value={doc.payment.bankAccountName}
            onChange={(v) => setPay({ bankAccountName: v })}
          />
          <TextField
            label="Account number"
            value={doc.payment.bankAccountNumber}
            onChange={(v) => setPay({ bankAccountNumber: v })}
          />
          <TextField
            label="SWIFT code"
            value={doc.payment.swift}
            onChange={(v) => setPay({ swift: v })}
          />
        </div>
        <TextAreaField
          label="Other payment options"
          rows={2}
          placeholder="e.g. Card payments, PayPal, cheques payable to…"
          value={doc.payment.other}
          onChange={(v) => setPay({ other: v })}
        />
      </Section>

      <Section
        title="Notes, terms & signature"
        icon={PenLine}
        hint="Finishing touches"
      >
        <TextAreaField
          label="Notes"
          rows={2}
          value={doc.notes}
          onChange={(v) => update({ notes: v })}
        />
        <TextAreaField
          label="Terms & conditions"
          rows={3}
          placeholder="e.g. Payment due within 14 days. Goods remain our property until paid in full."
          value={doc.terms}
          onChange={(v) => update({ terms: v })}
        />
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-navy-700">Signature</span>
          <SignaturePad
            value={doc.signature}
            onChange={(v) => update({ signature: v })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Signed by"
            value={doc.signatoryName}
            onChange={(v) => update({ signatoryName: v })}
          />
          <TextField
            label="Role"
            placeholder="Authorised signature"
            value={doc.signatoryTitle}
            onChange={(v) => update({ signatoryTitle: v })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-navy-700">Stamp</span>
          <Segmented
            label="Stamp"
            value={doc.stamp}
            onChange={(v) => update({ stamp: v })}
            options={[
              { value: "none", label: "None" },
              { value: "paid", label: "Paid" },
              { value: "unpaid", label: "Unpaid" },
              { value: "draft", label: "Draft" },
            ]}
          />
        </div>
      </Section>

      <p className="flex items-start gap-2 px-1 text-xs leading-relaxed text-navy-500">
        <Eye className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
        Everything stays on your device. Nothing you type or upload is sent to
        Bluvig.
      </p>
    </>
  );
}

function MiniField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="truncate text-[11px] font-medium text-navy-500">
        {label}
      </span>
      {children}
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex size-7 items-center justify-center rounded-md text-navy-400 transition hover:bg-white disabled:opacity-30",
        danger ? "hover:text-red-600" : "hover:text-navy-900",
      )}
    >
      {children}
    </button>
  );
}

function TotalsSummary({ doc }: { doc: InvoiceDoc }) {
  const view = buildView(doc);
  return (
    <div className="rounded-xl bg-navy-50 p-4 text-sm">
      {view.totals.map((t) => (
        <div
          key={t.label}
          className="flex justify-between py-0.5 text-navy-600"
        >
          <span>{t.label}</span>
          <span className="tabular-nums">{t.value}</span>
        </div>
      ))}
      <div className="mt-2 flex justify-between border-t border-navy-200 pt-2 font-semibold text-navy-950">
        <span>{view.due.label}</span>
        <span className="tabular-nums">{view.due.value}</span>
      </div>
    </div>
  );
}

function TemplateThumb({
  id,
  label,
  color,
  active,
  onClick,
}: {
  id: TemplateId;
  label: string;
  color: string;
  active: boolean;
  onClick: () => void;
}) {
  const bar = (w: string, c = "#cbd6e7", h = 3) => (
    <span
      className="block rounded-full"
      style={{ width: w, height: h, background: c }}
    />
  );
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex flex-col gap-1.5 rounded-xl border bg-white p-2 text-left transition outline-none focus-visible:ring-3 focus-visible:ring-gold-400/40",
        active
          ? "border-navy-950 ring-1 ring-navy-950"
          : "border-navy-200 hover:border-navy-300",
      )}
    >
      <span
        aria-hidden="true"
        className="flex aspect-[3/4] flex-col gap-1 overflow-hidden rounded-md border border-navy-100 p-1.5"
      >
        {id === "modern" ? (
          <span
            className="-mx-1.5 -mt-1.5 mb-1 flex h-5 items-center justify-end px-1.5"
            style={{ background: color }}
          >
            {bar("40%", "rgba(255,255,255,0.85)")}
          </span>
        ) : null}
        {id === "classic" ? (
          <span className="flex justify-between">
            {bar("30%")}
            {bar("35%", color)}
          </span>
        ) : null}
        {id === "minimal" ? (
          <>
            {bar("45%", "#0d1726", 4)}
            {bar("15%", color, 2)}
          </>
        ) : null}
        {id === "classic" ? bar("100%", color, 1.5) : null}
        <span className="mt-1 flex flex-col gap-1">
          {id === "classic"
            ? bar("100%", color, 4)
            : id === "modern"
              ? bar("100%", `${color}33`, 4)
              : bar("100%", "#0d1726", 1)}
          {bar("100%")}
          {bar("100%")}
          {bar("100%")}
        </span>
        <span className="mt-auto ml-auto flex w-1/2 flex-col gap-1">
          {bar("100%")}
          {id === "classic" ? bar("100%", color, 4) : bar("100%", color, 2)}
        </span>
      </span>
      <span className="text-center text-xs font-semibold text-navy-800">
        {label}
      </span>
    </button>
  );
}
