import type { RichNode } from "./types";

export const IMAGE_FIT_STYLE = "max-width:100%;height:auto;display:block;";

function withFitStyle(node: RichNode): RichNode {
  const next: RichNode = { name: node.name, attrs: { ...node.attrs } };
  const style = (next.attrs.style || "").trim();
  const hasMaxWidth = /max-width\s*:/i.test(style);
  const hasHeight = /height\s*:/i.test(style);
  if (!hasMaxWidth && !hasHeight) {
    next.attrs.style = IMAGE_FIT_STYLE;
  } else if (!hasMaxWidth) {
    next.attrs.style = (style ? style + ";" : "") + "max-width:100%;";
  } else if (!hasHeight) {
    next.attrs.style = (style ? style + ";" : "") + "height:auto;";
  } else {
    next.attrs.style = style;
  }
  return next;
}

/** Every img node keeps a max-width:100% and height:auto declaration. */
export function normalizeRichText(nodes: RichNode[]): RichNode[] {
  return nodes.map((node) => {
    if (node.name === "img") return withFitStyle(node);
    const next: RichNode = { name: node.name, attrs: { ...node.attrs } };
    if (node.text !== undefined) next.text = node.text;
    if (node.children) next.children = normalizeRichText(node.children);
    return next;
  });
}

export interface RichSegment {
  type: "rich" | "image";
  nodes: RichNode[];
  src: string;
}

/** Split top-level nodes: img nodes become full-width image blocks, the rest stay rich-text. */
export function splitRichSegments(nodes: RichNode[]): RichSegment[] {
  const out: RichSegment[] = [];
  let buffer: RichNode[] = [];
  const flush = () => {
    if (buffer.length > 0) {
      out.push({ type: "rich", nodes: buffer, src: "" });
      buffer = [];
    }
  };
  for (const node of normalizeRichText(nodes)) {
    if (node.name === "img") {
      flush();
      out.push({ type: "image", nodes: [node], src: node.attrs.src || "" });
    } else {
      buffer.push(node);
    }
  }
  flush();
  return out;
}

export function collectImageSources(nodes: RichNode[]): string[] {
  const out: string[] = [];
  const walk = (list: RichNode[]) => {
    for (const n of list) {
      if (n.name === "img" && n.attrs.src) out.push(n.attrs.src);
      if (n.children) walk(n.children);
    }
  };
  walk(nodes);
  return out;
}

/** Width of a scaled image: never wider than the viewport, height keeps the ratio. */
export function fitImage(sourceWidth: number, sourceHeight: number, viewportWidth: number): { width: number; height: number } {
  const width = sourceWidth > viewportWidth ? viewportWidth : sourceWidth;
  const height = sourceWidth === 0 ? sourceHeight : Math.round((sourceHeight * width) / sourceWidth);
  return { width, height };
}
