import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: (string | undefined | null | boolean)[]) {
  return twMerge(clsx(inputs))
}

export type VariantProps<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? Parameters<T[K]>[0] : never
}[keyof T]