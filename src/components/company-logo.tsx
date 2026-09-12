"use client";

import Image from "next/image";
import { useState } from "react";
import type { CompanyLogo as CompanyLogoData } from "@/content/portfolio";

export function CompanyLogo({ logo }: { logo: CompanyLogoData }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return null;
  }

  return (
    <Image
      className="company-logo"
      src={logo.src}
      alt={logo.alt}
      width={logo.width}
      height={logo.height}
      onError={() => setFailed(true)}
    />
  );
}
