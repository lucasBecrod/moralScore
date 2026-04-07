import type { Metadata } from "next";
import EntidadDetallePage from "@/features/entidad-detalle/EntidadDetallePage";
import { getEntidadById, getCandidaturasByEntidad, getProcesoActivo } from "@/firebase/queries";
import { getPublicLabel } from "@/shared/config/kohlberg-stages";
import { SITE_CONFIG } from "@/shared/config/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const entidad = await getEntidadById(id);

  if (!entidad) {
    return { title: "Candidato no encontrado — MoralScore" };
  }

  // Resolve score: prefer candidatura score for active process
  let score = entidad.scoreHistorico;
  let partido: string | undefined;
  const proceso = await getProcesoActivo();
  if (proceso) {
    const candidaturas = await getCandidaturasByEntidad(entidad.id);
    const active = candidaturas.find((c) => c.procesoId === proceso.id);
    if (active) {
      if (active.scoreCandidatura !== null) {
        score = active.scoreCandidatura;
      }
      partido = active.partido;
    }
  }

  const label = score !== null ? getPublicLabel(score) : "Sin evaluar";
  const scoreText = score !== null ? `${score.toFixed(1)}/6` : "Sin evaluar";
  const title = `${entidad.nombre} — ${scoreText} — MoralScore`;
  const description = partido
    ? `${entidad.nombre} (${partido}): ${label}. Score Kohlberg ${scoreText}. Evaluación moral verificable con fuentes.`
    : `${entidad.nombre}: ${label}. Score Kohlberg ${scoreText}. Evaluación moral verificable con fuentes.`;

  const ogImageUrl = `${SITE_CONFIG.url}/api/og?id=${id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `${SITE_CONFIG.url}/entidad/${id}`,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `Score moral de ${entidad.nombre}`,
        },
      ],
      siteName: SITE_CONFIG.name,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EntidadDetallePage id={id} />;
}
