"use client";

import { useId, useState, type HTMLAttributes } from "react";

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
  placeholder?: string;
};

/** Stacked label + glass input — dcapital / clean iOS auth field */
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
  placeholder,
}: FloatingFieldProps) {
  const id = useId();
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputType = passwordToggle ? (show ? "text" : "password") : type;

  return (
    <label
      htmlFor={id}
      className={`auth-field-stack ${focused ? "is-focus" : ""} ${error ? "is-error" : ""}`}
    >
      <span className="auth-field-stack__label">{label}</span>
      <div className={`auth-field-stack__control ${passwordToggle ? "has-eye" : ""}`}>
        <input
          id={id}
          className="auth-field-stack__input"
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={(e) => {
            setFocused(true);
            // Keep field visible above the keyboard on iOS Safari/Chrome
            window.setTimeout(() => {
              try {
                e.target.scrollIntoView({ block: "center", behavior: "smooth" });
              } catch {
                /* noop */
              }
            }, 80);
          }}
          onBlur={() => setFocused(false)}
          autoComplete={autoComplete || (passwordToggle ? "current-password" : undefined)}
          inputMode={inputMode}
          disabled={disabled}
          placeholder={placeholder}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
        />
        {passwordToggle && (
          <button
            type="button"
            className="auth-field-stack__eye press"
            aria-label={show ? "Нууц үг нуух" : "Нууц үг харуулах"}
            onMouseDown={(ev) => ev.preventDefault()}
            onClick={() => setShow((v) => !v)}
            tabIndex={-1}
          >
            {show ? "Нуух" : "Харах"}
          </button>
        )}
      </div>
      {error ? <p className="auth-field-stack__error">{error}</p> : null}
    </label>
  );
}
