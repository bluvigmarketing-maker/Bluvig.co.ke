"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export const inputClass =
  "h-10 w-full min-w-0 rounded-lg border border-navy-200 bg-white px-3 text-sm text-navy-950 shadow-[0_1px_0_rgba(13,23,38,0.03)] outline-none transition placeholder:text-navy-400 focus:border-gold-500 focus:ring-3 focus:ring-gold-400/25";

export function Section({
  title,
  icon: Icon,
  hint,
  defaultOpen = true,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  hint?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-2xl border border-navy-100 bg-white shadow-sm"
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 select-none [&::-webkit-details-marker]:hidden">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-navy-950 text-white">
          <Icon className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-navy-950">{title}</span>
          {hint ? (
            <span className="block truncate text-xs text-navy-500">{hint}</span>
          ) : null}
        </span>
        <ChevronDown
          className="size-4 text-navy-400 transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="flex flex-col gap-4 border-t border-navy-100 px-5 py-5">
        {children}
      </div>
    </details>
  );
}

export function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: (id: string) => ReactNode;
}) {
  const id = useId();
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-xs font-semibold text-navy-700">
        {label}
      </label>
      {children(id)}
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  className,
  ...rest
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <Field label={label} className={className}>
      {(id) => (
        <input
          id={id}
          className={inputClass}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          {...rest}
        />
      )}
    </Field>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  rows = 3,
  className,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  className?: string;
  placeholder?: string;
}) {
  return (
    <Field label={label} className={className}>
      {(id) => (
        <textarea
          id={id}
          rows={rows}
          className={cn(inputClass, "h-auto resize-y py-2 leading-relaxed")}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </Field>
  );
}

/** Parses "12,500.50" as 12500.5; keeps what the person typed while they type. */
export function NumberInput({
  value,
  onChange,
  className,
  id,
  placeholder = "0",
  ariaLabel,
}: {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  id?: string;
  placeholder?: string;
  ariaLabel?: string;
}) {
  const [text, setText] = useState(value ? String(value) : "");
  const parsed = parseFloat(text.replace(/,/g, "")) || 0;
  // Changed from outside (e.g. picking a saved item): show the new value.
  const shown = parsed === (value || 0) ? text : value ? String(value) : "";
  return (
    <input
      id={id}
      inputMode="decimal"
      aria-label={ariaLabel}
      className={cn(inputClass, "text-right tabular-nums", className)}
      value={shown}
      placeholder={placeholder}
      onChange={(e) => {
        const next = e.target.value.replace(/[^\d.,-]/g, "");
        setText(next);
        onChange(parseFloat(next.replace(/,/g, "")) || 0);
      }}
    />
  );
}

export function NumberField({
  label,
  value,
  onChange,
  className,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  className?: string;
}) {
  return (
    <Field label={label} className={className}>
      {(id) => <NumberInput id={id} value={value} onChange={onChange} />}
    </Field>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  className?: string;
}) {
  return (
    <Field label={label} className={className}>
      {(id) => (
        <select
          id={id}
          className={cn(inputClass, "appearance-auto pr-2")}
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4">
      <span className="min-w-0">
        <span className="block text-sm font-medium text-navy-900">{label}</span>
        {hint ? (
          <span className="block text-xs text-navy-500">{hint}</span>
        ) : null}
      </span>
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="h-5 w-9 rounded-full bg-navy-200 transition peer-checked:bg-gold-500 peer-focus-visible:ring-3 peer-focus-visible:ring-gold-400/40" />
        <span className="absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow transition peer-checked:translate-x-4" />
      </span>
    </label>
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  label: string;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "grid auto-cols-fr grid-flow-col gap-1 rounded-xl bg-navy-50 p-1",
        className,
      )}
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "h-9 rounded-lg px-2 text-sm font-medium text-navy-600 transition outline-none focus-visible:ring-3 focus-visible:ring-gold-400/40",
            value === o.value
              ? "bg-white text-navy-950 shadow-sm"
              : "hover:text-navy-950",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
