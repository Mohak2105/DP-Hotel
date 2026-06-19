import { useState, useRef, forwardRef } from "react";
import "./TextField.css";

const TextField = forwardRef(({
  label,
  icon: Icon,
  type = "text",
  placeholder = "",
  value,
  onChange,
  required = false,
  className = "",
  error = "",
  maxLength,
  disabled = false,
  readOnly = false,
  id,
  name,
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);
  const combinedRef = ref || inputRef;

  const hasValue = value !== undefined && value !== null && value !== "";
  const isActive = focused || hasValue;

  return (
    <div className={`textfield-root ${className} ${focused ? "textfield-focused" : ""} ${error ? "textfield-error" : ""} ${disabled ? "textfield-disabled" : ""}`}>
      {label && (
        <label 
          className={`textfield-label ${isActive ? "textfield-label-active" : ""}`}
          onClick={() => combinedRef.current?.focus()}
        >
          {Icon && <Icon size={14} className="textfield-label-icon" />}
          <span>{label}{required && <span className="textfield-required"> *</span>}</span>
        </label>
      )}
      <div className="textfield-input-wrapper">
        {Icon && !label && <Icon size={18} className="textfield-icon" />}
        <input
          ref={combinedRef}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          maxLength={maxLength}
          disabled={disabled}
          readOnly={readOnly}
          id={id}
          name={name}
          className="textfield-input"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        <div className="textfield-highlight" />
      </div>
      {error && <span className="textfield-error-text">{error}</span>}
    </div>
  );
});

TextField.displayName = "TextField";

const TextArea = forwardRef(({
  label,
  icon: Icon,
  placeholder = "",
  value,
  onChange,
  required = false,
  className = "",
  error = "",
  rows = 4,
  disabled = false,
  id,
  name,
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef(null);
  const combinedRef = ref || textareaRef;

  const hasValue = value !== undefined && value !== null && value !== "";
  const isActive = focused || hasValue;

  return (
    <div className={`textfield-root textarea-root ${className} ${focused ? "textfield-focused" : ""} ${error ? "textfield-error" : ""} ${disabled ? "textfield-disabled" : ""}`}>
      {label && (
        <label 
          className={`textfield-label ${isActive ? "textfield-label-active" : ""}`}
          onClick={() => combinedRef.current?.focus()}
        >
          {Icon && <Icon size={14} className="textfield-label-icon" />}
          <span>{label}{required && <span className="textfield-required"> *</span>}</span>
        </label>
      )}
      <div className="textfield-input-wrapper textarea-wrapper">
        <textarea
          ref={combinedRef}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          rows={rows}
          disabled={disabled}
          id={id}
          name={name}
          className="textfield-input textfield-textarea"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        <div className="textfield-highlight" />
      </div>
      {error && <span className="textfield-error-text">{error}</span>}
    </div>
  );
});

TextArea.displayName = "TextArea";

export { TextField, TextArea };
export default TextField;
