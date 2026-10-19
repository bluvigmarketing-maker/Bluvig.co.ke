import { getImage } from "@/lib/portfolio-images";

/** Serves a screenshot uploaded through the cockpit. Ids never change, so cache for good. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const image = await getImage((await params).id).catch(() => null);
  if (!image) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(image.bytes), {
    headers: {
      "Content-Type": image.type,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
