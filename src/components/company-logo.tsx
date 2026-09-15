"use client";

import Image from "next/image";
import { useState } from "react";
import type { CompanyLogo as CompanyLogoData } from "@/content/portfolio";

export function CompanyLogo({ logo }: { logo: CompanyLogoData }) {
  const [failed, setFailed] = useState(false);

  return (
    <span className="company-logo-plate" data-logo-plate="light">
      {failed ? null : (
        <Image
          className="company-logo"
          src={logo.src}
          alt={logo.alt}
          width={logo.width}
          height={logo.height}
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}
