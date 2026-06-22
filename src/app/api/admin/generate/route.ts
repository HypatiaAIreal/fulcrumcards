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
    // 1) Borrador en español con el system prompt de generación.
    const r1 = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Genera la card en ESPAÑOL para:
- id: "${id}"
- profesión/caso: "${title}"
- sector: "${sectorEs}"
- created_at: "${today}"
Sigue exactamente la metodología y la estructura JSON. Responde SOLO con el JSON.`,
        },
      ],
    });
    const es = extractJson(textOf(r1)) as Card;
    es.id = id;
    es.lang = "es";
    es.sector = sectorEs;
    es.created_at = today;
    es.url = "https://thefulcrumproject.org";
    es.status = "draft";

    // 2) Traducción al inglés preservando estructura y voz.
    const r2 = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: `Traduce esta card de "El Fulcro Invisible" del español al inglés, con calidad publicable y preservando la voz literaria (la apertura con persona, la lección memorable).
Reglas: traduce SOLO el texto legible; mantén idénticos id, severity, cada fulcrums[*].bar y status, contrast.card_ref, url y created_at; lang debe ser "en"; sector debe ser ${
            sectorEn ? `"${sectorEn}"` : "la traducción al inglés del sector"
          }. Devuelve SOLO el JSON.
Card ES:
${JSON.stringify(es)}`,
        },
      ],
    });
    const en = extractJson(textOf(r2)) as Card;
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
