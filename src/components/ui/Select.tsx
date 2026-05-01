"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  id: string;
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function Select({
  id,
  label,
  options,
  value,
  onChange,
  placeholder = "Select...",
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);
  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus({ preventScroll: true });
    }
  }, [isOpen]);

  // Recalculate position whenever dropdown opens or on scroll/resize
  useEffect(() => {
    if (!isOpen || !buttonRef.current) return;

    const updatePosition = () => {
      const rect = buttonRef.current!.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 6,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const dropdown = document.getElementById(`${id}-dropdown`);
      if (
        ref.current &&
        !ref.current.contains(e.target as Node) &&
        dropdown &&
        !dropdown.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [id]);

  const dropdown = isOpen && (
    <div
      id={`${id}-dropdown`}
      style={dropdownStyle}
      className="glass rounded-lg border border-border-primary shadow-lg"
    >
      {options.length > 8 && (
        <div className="border-b border-border-subtle p-2">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-border-subtle bg-bg-primary px-3 py-1.5 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-f1-red/40"
            ref={searchRef}
          />
        </div>
      )}
      <div className="max-h-60 overflow-y-auto py-1">
        {filtered.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              onChange(option.value);
              setIsOpen(false);
              setSearch("");
            }}
            className={`w-full px-3.5 py-2 text-left text-sm transition-colors hover:bg-bg-card-hover ${
              option.value === value
                ? "text-f1-red font-medium"
                : "text-text-primary"
            }`}
          >
            {option.label}
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="px-3.5 py-2 text-sm text-text-muted">
            No results found
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div ref={ref} className="relative">
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-sm font-medium text-text-secondary"
        >
          {label}
        </label>
      )}
      <button
        ref={buttonRef}
        id={id}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border border-border-primary bg-bg-card px-3.5 py-2.5 text-left text-sm transition-colors hover:border-f1-red/40 focus:border-f1-red focus:outline-none"
      >
        <span className={selected ? "text-text-primary" : "text-text-muted"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {typeof window !== "undefined" && createPortal(dropdown, document.body)}
    </div>
  );
}
