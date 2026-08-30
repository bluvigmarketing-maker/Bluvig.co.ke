"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const selectClass =
  "rounded-lg border border-navy-200 bg-white px-3 py-2 text-sm text-navy-900 outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-400/40";

const textareaClass =
  "rounded-lg border border-navy-200 px-3 py-2 text-sm outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-400/40";

export function GetStartedForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Something went wrong — please try again.");
        setLoading(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Could not reach the server — please try again.");
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-navy-100 bg-navy-50 p-10 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-gold-100 text-gold-700">
          <CheckCircle2 className="size-6" aria-hidden="true" />
        </span>
        <h2 className="font-heading text-xl font-semibold text-navy-950">
          Thanks — we&rsquo;ve got it.
        </h2>
        <p className="max-w-sm text-sm text-navy-700">
          Someone from Bluvig will reach out shortly with next steps. If it&rsquo;s
          urgent, call or WhatsApp us directly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name" className="text-sm font-medium text-navy-900">
            Full Name
          </Label>
          <Input id="name" name="name" required placeholder="Jane Doe" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email" className="text-sm font-medium text-navy-900">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="jane@business.co.ke"
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone" className="text-sm font-medium text-navy-900">
            Phone / WhatsApp
          </Label>
          <Input id="phone" name="phone" type="tel" placeholder="+254 7XX XXX XXX" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="businessType"
            className="text-sm font-medium text-navy-900"
          >
            Business Type
          </Label>
          <select id="businessType" name="businessType" className={selectClass} defaultValue="">
            <option value="" disabled>
              Select one
            </option>
            <option>E-commerce / Retail</option>
            <option>Professional Services</option>
            <option>Hospitality / Travel</option>
            <option>Real Estate</option>
            <option>Other</option>
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="goal" className="text-sm font-medium text-navy-900">
            Main Goal
          </Label>
          <select id="goal" name="goal" className={selectClass} defaultValue="">
            <option value="" disabled>
              Select one
            </option>
            <option>Get found on Google</option>
            <option>Get more leads / enquiries</option>
            <option>Build a new website</option>
            <option>Learn digital marketing</option>
            <option>Something else</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="budget" className="text-sm font-medium text-navy-900">
            Rough Budget (KES)
          </Label>
          <select id="budget" name="budget" className={selectClass} defaultValue="">
            <option value="" disabled>
              Select one
            </option>
            <option>Under 50,000</option>
            <option>50,000 – 150,000</option>
            <option>150,000 – 500,000</option>
            <option>500,000+</option>
            <option>Not sure yet</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="message" className="text-sm font-medium text-navy-900">
          Tell us a bit more (optional)
        </Label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className={textareaClass}
          placeholder="What's going on with your business online right now?"
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button
        type="submit"
        size="lg"
        disabled={loading}
        className="btn-metallic gold-line mt-2 w-fit font-semibold"
      >
        {loading ? "Sending…" : "Send My Details"}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Button>
    </form>
  );
}
