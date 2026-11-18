import satori from "satori";
import { html } from "satori-html";
import { Resvg } from "@resvg/resvg-js";
import fs from "node:fs";
import path from "node:path";
import { getEntry } from "astro:content";

const WIDTH = 1200;
const HEIGHT = 630;
const logoData = fs.readFileSync(
  path.join(process.cwd(), "public/jargons.dev.svg"),
);
const logoSrc = `data:image/svg+xml;base64,${logoData.toString("base64")}`;
const fonts = [
  {
    name: "Inter",
    data: fs.readFileSync(path.join(process.cwd(), "src/fonts/Inter-Regular.ttf")),
    weight: 400,
    style: "normal",
  },
  {
    name: "IBM Plex Mono",
    data: fs.readFileSync(
      path.join(process.cwd(), "src/fonts/IBMPlexMono-SemiBold.ttf"),
    ),
    weight: 600,
    style: "normal",
  },
];

function truncate(text, limit) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= limit) return normalized;

  return `${normalized.slice(0, limit - 3).trimEnd()}...`;
}

function getExcerpt(body = "") {
  const firstParagraph = body
    .split(/\r?\n\s*\r?\n/)
    .find((paragraph) => paragraph.trim() && !paragraph.trim().startsWith("```"));

  return truncate(
    (firstParagraph ?? "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/[*_>#]/g, ""),
    320,
  );
}

/**
 * Generate a share image for a dictionary entry.
 * @param {import("astro").APIContext} context
 */
export async function GET({ params }) {
  const { slug } = params;
  if (!slug) return new Response(null, { status: 404 });

  const word = await getEntry("dictionary", slug);

  if (!word) {
    return new Response(null, { status: 404 });
  }

  const title = truncate(word.data.title, 64);
  const excerpt = getExcerpt(word.body);
  const markup = html`
    <div tw="flex w-full h-full p-14" style="display: flex; flex-direction: column; background: #ffffff; font-family: Inter; color: #172321;">
      <div tw="flex flex-col justify-between w-full h-full" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div tw="flex flex-col" style="display: flex; flex-direction: column;">
          <div tw="flex items-center mb-12" style="display: flex; align-items: center;">
            <div style="display: flex; position: relative; width: 344px; height: 72px;">
              <img src="${logoSrc}" width="344" height="72" style="position: absolute; top: 4px; left: 4px; opacity: 0.3;" />
              <img src="${logoSrc}" width="344" height="72" style="position: absolute; top: 0; left: 0;" />
            </div>
          </div>
          <div tw="mb-6" style="display: flex; font-family: IBM Plex Mono; font-size: 58px; font-weight: 600; line-height: 1.12; color: #172321;">
            ${title}
          </div>
          <div tw="max-w-full" style="display: flex; font-size: 25px; line-height: 1.4; color: #53615d;">
            ${excerpt}
          </div>
        </div>
        <div tw="flex justify-end" style="display: flex; justify-content: flex-end;">
          <div tw="flex items-center px-6 py-4" style="display: flex; align-items: center; background: #172321; border-radius: 999px; color: #ffffff; font-family: IBM Plex Mono; font-size: 19px; font-weight: 600;">
            <span>Browse Words</span>
            <span tw="ml-4" style="font-size: 24px;">→</span>
          </div>
        </div>
      </div>
    </div>
  `;

  const svg = await satori(markup, {
    fonts,
    height: HEIGHT,
    width: WIDTH,
  });

  const image = new Resvg(svg, {
    fitTo: { mode: "width", value: WIDTH },
  }).render();

  return new Response(image.asPng(), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}