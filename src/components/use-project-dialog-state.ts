"use client";

import { useCallback, useMemo, useRef, useSyncExternalStore } from "react";
import type { ProjectCase } from "@/content/portfolio";

const marker = "portfolioDialogEntry" as const;

type StoreListener = () => void;

interface PortfolioHistoryState {
  portfolioDialogEntry?: true;
}

export interface ProjectDialogState {
  selectedProject: ProjectCase | null;
  openProject: (slug: ProjectCase["slug"]) => void;
  closeProject: () => void;
}

function projectSlugFromLocation() {
  return new URLSearchParams(window.location.search).get("project");
}

function urlWithoutProject() {
  const url = new URL(window.location.href);
  url.searchParams.delete("project");
  return `${url.pathname}${url.search}${url.hash}`;
}

function urlWithProject(slug: ProjectCase["slug"]) {
  const url = new URL(window.location.href);
  url.searchParams.set("project", slug);
  return `${url.pathname}${url.search}${url.hash}`;
}

export function useProjectDialogState(projects: ProjectCase[]): ProjectDialogState {
  const projectsBySlug = useMemo(
    () => new Map<string, ProjectCase>(projects.map((project) => [project.slug, project])),
    [projects],
  );
  const listeners = useRef(new Set<StoreListener>());

  const projectFromLocation = useCallback(() => {
    const slug = projectSlugFromLocation();
    return slug ? projectsBySlug.get(slug) ?? null : null;
  }, [projectsBySlug]);

  const cleanInvalidProject = useCallback(() => {
    const slug = projectSlugFromLocation();
    if (slug !== null && !projectsBySlug.has(slug)) {
      history.replaceState(history.state, "", urlWithoutProject());
    }
  }, [projectsBySlug]);

  const subscribe = useCallback(
    (listener: StoreListener) => {
      listeners.current.add(listener);
      cleanInvalidProject();

      const handlePopState = () => {
        cleanInvalidProject();
        listener();
      };
      window.addEventListener("popstate", handlePopState);

      return () => {
        listeners.current.delete(listener);
        window.removeEventListener("popstate", handlePopState);
      };
    },
    [cleanInvalidProject],
  );

  const selectedProject = useSyncExternalStore(subscribe, projectFromLocation, () => null);

  const notifyListeners = useCallback(() => {
    listeners.current.forEach((listener) => listener());
  }, []);

  const openProject = useCallback(
    (slug: ProjectCase["slug"]) => {
      if (!projectsBySlug.has(slug)) return;

      const state: PortfolioHistoryState = {
        ...(history.state ?? {}),
        [marker]: true,
      };
      history.pushState(state, "", urlWithProject(slug));
      notifyListeners();
    },
    [notifyListeners, projectsBySlug],
  );

  const closeProject = useCallback(() => {
    if (history.state?.[marker] === true) {
      history.back();
      return;
    }

    history.replaceState(history.state, "", urlWithoutProject());
    notifyListeners();
  }, [notifyListeners]);

  return { selectedProject, openProject, closeProject };
}
