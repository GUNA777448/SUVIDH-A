import { useEffect, useRef } from "react";
import { cn } from "../../lib/utils";

type OtpInputProps = {
  value: string;
  length?: number;
  onChange: (value: string) => void;
};

export function OtpInput({ value, onChange, length = 6 }: OtpInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    refs.current = refs.current.slice(0, length);
  }, [length]);

  const updateAt = (index: number, char: string) => {
    const next = value.split("");
    next[index] = char;
    const joined = next.join("").slice(0, length);
    onChange(joined);
  };

  return (
    <div className="grid grid-cols-6 gap-2">
      {Array.from({ length }).map((_, index) => {
        const char = value[index] ?? "";

        return (
          <input
            key={index}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={char}
            onChange={(event) => {
              const digit = event.target.value.replace(/\D/g, "").slice(-1);
              updateAt(index, digit);
              if (digit && index < length - 1) {
                refs.current[index + 1]?.focus();
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Backspace" && !char && index > 0) {
                refs.current[index - 1]?.focus();
              }
              if (event.key === "ArrowLeft" && index > 0) {
                refs.current[index - 1]?.focus();
              }
              if (event.key === "ArrowRight" && index < length - 1) {
                refs.current[index + 1]?.focus();
              }
            }}
            className={cn(
              "h-12 w-full rounded-xl border border-slate-300 bg-white/90 text-center text-lg font-semibold text-slate-900",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f6aa5]/35 focus-visible:border-[#1f6aa5]",
            )}
          />
        );
      })}
    </div>
  );
}
