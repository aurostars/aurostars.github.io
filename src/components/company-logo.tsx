"use client";

import Image from "next/image";
import { useState } from "react";
import type { CompanyLogo as CompanyLogoData } from "@/content/portfolio";

export function CompanyLogo({ logo }: { logo: CompanyLogoData }) {
  const [failed, setFailed] = useState(false);

  const plateTone = logo.src.endsWith("/bytedance.svg") ? "dark" : "light";

  return (
    <span className="company-logo-plate" data-logo-plate={plateTone}>
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
