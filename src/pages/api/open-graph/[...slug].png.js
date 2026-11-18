import satori from "satori";
import { html } from "satori-html";
import { Resvg } from "@resvg/resvg-js";
import fs from "node:fs";
import path from "node:path";
import { getEntry } from "astro:content";

const WIDTH = 1200;
const HEIGHT = 630;
const logoSvg = fs.readFileSync(
  path.join(process.cwd(), "public/jargons.dev.svg"),
  "utf8",
);
const whiteLogoPath = logoSvg.match(/<path class="filWhite"[^>]*\/>/)?.[0];
const blackLogoPath = logoSvg.match(/<path class="filBlack"[^>]*\/>/)?.[0];
const shadowPaths = [
  { offset: 8, opacity: 0.08 },
  { offset: 16, opacity: 0.05 },
]
  .map(({ offset, opacity }) =>
    [
      whiteLogoPath?.replace(
        'class="filWhite"',
        `style="fill:#000000;opacity:${opacity}" transform="translate(${offset} ${offset})"`,
      ),
      blackLogoPath?.replace(
        'class="filBlack"',
        `style="fill:#000000;opacity:${opacity}" transform="translate(${offset} ${offset})"`,
      ),
    ].join(""),
  )
  .join("");
const logoWithShadowSvg = whiteLogoPath
  ? logoSvg.replace(whiteLogoPath, `${shadowPaths}${whiteLogoPath}`)
  : logoSvg;
const logoData = new Resvg(logoWithShadowSvg, {
  fitTo: { mode: "width", value: 344 },
}).render().asPng();
const logoSrc = `data:image/png;base64,${logoData.toString("base64")}`;
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
    <div tw="flex h-full pt-14 pb-20 px-20" style="display: flex; flex-direction: column; background: #ffffff; font-family: Inter; color: #000000;">
      <div tw="flex flex-col justify-between h-full" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div tw="flex flex-col" style="display: flex; flex-direction: column;">
          <div tw="flex items-center mb-12" style="display: flex; align-items: center;">
            <img src="${logoSrc}" width="344" height="72" style="filter: drop-shadow(0 4px 3px rgba(0, 0, 0, 0.07)) drop-shadow(0 2px 2px rgba(0, 0, 0, 0.06));" />
          </div>
        </div>
        <div tw="flex flex-col" style="display: flex;">
          <div tw="mb-6" style="display: flex; font-family: IBM Plex Mono; font-size: 58px; font-weight: 600; line-height: 1.12; color: #000000;">
            What is ${title}?
          </div>
          <div tw="max-w-4xl" style="display: flex; font-size: 18px; line-height: 1.4; color: #53615d;">
            ${excerpt}
          </div>  
          <div tw="mt-6" style="display: flex;">
            <div tw="flex items-center px-6 py-3" style="display: flex; align-items: center; background: #000000; border-radius: 18px; color: #ffffff; font-family: IBM Plex Mono; font-size: 17px; font-weight: 600;">
              <span>Learn More</span>
              <span tw="ml-2" style="display: flex; align-items: center; color: #ffffff;">
                <svg viewBox="0 0 24 24" fill="currentColor" class="size-6">
                  <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm4.28 10.28a.75.75 0 0 0 0-1.06l-3-3a.75.75 0 1 0-1.06 1.06l1.72 1.72H8.25a.75.75 0 0 0 0 1.5h5.69l-1.72 1.72a.75.75 0 1 0 1.06 1.06l3-3Z" clip-rule="evenodd" />
                </svg>
              </span>
            </div>
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