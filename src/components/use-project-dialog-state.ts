"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ProjectCase } from "@/content/portfolio";

const marker = "portfolioDialogEntry" as const;

interface PortfolioHistoryState {
  portfolioDialogEntry?: true;
}

export interface ProjectDialogState {
  selectedProject: ProjectCase | null;
  openProject: (slug: ProjectCase["slug"]) => void;
  closeProject: () => void;
}

function projectFromLocation(projects: ProjectCase[]) {
  const slug = new URLSearchParams(window.location.search).get("project");
  return slug ? projects.find((project) => project.slug === slug) ?? null : null;
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
    () => new Map(projects.map((project) => [project.slug, project])),
    [projects],
  );
  const [selectedProject, setSelectedProject] = useState<ProjectCase | null>(null);

  const syncFromLocation = useCallback(() => {
    const project = projectFromLocation(projects);
    const hasProjectSlug = new URLSearchParams(window.location.search).has("project");

    if (hasProjectSlug && !project) {
      history.replaceState(history.state, "", urlWithoutProject());
    }
    setSelectedProject(project);
  }, [projects]);

  useEffect(() => {
    syncFromLocation();
    window.addEventListener("popstate", syncFromLocation);
    return () => window.removeEventListener("popstate", syncFromLocation);
  }, [syncFromLocation]);

  const openProject = useCallback(
    (slug: ProjectCase["slug"]) => {
      const project = projectsBySlug.get(slug);
      if (!project) return;

      setSelectedProject(project);
      const state: PortfolioHistoryState = {
        ...(history.state ?? {}),
        [marker]: true,
      };
      history.pushState(state, "", urlWithProject(slug));
    },
    [projectsBySlug],
  );

  const closeProject = useCallback(() => {
    if (history.state?.[marker] === true) {
      history.back();
      return;
    }

    setSelectedProject(null);
    history.replaceState(history.state, "", urlWithoutProject());
  }, []);

  return { selectedProject, openProject, closeProject };
}
