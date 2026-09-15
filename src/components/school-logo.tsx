"use client";

import Image from "next/image";
import { useState } from "react";
import type { SchoolLogo as SchoolLogoData } from "@/content/portfolio";

export function SchoolLogo({ logo }: { logo: SchoolLogoData }) {
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    <Image
      className="school-logo"
      src={logo.src}
      alt={logo.alt}
      width={logo.width}
      height={logo.height}
      onError={() => setFailed(true)}
    />
  );
}
