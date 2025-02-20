"use client";

import { Button } from "@/components/ui/button";
import { Input, type InputProps } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import * as React from "react";

const PasswordInput = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const disabled = props.value === "" || props.value === undefined || props.disabled;

  return (
    <div className="relative">
      <Input
        className={cn("hide-password-toggle pr-10", className)}
        ref={ref}
        type={showPassword ? "text" : "password"}
        {...props}
      />
      <Button
        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
        disabled={disabled}
        onClick={() => setShowPassword((prev) => !prev)}
        size="sm"
        type="button"
        variant="ghost"
      >
        {showPassword && !disabled ? (
          <EyeIcon
            aria-hidden="true"
            className="h-4 w-4"
          />
        ) : (
          <EyeOffIcon
            aria-hidden="true"
            className="h-4 w-4"
          />
        )}
        <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
      </Button>

      {/* hides browsers password toggles */}
      <style>{`
					.hide-password-toggle::-ms-reveal,
					.hide-password-toggle::-ms-clear {
						visibility: hidden;
						pointer-events: none;
						display: none;
					}
				`}</style>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
