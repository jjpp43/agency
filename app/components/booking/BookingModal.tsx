"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useBookingModal } from "./BookingModalProvider";

const EASE = [0.22, 1, 0.36, 1] as const;

type Status = "idle" | "submitting" | "success" | "error";

export function BookingModal() {
  const { isOpen, close } = useBookingModal();
  const [status, setStatus] = useState<Status>("idle");
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => setStatus("idle"), 250);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => firstFieldRef.current?.focus(), 200);
    return () => clearTimeout(t);
  }, [isOpen]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      await new Promise((r) => setTimeout(r, 900));
      console.log("[Footnote] project inquiry", data);
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="modal-root"
          className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-modal-title"
        >
          <motion.button
            type="button"
            aria-label="Close"
            onClick={close}
            className="absolute inset-0 cursor-default bg-ink/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="relative w-full max-w-lg overflow-hidden border border-ink bg-paper sm:rounded-lg"
            initial={{ y: 32, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 24, scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE }}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center border border-line text-ink transition-colors hover:bg-ink hover:text-paper"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6l-12 12" />
              </svg>
            </button>

            <div className="relative p-7 sm:p-9">
              {status !== "success" ? (
                <FormBody onSubmit={handleSubmit} status={status} firstFieldRef={firstFieldRef} />
              ) : (
                <SuccessBody onClose={close} />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FormBody({
  onSubmit,
  status,
  firstFieldRef,
}: {
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  status: Status;
  firstFieldRef: React.RefObject<HTMLInputElement | null>;
}) {
  const submitting = status === "submitting";
  return (
    <>
      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-electric">
        [→] New project
      </span>
      <h2
        id="booking-modal-title"
        className="mt-3 font-display text-[30px] font-semibold leading-[1] tracking-tight text-ink sm:text-[36px]"
      >
        Tell us what you&apos;re building.
      </h2>
      <p className="mt-3 max-w-sm text-[14px] leading-[1.5] text-muted">
        A few details and we&apos;ll come back within two business days with a
        30-minute call and an honest take on scope.
      </p>

      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
        <Field label="Your name" name="name" required>
          <input ref={firstFieldRef} name="name" type="text" required autoComplete="name" className={inputClass} placeholder="Maya Chen" />
        </Field>
        <Field label="Work email" name="email" required>
          <input name="email" type="email" required autoComplete="email" className={inputClass} placeholder="maya@yourbrand.com" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company" name="company" required>
            <input name="company" type="text" required autoComplete="organization" className={inputClass} placeholder="Yourbrand" />
          </Field>
          <Field label="Budget" name="budget">
            <input name="budget" type="text" className={inputClass} placeholder="$10k–20k" />
          </Field>
        </div>
        <Field label="What are you building?" name="project">
          <textarea name="project" rows={3} className={`${inputClass} resize-none`} placeholder="e.g. a new marketing site for our Series A launch, plus a light rebrand." />
        </Field>

        {status === "error" && (
          <p className="text-[13px] text-electric">
            Something went wrong sending that. Email{" "}
            <a href="mailto:hello@footnote.agency" className="underline underline-offset-4">
              hello@footnote.agency
            </a>{" "}
            and we&apos;ll sort it.
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[12px] text-faint">We&apos;ll never share your details.</p>
          <button
            type="submit"
            disabled={submitting}
            className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-pill bg-ink px-6 py-2.5 text-[14px] font-medium text-paper disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span aria-hidden className="absolute inset-0 -z-10 translate-y-full bg-electric transition-transform duration-300 ease-out group-hover:translate-y-0" />
            {submitting && <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-paper/40 border-t-paper" />}
            {submitting ? "Sending…" : "Send inquiry"}
          </button>
        </div>
      </form>
    </>
  );
}

function SuccessBody({ onClose }: { onClose: () => void }) {
  return (
    <div className="text-center">
      <div aria-hidden className="mx-auto grid h-14 w-14 place-items-center bg-electric text-paper">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12l5 5 9-11" />
        </svg>
      </div>
      <h2 id="booking-modal-title" className="mt-5 font-display text-[30px] font-semibold leading-[1.05] tracking-tight text-ink">
        Got it. Talk soon.
      </h2>
      <p className="mx-auto mt-3 max-w-sm text-[15px] leading-[1.5] text-muted">
        We&apos;ll be in touch within two business days at the email you
        provided.
      </p>
      <button
        type="button"
        onClick={onClose}
        className="mt-7 inline-flex items-center justify-center gap-2 rounded-pill border border-ink px-6 py-2.5 text-[14px] font-medium text-ink transition-colors hover:bg-ink hover:text-paper"
      >
        Close
      </button>
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-line-strong bg-bone px-4 py-2.5 text-[15px] text-ink placeholder:text-faint outline-none transition focus:border-electric focus:ring-2 focus:ring-electric/25";

function Field({
  label,
  name,
  required,
  children,
}: {
  label: string;
  name: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={name} className="block">
      <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-wide text-muted">
        {label}
        {required && <span className="ml-1 text-electric">*</span>}
      </span>
      {children}
    </label>
  );
}
