"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, type KeyboardEvent, type PointerEvent, type RefObject, type SyntheticEvent } from "react";
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
  const wasOpenRef = useRef(false);
  const backdropPointerDownRef = useRef(false);
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (project) {
      if (!dialog.open) dialog.showModal();
      closeButtonRef.current?.focus();
    } else if (wasOpenRef.current) {
      if (dialog.open) dialog.close();
      const focusTarget = returnFocusTo?.isConnected ? returnFocusTo : fallbackFocusRef.current;
      focusTarget?.focus();
    }

    wasOpenRef.current = Boolean(project);
  }, [fallbackFocusRef, project, returnFocusTo]);

  useEffect(() => {
    if (!project) return;

    const { overflow, paddingRight } = document.body.style;
    const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    const currentPadding = Number.parseFloat(window.getComputedStyle(document.body).paddingRight) || 0;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;

    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, [project]);

  function handleCancel(event: SyntheticEvent<HTMLDialogElement>) {
    event.preventDefault();
    onClose();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "Escape") return;
    event.preventDefault();
    onClose();
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
      <AnimatePresence>
        {project ? (
          <motion.div
            className="case-dialog-panel"
            initial={initial}
            animate={animate}
            transition={transition}
          >
            <header className="case-dialog-header">
              <h2 id="case-dialog-title">{project.title}</h2>
              <button
                ref={closeButtonRef}
                type="button"
                aria-label={`关闭${project.title}详情`}
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
