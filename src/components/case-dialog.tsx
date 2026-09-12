"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type RefObject, type SyntheticEvent } from "react";
import { CaseDetail } from "@/components/case-detail";
import { entranceEase } from "@/components/motion/motion-config";
import { usePrefersReducedMotion } from "@/components/motion/use-prefers-reduced-motion";
import type { ProjectCase } from "@/content/portfolio";

export interface CaseDialogProps {
  project: ProjectCase | null;
  onClose: () => void;
  returnFocusTo: HTMLElement | null;
  fallbackFocusRef: RefObject<HTMLElement | null>;
}

export function CaseDialog({ project, onClose, returnFocusTo, fallbackFocusRef }: CaseDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const backdropPointerDownRef = useRef(false);
  const projectRef = useRef<ProjectCase | null>(project);
  const [dialogActive, setDialogActive] = useState(Boolean(project));
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    projectRef.current = project;
  }, [project]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !project) return;

    setDialogActive(true);
    if (!dialog.open) dialog.showModal();
    closeButtonRef.current?.focus();
  }, [project]);

  useEffect(() => {
    if (!dialogActive) return;

    const { overflow, paddingRight } = document.body.style;
    const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    const currentPadding = Number.parseFloat(window.getComputedStyle(document.body).paddingRight) || 0;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;

    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [dialogActive]);

  function finishExit() {
    if (projectRef.current) return;

    const dialog = dialogRef.current;
    if (dialog?.open) dialog.close();
    setDialogActive(false);
    const focusTarget = returnFocusTo?.isConnected ? returnFocusTo : fallbackFocusRef.current;
    focusTarget?.focus();
  }

  function handleCancel(event: SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault();
    onClose();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "Tab") return;

    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )).filter((element) => !element.hasAttribute("hidden"));
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first || !last) return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function handleBackdropPointerDown(event: PointerEvent<HTMLDialogElement>) {
    backdropPointerDownRef.current = event.target === event.currentTarget;
  }

  function handleBackdropPointerUp(event: PointerEvent<HTMLDialogElement>) {
    const endedOnBackdrop = event.target === event.currentTarget;
    const startedOnBackdrop = backdropPointerDownRef.current;
    backdropPointerDownRef.current = false;
    if (startedOnBackdrop && endedOnBackdrop) onClose();
  }

  const initial = reduce ? false : { opacity: 0, y: 12 };
  const animate = { opacity: 1, y: 0 };
  const exit = reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 };
  const transition = { duration: reduce ? 0 : 0.25, ease: entranceEase };

  return (
    <dialog
      ref={dialogRef}
      className="case-dialog"
      aria-labelledby="case-dialog-title"
      onCancel={handleCancel}
      onKeyDown={handleKeyDown}
      onPointerDown={handleBackdropPointerDown}
      onPointerUp={handleBackdropPointerUp}
    >
      <AnimatePresence mode="wait" onExitComplete={finishExit}>
        {project ? (
          <motion.div
            key={project.slug}
            className="case-dialog-panel"
            initial={initial}
            animate={animate}
            exit={exit}
            transition={transition}
          >
            <header className="case-dialog-header">
              <div className="case-dialog-heading">
                <h2 id="case-dialog-title">{project.title}</h2>
                <p>{project.summary}</p>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                aria-label={`关闭${project.title}详情`}
                autoFocus
                onClick={onClose}
              >
                关闭
              </button>
            </header>
            <div className="case-dialog-scroll">
              <CaseDetail project={project} />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </dialog>
  );
}
