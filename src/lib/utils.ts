import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const DIACRITICS = /[̀-ͯ]/g;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(input: string): string {
  return (input || "cliente")
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
