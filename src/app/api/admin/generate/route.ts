import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { isAdmin } from "@/lib/admin-auth";
import { catalog, nextCardId, type Card } from "@/lib/cards";

export const maxDuration = 60;

const SYSTEM_PROMPT = fs.readFileSync(
  path.join(process.cwd(), "src/prompts/card_generator_system_prompt.md"),
  "utf8"
);

function textOf(msg: Anthropic.Message): string {
  return msg.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
}

function extractJson(text: string): unknown {
  let t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) t = fence[1].trim();
  const first = t.indexOf("{");
  const last = t.lastIndexOf("}");
  if (first >= 0 && last > first) t = t.slice(first, last + 1);
  return JSON.parse(t);
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const sector = typeof body.sector === "string" ? body.sector.trim() : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!sector || !title) {
    return NextResponse.json({ error: "Sector y título son obligatorios" }, { status: 400 });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY no configurada" }, { status: 500 });
  }

  const client = new Anthropic();
  const id = await nextCardId();
  const today = new Date().toISOString().slice(0, 10);
  const known = catalog.sectors.find(
    (s) => s.name.es === sector || s.name.en === sector
  );
  const sectorEs = known ? known.name.es : sector;
  const sectorEn = known ? known.name.en : null;

  try {
    // Una sola llamada: genera la card ES y su traducción EN en un único JSON.
    const r = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Genera DOS versiones de la card y devuélvelas en un ÚNICO objeto JSON.

ESPAÑOL — sigue la metodología y la estructura exactamente:
- id: "${id}"
- profesión/caso: "${title}"
- sector: "${sectorEs}"
- created_at: "${today}"
- lang: "es"

INGLÉS — traducción de calidad publicable de la card española, preservando la voz literaria (la apertura con persona, la lección memorable). Mantén IDÉNTICOS id, severity, todos los fulcrums[*].bar y status, contrast.card_ref, url y created_at. lang: "en". sector: ${
            sectorEn ? `"${sectorEn}"` : "la traducción al inglés del sector"
          }.

Responde SOLO con este objeto JSON, sin texto adicional ni markdown:
{"es": <card en español>, "en": <card en inglés>}`,
        },
      ],
    });

    const obj = extractJson(textOf(r)) as { es?: Card; en?: Card };
    const es = obj.es;
    const en = obj.en;
    if (!es || !en) {
      return NextResponse.json(
        { error: "La respuesta no contenía {es, en}" },
        { status: 502 }
      );
    }

    es.id = id;
    es.lang = "es";
    es.sector = sectorEs;
    es.created_at = today;
    es.url = "https://thefulcrumproject.org";
    es.status = "draft";

    en.id = id;
    en.lang = "en";
    en.severity = es.severity;
    en.created_at = today;
    en.url = "https://thefulcrumproject.org";
    en.status = "draft";
    if (sectorEn) en.sector = sectorEn;

    return NextResponse.json({ es, en });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: "Generación fallida: " + message }, { status: 502 });
  }
}
