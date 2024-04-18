import satori from "satori";
import { html } from "satori-html";
import { readFileSync } from "node:fs";
import { Resvg } from "@resvg/resvg-js";
// import Inter from "../../../../public/font/Inter-Regular.ttf";
import IBMPlexMono from "../../../../public/font/IBMPlexMono-SemiBold.ttf";

const dictionary = import.meta.glob("../../browse/*.mdx", { eager: true });

/**
 * Generate an Open Graph Image for word
 * @param {import("astro").APIContext} context
 */
export async function GET({ params }) {
  // const InterBuffer = readFileSync(process.cwd() + Inter);
  const IBMPlexMonoBuffer = readFileSync(process.cwd() + IBMPlexMono);

  const word = dictionary[`../../browse/${params.id}.mdx`];

  const out = 
    html`<div tw="flex flex-col items-center justify-center w-full h-full bg-white">
      <div tw="flex flex-col items-center">
        <h1 tw="text-6xl leading-none -mb-2 text-center">${word.frontmatter.title}</h1>
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
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  })
}