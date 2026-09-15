import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_NAME = "QBCAMP Conecta Mais";
const SITE_URL = "https://conectamais.qbcamp.com.br";
const DEFAULT_DESCRIPTION = "Conecte sua empresa ao futuro dos negócios regionais.";

export interface SeoProps {
  title: string;
  description?: string | null;
  canonicalPath?: string;
  image?: string | null;
  noindex?: boolean;
  type?: "website" | "article" | "product";
  structuredData?: Record<string, unknown> | Array<Record<string, unknown>> | null;
}

function upsertMeta(selector: string, attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

function absoluteUrl(pathOrUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}

export function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  canonicalPath,
  image,
  noindex = false,
  type = "website",
  structuredData,
}: SeoProps) {
  const location = useLocation();

  useEffect(() => {
    const pageDescription = (description || DEFAULT_DESCRIPTION).replace(/\s+/g, " ").trim().slice(0, 160);
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    const canonical = absoluteUrl(canonicalPath || location.pathname);

    document.title = fullTitle;
    upsertMeta('meta[name="description"]', "name", "description", pageDescription);
    upsertMeta('meta[name="robots"]', "name", "robots", noindex ? "noindex, nofollow" : "index, follow");
    upsertMeta('meta[property="og:title"]', "property", "og:title", fullTitle);
    upsertMeta('meta[property="og:description"]', "property", "og:description", pageDescription);
    upsertMeta('meta[property="og:type"]', "property", "og:type", type);
    upsertMeta('meta[property="og:url"]', "property", "og:url", canonical);
    upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", fullTitle);
    upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", pageDescription);

    let canonicalElement = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalElement) {
      canonicalElement = document.createElement("link");
      canonicalElement.rel = "canonical";
      document.head.appendChild(canonicalElement);
    }
    canonicalElement.href = canonical;

    const socialImage = image && /^https:\/\//i.test(image) ? image : null;
    const imageSelectors = ['meta[property="og:image"]', 'meta[name="twitter:image"]'];
    imageSelectors.forEach((selector) => {
      const existing = document.head.querySelector(selector);
      if (socialImage) {
        const isTwitter = selector.includes("twitter");
        upsertMeta(selector, isTwitter ? "name" : "property", isTwitter ? "twitter:image" : "og:image", socialImage);
      } else if (location.pathname !== "/" && location.pathname !== "/home") {
        existing?.remove();
      }
    });

    document.getElementById("route-structured-data")?.remove();
    if (structuredData && !noindex) {
      const script = document.createElement("script");
      script.id = "route-structured-data";
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }
  }, [canonicalPath, description, image, location.pathname, noindex, structuredData, title, type]);

  return null;
}

const STATIC_PAGES: Record<string, Omit<SeoProps, "canonicalPath"> & { canonicalPath?: string }> = {
  "/": {
    title: "QBCAMP Conecta Mais — Conecte sua empresa ao futuro dos negócios regionais",
    description: "Plataforma B2B da QBCAMP para empresas de Quatro Barras, Campina Grande do Sul e Região Metropolitana de Curitiba.",
    canonicalPath: "/",
  },
  "/home": {
    title: "QBCAMP Conecta Mais — Conecte sua empresa ao futuro dos negócios regionais",
    description: "Plataforma B2B da QBCAMP para empresas de Quatro Barras, Campina Grande do Sul e Região Metropolitana de Curitiba.",
    canonicalPath: "/",
    noindex: true,
  },
  "/marketplace": { title: "Marketplace empresarial regional", description: "Encontre produtos e serviços de empresas de Quatro Barras e Região Metropolitana de Curitiba." },
  "/empresas": { title: "Guia de empresas associadas", description: "Conheça empresas associadas, parceiros e fornecedores de Quatro Barras e região." },
  "/servicos": { title: "Serviços para empresas", description: "Soluções da QBCAMP para crédito, gestão, certificação, networking e desenvolvimento empresarial." },
  "/oportunidades": { title: "Oportunidades de negócios", description: "Encontre fornecedores, parceiros, contratações e oportunidades empresariais na região da QBCAMP." },
  "/ranking": { title: "Ranking de empresas", description: "Conheça as empresas associadas que mais participam e movimentam o ecossistema regional QBCAMP." },
  "/beneficios": { title: "Benefícios para associados", description: "Vantagens e benefícios oferecidos pelas empresas associadas da rede QBCAMP." },
  "/eventos": { title: "Eventos empresariais", description: "Agenda de encontros, feiras, palestras e eventos empresariais de Quatro Barras e região." },
  "/noticias": { title: "Notícias empresariais da região", description: "Notícias, histórias e novidades das empresas de Quatro Barras e Região Metropolitana de Curitiba." },
  "/sac": { title: "Central de Atendimento", description: "Canais de atendimento e respostas para empresas e associados do QBCAMP Conecta Mais." },
};

const DYNAMIC_PUBLIC_PATHS = [/^\/produto\/[^/]+$/, /^\/noticias\/[^/]+$/, /^\/evento\/[^/]+$/, /^\/empresa\/[^/]+$/];

export function RouteSeo() {
  const location = useLocation();
  const staticPage = STATIC_PAGES[location.pathname];
  if (staticPage) return <Seo {...staticPage} canonicalPath={staticPage.canonicalPath || location.pathname} />;
  if (DYNAMIC_PUBLIC_PATHS.some((pattern) => pattern.test(location.pathname))) return null;
  return <Seo title="Área restrita" description="Área restrita do QBCAMP Conecta Mais." noindex />;
}

export { SITE_NAME, SITE_URL };