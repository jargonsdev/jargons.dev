import satori from "satori";
import { html } from "satori-html";
import { readFileSync } from "node:fs";
import { Resvg } from "@resvg/resvg-js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
console.log(__dirname);
const dictionary = import.meta.glob("../browse/*.mdx", { eager: true });

/**
 * Generate an Open Graph Image for word
 * @param {import("astro").APIContext} context
 */
export async function GET({ params }) {
  // const InterBuffer = readFileSync(process.cwd() + Inter);
  // const fontU = new URL("../../../public/font/IBMPlexMono-SemiBold.ttf", process.cwd()).href;
  // const IBMPlexMonoBuffer = readFileSync(path.resolve(fontU));
  // const IBMPlexMonoBuffer = readFileSync(path.resolve(__dirname, "../../../", "public/font/IBMPlexMono-SemiBold.ttf"));
  const IBMPlexMonoBuffer = readFileSync(path.resolve(__dirname, "./", "_IBMPlexMono-SemiBold.ttf"));
  // const IBMPlexMonoBuffer = readFileSync(process.cwd() + "/public/font/IBMPlexMono-SemiBold.ttf");
  console.log(path.resolve(__dirname, "./", "_IBMPlexMono-SemiBold.ttf"))
  // console.log(fontU);

  const word = dictionary[`../browse/${params.id}.mdx`] ?? null;

  if (!word) {
    return new Response("", {
      status:  404
    });
  }

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
    status:  200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "s-maxage=1, stale-while-revalidate=59"
    }
  })
}