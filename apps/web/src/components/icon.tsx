import { HugeiconsIcon, type HugeiconsIconProps } from "@hugeicons/react";

export function Icon({ className, ...props }: HugeiconsIconProps) {
  return <HugeiconsIcon {...props} className={className} size={20} strokeWidth={1.8} />;
}
