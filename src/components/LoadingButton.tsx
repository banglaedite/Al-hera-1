import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../lib/utils";

interface LoadingButtonProps {
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  onClick?: (e: any) => void;
  disabled?: boolean;
}

export const LoadingButton = ({ 
  loading, 
  icon, 
  children, 
  className, 
  disabled, 
  type = "button",
  onClick,
  ...props 
}: LoadingButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={cn(
        "relative flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    >
      {loading && <div className="relative flex justify-center items-center w-5 h-5">
  <div className="absolute inset-0 rounded-full border-2 border-emerald-100/30"></div>
  <div className="absolute inset-0 rounded-full border-t-2 border-t-emerald-500 border-b-2 border-b-rose-500 animate-spin"></div>
</div>}
      {!loading && icon}
      <span>{children}</span>
    </button>
  );
};
