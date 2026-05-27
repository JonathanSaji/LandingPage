import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      variant: {
        default: "border-[#FFD700]/40 bg-[#FFD700]/10 text-[#FFD700]",
        outline: "border-white/20 text-white/70",
        completed: "border-[#10B981]/40 bg-[#10B981]/10 text-[#10B981]",
        progress: "border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B]",
        pending: "border-white/20 bg-white/5 text-white/40",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
