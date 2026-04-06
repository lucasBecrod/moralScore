import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL requerida" }, { status: 400 });
    }

    const res = await fetch(url, {
      headers: {
        "User-Agent": "MoralScoreBot/1.0 (metadata extraction)",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "No se pudo acceder a la URL", status: res.status },
        { status: 422 }
      );
    }

    const html = await res.text();
    const title = extractMeta(html, "og:title") || extractTag(html, "title") || null;
    const image = extractMeta(html, "og:image") || null;
    const siteName =
      extractMeta(html, "og:site_name") ||
      new URL(url).hostname.replace(/^www\./, "") ||
      null;

    return NextResponse.json({ title, image, domain: siteName });
  } catch (error) {
    console.error("Error extracting metadata:", error);
    return NextResponse.json(
      { error: "Error al extraer metadata" },
      { status: 500 }
    );
  }
}

function extractMeta(html: string, property: string): string | null {
  // Match both property="og:X" and name="og:X"
  const regex = new RegExp(
    `<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']+)["']|<meta[^>]*content=["']([^"']+)["'][^>]*(?:property|name)=["']${property}["']`,
    "i"
  );
  const match = html.match(regex);
  return match ? (match[1] || match[2] || null) : null;
}

function extractTag(html: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*>([^<]+)</${tag}>`, "i");
  const match = html.match(regex);
  return match ? match[1].trim() : null;
}
