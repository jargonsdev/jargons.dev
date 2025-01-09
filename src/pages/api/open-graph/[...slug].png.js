import satori from "satori";
import { html } from "satori-html";
import { Resvg } from "@resvg/resvg-js";
import path from "node:path";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { getEntry } from "astro:content";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
console.log(__dirname);
// const dictionary = import.meta.glob("../browse/*.mdx", { eager: true });

/**
 * Generate an Open Graph Image for word
 * @param {import("astro").APIContext} context
 */
export async function GET({ params: { slug } }) {
  const IBMPlexMonoBuffer = readFileSync('./public/fonts/IBMPlexMono-SemiBold.ttf');
  const word = await getEntry("dictionary", slug);

  if (!word) {
    return new Response("", {
      status:  404
    });
  }

  const out = 
    html`<div tw="flex flex-col items-center justify-center w-full h-full bg-white">
      <div tw="flex flex-col items-center">
        <h1 tw="text-6xl leading-none -mb-2 text-center">${word.data.title}</h1>
        <p>jargons.dev</p>
      </div>
    </div>`

  let svg = await satori(out, {
    fonts: [
      {
        name: "IBMPlexMono",
        data: IBMPlexMonoBuffer,
        style: "black"
      },
      // {
      //   name: "Inter",
      //   data: InterBuffer,
      //   style: "normal"
      // }
    ],
    height: 630,
    width: 1200
  });

  const image = (new Resvg(svg, {
    fitTo: {
      mode: "width",
      value: 1200
    }
  })).render();

  return new Response(image.asPng(), {
    status:  200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "s-maxage=1, stale-while-revalidate=59"
    }
  })
}