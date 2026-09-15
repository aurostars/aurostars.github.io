import { useEffect, useState } from "react";

export function useFinePointer() {
  const [isFinePointer, setIsFinePointer] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    const updatePointerCapability = () => setIsFinePointer(query.matches);

    updatePointerCapability();
    query.addEventListener("change", updatePointerCapability);

    return () => query.removeEventListener("change", updatePointerCapability);
  }, []);

  return isFinePointer;
}
