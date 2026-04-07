import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { getEntidadById, getCandidaturasByEntidad, getProcesoActivo } from "@/firebase/queries";

// Citizen-facing labels per Kohlberg stage
const PUBLIC_LABELS: Record<number, string> = {
  1: "Autoritario / Punitivo",
  2: "Transaccional / Clientelista",
  3: "Busca aprobación popular",
  4: "Institucionalista",
  5: "Defiende derechos universales",
  6: "Principios éticos absolutos",
};

function getPublicLabel(score: number): string {
  const rounded = Math.round(score);
  return PUBLIC_LABELS[rounded] ?? "Sin clasificar";
}

/** Color zone based on score */
function getScoreColor(score: number): string {
  if (score <= 2.4) return "#DC2626"; // Pre-convencional — red
  if (score <= 4.4) return "#2563EB"; // Convencional — blue
  return "#7C3AED"; // Post-convencional — violet
}

function getZoneLabel(score: number): string {
  if (score <= 2.4) return "Pre-convencional";
  if (score <= 4.4) return "Convencional";
  return "Post-convencional";
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return new Response("Missing id parameter", { status: 400 });
  }

  const entidad = await getEntidadById(id);
  if (!entidad) {
    return new Response("Entity not found", { status: 404 });
  }

  // Get candidatura for the active process
  const proceso = await getProcesoActivo();
  let partido: string | undefined;
  let logoPartido: string | undefined;
  let scoreCandidatura: number | null = null;

  if (proceso) {
    const candidaturas = await getCandidaturasByEntidad(entidad.id);
    const activeCandidatura = candidaturas.find(
      (c) => c.procesoId === proceso.id
    );
    if (activeCandidatura) {
      partido = activeCandidatura.partido;
      logoPartido = activeCandidatura.logoPartido;
      scoreCandidatura = activeCandidatura.scoreCandidatura;
    }
  }

  // Prefer scoreCandidatura, fallback to scoreHistorico
  const score = scoreCandidatura ?? entidad.scoreHistorico;
  const totalEvaluaciones = entidad.totalEvaluacionesHistoricas ?? 0;
  const hasScore = score !== null && score !== undefined;

  const scoreColor = hasScore ? getScoreColor(score) : "#6B7280";
  const scoreLabel = hasScore ? getPublicLabel(score) : "Sin evaluar";
  const zoneLabel = hasScore ? getZoneLabel(score) : "";
  const scoreText = hasScore ? score.toFixed(1) : "—";
  const barWidth = hasScore ? Math.round((score / 6) * 100) : 0;

  // Fetch candidate photo as ArrayBuffer for Satori
  let photoSrc: string | ArrayBuffer | null = null;
  const photoUrl = entidad.foto;
  if (photoUrl) {
    try {
      const res = await fetch(photoUrl);
      if (res.ok) {
        photoSrc = await res.arrayBuffer();
      }
    } catch {
      // Use fallback
    }
  }

  // Fetch party logo if available
  let logoSrc: string | ArrayBuffer | null = null;
  if (logoPartido) {
    try {
      const res = await fetch(logoPartido);
      if (res.ok) {
        logoSrc = await res.arrayBuffer();
      }
    } catch {
      // Skip
    }
  }

  const imageResponse = new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          backgroundColor: "#09090b",
          padding: "48px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Left: Photo */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            marginRight: "40px",
            flexShrink: 0,
          }}
        >
          {photoSrc ? (
            <img
              src={photoSrc as unknown as string}
              width={200}
              height={260}
              style={{
                borderRadius: "16px",
                objectFit: "cover",
                border: "3px solid #27272a",
              }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "200px",
                height: "260px",
                borderRadius: "16px",
                backgroundColor: "#27272a",
                border: "3px solid #3f3f46",
                color: "#71717a",
                fontSize: "64px",
              }}
            >
              ?
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            gap: "12px",
          }}
        >
          {/* Name */}
          <div
            style={{
              fontSize: "42px",
              fontWeight: 700,
              color: "#fafafa",
              lineHeight: 1.1,
            }}
          >
            {entidad.nombre}
          </div>

          {/* Party with optional logo */}
          {partido && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              {logoSrc && (
                <img
                  src={logoSrc as unknown as string}
                  width={28}
                  height={28}
                  style={{ borderRadius: "4px" }}
                />
              )}
              <span
                style={{
                  fontSize: "22px",
                  color: "#a1a1aa",
                }}
              >
                {partido}
              </span>
            </div>
          )}

          {/* Score display */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "16px",
              marginTop: "8px",
            }}
          >
            <span
              style={{
                fontSize: "72px",
                fontWeight: 800,
                color: scoreColor,
                lineHeight: 1,
              }}
            >
              {scoreText}
            </span>
            <span
              style={{
                fontSize: "22px",
                color: "#a1a1aa",
              }}
            >
              / 6
            </span>
          </div>

          {/* Score bar */}
          <div
            style={{
              display: "flex",
              width: "100%",
              height: "14px",
              backgroundColor: "#27272a",
              borderRadius: "7px",
              overflow: "hidden",
            }}
          >
            {hasScore && (
              <div
                style={{
                  width: `${barWidth}%`,
                  height: "100%",
                  backgroundColor: scoreColor,
                  borderRadius: "7px",
                }}
              />
            )}
          </div>

          {/* Citizen label + zone */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              marginTop: "4px",
            }}
          >
            <span
              style={{
                fontSize: "24px",
                fontWeight: 600,
                color: scoreColor,
              }}
            >
              {scoreLabel}
            </span>
            {zoneLabel && (
              <span
                style={{
                  fontSize: "16px",
                  color: "#71717a",
                }}
              >
                {zoneLabel}
              </span>
            )}
          </div>

          {/* Source count + branding */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "12px",
            }}
          >
            <span
              style={{
                fontSize: "16px",
                color: "#71717a",
              }}
            >
              {totalEvaluaciones === 1
                ? "1 fuente evaluada"
                : `${totalEvaluaciones} fuentes evaluadas`}
            </span>
            <span
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#52525b",
              }}
            >
              MoralScore
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=3600",
      },
    }
  );

  return imageResponse;
}
