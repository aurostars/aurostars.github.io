"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProjectMedia } from "@/content/portfolio";

export interface ProjectImageProps {
  media: ProjectMedia;
  priority?: boolean;
  sizes: string;
  className?: string;
}

export function ProjectImage({ media, priority = false, sizes, className }: ProjectImageProps) {
  const [failed, setFailed] = useState(false);

  return (
    <span className="project-image-frame" data-image-status={failed ? "failed" : "ready"}>
      {failed ? (
        <span
          className={`project-image-fallback ${className ?? ""}`.trim()}
          role="img"
          aria-label={`${media.alt}加载失败`}
        >
          图片暂时无法显示
        </span>
      ) : (
        <Image
          className={className}
          src={media.src}
          alt={media.alt}
          width={media.width}
          height={media.height}
          sizes={sizes}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}
