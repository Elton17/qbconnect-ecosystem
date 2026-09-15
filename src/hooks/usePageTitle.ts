import { useEffect } from "react";

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} | QBCAMP Conecta Mais`;
    return () => { document.title = "QBCAMP Conecta Mais"; };
  }, [title]);
}
