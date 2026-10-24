"use client";

import { useId, useState, type HTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

type FloatingFieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  disabled?: boolean;
  passwordToggle?: boolean;
  error?: string;
};

export default function FloatingField({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  inputMode,
  disabled,
  passwordToggle,
  error,
}: FloatingFieldProps) {
  const id = useId();
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;
  const inputType = passwordToggle ? (show ? "text" : "password") : type;

  return (
    <div className={`auth-field ${focused ? "is-focus" : ""} ${error ? "is-error" : ""}`}>
      <label htmlFor={id} className={`auth-field__label ${floated ? "is-float" : ""}`}>
        {label}
      </label>
      <input
        id={id}
        className="auth-field__input"
        type={inputType}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete={autoComplete}
        inputMode={inputMode}
        disabled={disabled}
      />
      {passwordToggle && (
        <button
          type="button"
          className="auth-field__eye press"
          aria-label={show ? "Нууц үг нуух" : "Нууц үг харуулах"}
          onClick={() => setShow((v) => !v)}
          tabIndex={-1}
        >
          {show ? <EyeOff size={20} strokeWidth={1.75} /> : <Eye size={20} strokeWidth={1.75} />}
        </button>
      )}
      {error ? <p className="auth-field__error">{error}</p> : null}
    </div>
  );
}
