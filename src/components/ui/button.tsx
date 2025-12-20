// src/components/ui/button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:border-[var(--ring)] focus-visible:ring-[var(--ring)]/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-xs hover:opacity-90",
        destructive:
          "bg-destructive text-white shadow-xs hover:opacity-90 focus-visible:ring-destructive/20",
        outline:
          "border border-[var(--foreground)] bg-[var(--background)] shadow-xs hover:bg-[var(--muted)] hover:text-[var(--foreground)]",
        secondary:
          "bg-[var(--secondary)] text-[var(--secondary-foreground)] shadow-xs hover:opacity-90",
        ghost:
          "bg-transparent hover:bg-[var(--muted)] hover:text-[var(--foreground)]",
        link:
          "bg-transparent text-[var(--primary)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 py-1.5",
        lg: "h-10 px-6 py-2",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}
