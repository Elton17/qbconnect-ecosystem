import { useEffect } from "react";

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} · QBCAMP Conecta+`;
    return () => { document.title = "QBCAMP Conecta+"; };
  }, [title]);
}
