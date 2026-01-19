"use client";

import { useState, ReactNode } from "react";
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FormFieldProps {
  label: string;
  name: string;
  type?: "text" | "email" | "password" | "textarea" | "select";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  success?: string;
  disabled?: boolean;
  options?: Array<{ value: string; label: string }>;
  rows?: number;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: string) => string | null;
  };
  icon?: ReactNode;
}

export default function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  error,
  success,
  disabled = false,
  options = [],
  rows = 4,
  validation,
  icon,
}: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const validateField = (fieldValue: string): string | null => {
    if (required && !fieldValue.trim()) {
      return `${label} is required`;
    }

    if (validation) {
      if (validation.minLength && fieldValue.length < validation.minLength) {
        return `${label} must be at least ${validation.minLength} characters`;
      }

      if (validation.maxLength && fieldValue.length > validation.maxLength) {
        return `${label} must be no more than ${validation.maxLength} characters`;
      }

      if (validation.pattern && !validation.pattern.test(fieldValue)) {
        if (type === "email") {
          return "Please enter a valid email address";
        }
        return `${label} format is invalid`;
      }

      if (validation.custom) {
        return validation.custom(fieldValue);
      }
    }

    return null;
  };

  const handleChange = (newValue: string) => {
    onChange(newValue);
    
    if (touched) {
      const validationError = validateField(newValue);
      setLocalError(validationError);
    }
  };

  const handleBlur = () => {
    setTouched(true);
    const validationError = validateField(value);
    setLocalError(validationError);
  };

  const displayError = error || localError;
  const isValid = !displayError && value.length > 0;

  const baseClasses = "w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-0";
  const stateClasses = displayError
    ? "border-red-300 bg-red-50 focus:border-red-500"
    : isValid
    ? "border-green-300 bg-green-50 focus:border-green-500"
    : "border-gray-200 bg-white focus:border-blue-500";

  const renderInput = () => {
    switch (type) {
      case "textarea":
        return (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            rows={rows}
            className={`${baseClasses} ${stateClasses} resize-none`}
          />
        );

      case "select":
        return (
          <select
            id={name}
            name={name}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            disabled={disabled}
            required={required}
            className={`${baseClasses} ${stateClasses}`}
          >
            <option value="">{placeholder || `Select ${label}`}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "password":
        return (
          <div className="relative">
            <input
              id={name}
              name={name}
              type={showPassword ? "text" : "password"}
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
              placeholder={placeholder}
              disabled={disabled}
              required={required}
              className={`${baseClasses} ${stateClasses} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        );

      default:
        return (
          <div className="relative">
            <input
              id={name}
              name={name}
              type={type}
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
              placeholder={placeholder}
              disabled={disabled}
              required={required}
              className={`${baseClasses} ${stateClasses} ${icon ? "pl-12" : ""}`}
            />
            {icon && (
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                {icon}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="space-y-2">
      <label 
        htmlFor={name}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        {renderInput()}
        
        {/* Status Icon */}
        <AnimatePresence>
          {(displayError || isValid) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {displayError ? (
                <AlertCircle className="w-5 h-5 text-red-500" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error/Success Messages */}
      <AnimatePresence>
        {displayError && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm text-red-600 flex items-center gap-1"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {displayError}
          </motion.p>
        )}
        
        {success && !displayError && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm text-green-600 flex items-center gap-1"
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            {success}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
