import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { createHash, randomBytes } from "node:crypto";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function get_sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function generate_device_key(): string {
  return randomBytes(64).toString("hex");
}