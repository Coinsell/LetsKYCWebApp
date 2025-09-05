import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  fullscreen?: boolean; // default true
}

export function LoadingSpinner({
  className,
  size = "md",
  fullscreen = true,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center",
        fullscreen ? "min-h-screen" : "py-8",
        className
      )}
    >
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-neutral-300 border-t-primary-1",
          sizeClasses[size]
        )}
      />
    </div>
  );
}
