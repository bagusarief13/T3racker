"use client";

import React, { useState, useEffect } from "react";
import { normalizeTimeString } from "@/lib/time-calc";

export interface TimeInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export const TimeInput = React.forwardRef<HTMLInputElement, TimeInputProps>(
  (
    {
      value,
      onChange,
      className = "",
      placeholder = "HH:mm",
      onBlur,
      onKeyDown,
      onPaste,
      ...rest
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = useState(value || "");

    useEffect(() => {
      setDisplayValue(value || "");
    }, [value]);

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      if (onPaste) onPaste(e);
      if (e.defaultPrevented) return;

      const pastedText = e.clipboardData.getData("text");
      const normalized = normalizeTimeString(pastedText);
      if (normalized) {
        e.preventDefault();
        setDisplayValue(normalized);
        onChange(normalized);
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value;

      // 1. If input was cleared completely
      if (!val) {
        setDisplayValue("");
        onChange("");
        return;
      }

      // Convert Indonesian dot separator to colon (e.g. 08.30 -> 08:30)
      val = val.replace(/\./g, ":");

      // 2. Check if it's a pasted or multi-char input (e.g. "08:09:31" or ISO timestamp)
      if (val.length > 5 || (val.match(/:/g) || []).length > 1) {
        const normalized = normalizeTimeString(val);
        if (normalized) {
          setDisplayValue(normalized);
          onChange(normalized);
          return;
        }
      }

      // 3. Filter characters: only allow digits and at most one colon
      let filtered = "";
      let colonCount = 0;
      for (const char of val) {
        if (/\d/.test(char)) {
          filtered += char;
        } else if (char === ":" && colonCount === 0) {
          filtered += char;
          colonCount++;
        }
      }

      // 4. Auto-format 4 digits without colon (e.g. "2200" -> "22:00", "0830" -> "08:30")
      const digitsOnly = filtered.replace(/\D/g, "");
      if (digitsOnly.length === 4 && !filtered.includes(":")) {
        const norm = normalizeTimeString(digitsOnly);
        if (norm) {
          setDisplayValue(norm);
          onChange(norm);
          return;
        }
      }

      // 5. If user typed full time with colon e.g. "8:30" or "08:30" (2 minute digits)
      if (filtered.includes(":")) {
        const parts = filtered.split(":");
        if (parts.length === 2 && parts[1].length === 2 && parts[0].length >= 1) {
          const norm = normalizeTimeString(filtered);
          if (norm) {
            setDisplayValue(norm);
            onChange(norm);
            return;
          }
        }
      }

      // 6. Enforce max length of 5 chars while typing
      if (filtered.length > 5) {
        const norm = normalizeTimeString(filtered);
        if (norm) {
          setDisplayValue(norm);
          onChange(norm);
          return;
        }
        filtered = filtered.slice(0, 5);
      }

      setDisplayValue(filtered);
      onChange(filtered);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (onBlur) onBlur(e);

      if (!displayValue.trim()) {
        setDisplayValue("");
        onChange("");
        return;
      }

      const norm = normalizeTimeString(displayValue);
      if (norm) {
        setDisplayValue(norm);
        onChange(norm);
      } else {
        // Fallback to value or empty
        setDisplayValue(value || "");
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (onKeyDown) onKeyDown(e);
      if (e.key === "Enter") {
        e.currentTarget.blur();
      }
    };

    return (
      <input
        ref={ref}
        type="text"
        value={displayValue}
        placeholder={placeholder}
        onChange={handleChange}
        onPaste={handlePaste}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={className}
        {...rest}
      />
    );
  }
);

TimeInput.displayName = "TimeInput";
