import { Code2 } from "lucide-react";

export default function Footer() {
  return (
    <footer
      id="site-footer"
      className="border-t-4 border-f1-red bg-bg-card py-8"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-12 items-center justify-center bg-f1-red text-white skew-btn shadow-[0_0_10px_rgba(225,6,0,0.3)]">
              <span className="text-sm font-black italic tracking-tighter heading-font">
                R-F1
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-widest text-text-primary heading-font">
                R-F1 Platform
              </span>
              <span className="text-[9px] font-medium tracking-[0.2em] text-f1-red">
                REZ3X-F1 © {new Date().getFullYear()}
              </span>
            </div>
          </div>

          <div className="text-center sm:text-right">
            <p className="text-xs text-text-secondary flex flex-wrap items-center justify-center sm:justify-end gap-1.5">
              <span>Created by</span>
              <a
                href="https://rejaka.id"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-text-primary underline decoration-f1-red/40 underline-offset-2 transition-colors hover:text-f1-red hover:decoration-f1-red"
              >
                REZ3X
              </a>
              <span className="mx-1 text-text-muted">•</span>
              <span>Data by</span>
              <a
                href="https://github.com/jolpica/jolpica-f1"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-text-primary underline decoration-f1-red/40 underline-offset-2 transition-colors hover:text-f1-red hover:decoration-f1-red"
              >
                Jolpica API
              </a>
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-wider text-text-muted">
              Licensed under CC BY-NC-SA 4.0 · Non-commercial use only
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
