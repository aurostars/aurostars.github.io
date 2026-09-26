"use client";

import { useEffect, useRef, useState } from "react";

const destinations = [
  ["关于", "#about"],
  ["履历", "#experience"],
  ["项目", "#cases"],
  ["联系", "#contact"],
] as const;

export function SiteMenu() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    navRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  function close({ restoreFocus = false } = {}) {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      close({ restoreFocus: true });
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = [
      ...(navRef.current?.querySelectorAll<HTMLAnchorElement>("a") ?? []),
      triggerRef.current,
    ].filter(Boolean) as HTMLElement[];
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="garden-menu-trigger"
        aria-label={open ? "关闭菜单" : "打开菜单"}
        aria-expanded={open}
        aria-controls="garden-menu"
        onClick={() => setOpen((value) => !value)}
      >
        <span>{open ? "关闭" : "菜单"}</span>
        <span className="garden-menu-glyph" aria-hidden="true">
          <i />
          <i />
        </span>
      </button>
      {open ? (
        <div className="garden-menu-overlay">
          <nav
            ref={navRef}
            id="garden-menu"
            className="garden-menu"
            aria-label="主页导航"
            onKeyDown={handleKeyDown}
          >
            <p>目录</p>
            <div className="garden-menu-links">
              {destinations.map(([label, href]) => (
                <a key={href} href={href} aria-label={label} onClick={() => close()}>
                  <span>{label}</span>
                  <small>{href.replace("#", "")}</small>
                </a>
              ))}
            </div>
            <div className="garden-menu-contact">
              <a href="mailto:dst3056@qq.com">dst3056@qq.com</a>
              <a href="https://github.com/aurostars" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            </div>
          </nav>
        </div>
      ) : null}
    </>
  );
}
