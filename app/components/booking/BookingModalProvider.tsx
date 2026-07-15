"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { BookingModal } from "./BookingModal";

type Ctx = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const BookingModalCtx = createContext<Ctx | null>(null);

export function BookingModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  // Lock body scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  return (
    <BookingModalCtx.Provider value={{ isOpen, open, close }}>
      {children}
      <BookingModal />
    </BookingModalCtx.Provider>
  );
}

export function useBookingModal(): Ctx {
  const ctx = useContext(BookingModalCtx);
  if (!ctx) {
    throw new Error(
      "useBookingModal must be used inside <BookingModalProvider>",
    );
  }
  return ctx;
}
