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
  const evalCount = entidad.totalEvaluacionesHistoricas ?? 0;
  const title = `${entidad.nombre} — Score: ${scoreText} (${label})`;
  const description = `Auditoría ciudadana basada en ${evalCount} fuentes públicas. Cero lobby, código abierto. Revisa la evidencia.`;

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
          url: entidad.foto,
          width: 400,
          height: 400,
          alt: entidad.nombre,
        },
      ],
      siteName: SITE_CONFIG.name,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [entidad.foto],
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
