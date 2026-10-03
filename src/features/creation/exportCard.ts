import { cardFonts, ratios } from "@/domain/content";
import type { CreationDraft } from "@/domain/entities/types";
import { draftImageSrc, styleFilter } from "./CardPreview";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("The photo could not be read."));
    img.src = src;
  });
}

function wrap(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    let line = "";
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const candidate = line ? `${line} ${word}` : word;
      if (ctx.measureText(candidate).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }
    lines.push(line);
  }
  return lines;
}

/**
 * Renders the current draft exactly as the on-screen preview shows it and
 * returns a PNG blob. Runs entirely in the browser, so no storage is needed.
 */
export async function renderCardToBlob(
  draft: CreationDraft,
  targetWidth = 2048,
): Promise<Blob> {
  const src = draftImageSrc(draft);
  if (!src) throw new Error("Add a photo first.");

  const ratio = ratios.find((r) => r.id === draft.ratioId) ?? ratios[0]!;
  const font = cardFonts.find((f) => f.id === draft.fontId) ?? cardFonts[0]!;
  const width = targetWidth;
  const height = Math.round(width / ratio.aspect);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("This browser cannot create the image.");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  const img = await loadImage(src);
  const rotation = draft.imageRotation ?? 0;
  const quarterTurn = rotation === 90 || rotation === 270;
  const effectiveWidth = quarterTurn ? img.height : img.width;
  const effectiveHeight = quarterTurn ? img.width : img.height;
  const scale = Math.max(width / effectiveWidth, height / effectiveHeight);
  const dw = img.width * scale;
  const dh = img.height * scale;
  const zoom = Math.max(1, Math.min(3, draft.imageZoom ?? 1));
  const panX = ((draft.imagePan?.x ?? 0) / 380) * width;
  const panY = ((draft.imagePan?.y ?? 0) / (380 / ratio.aspect)) * height;
  const filter = styleFilter(draft);
  if (filter && filter !== "none") ctx.filter = filter;
  ctx.save();
  ctx.translate(width / 2 + panX, height / 2 + panY);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.scale(zoom, zoom);
  ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
  ctx.restore();
  ctx.filter = "none";

  const message = draft.message?.trim();
  if (message) {
    const position = draft.textPosition ?? "bottom-center";
    const defaultCoordinates = {
      x: position.endsWith("left") ? 0.13 : position.endsWith("right") ? 0.87 : 0.5,
      y: position.startsWith("top") ? 0.14 : position.startsWith("bottom") ? 0.86 : 0.5,
    };
    const coordinates = draft.textCoordinates ?? defaultCoordinates;
    const vertical = coordinates.y < 0.34
      ? "top"
      : coordinates.y > 0.66
        ? "bottom"
        : "middle";

    if (vertical === "middle") {
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fillRect(0, 0, width, height);
    } else {
      const bandHeight = height * 0.4;
      const y0 = vertical === "top" ? 0 : height - bandHeight;
      const gradient = ctx.createLinearGradient(0, y0, 0, y0 + bandHeight);
      const stops =
        vertical === "top"
          ? [
              [0, "rgba(0,0,0,0.6)"],
              [1, "rgba(0,0,0,0)"],
            ]
          : [
              [0, "rgba(0,0,0,0)"],
              [1, "rgba(0,0,0,0.65)"],
            ];
      for (const [offset, color] of stops) {
        gradient.addColorStop(offset as number, color as string);
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, y0, width, bandHeight);
    }

    const padding = Math.round(width * 0.06);
    const sizeMultiplier =
      draft.fontSize === "sm"
        ? 0.035
        : draft.fontSize === "lg"
          ? 0.055
          : draft.fontSize === "xl"
            ? 0.065
            : draft.fontSize === "2xl"
              ? 0.075
              : 0.045;
    const fontSize = Math.round(width * sizeMultiplier);
    const lineHeight = Math.round(fontSize * 1.3);
    const fontStyle = draft.isItalic ? "italic " : "";
    const fontWeight = draft.isBold ? "700" : (font.weight ?? "400");
    ctx.font = `${fontStyle}${fontWeight} ${fontSize}px ${font.family}`;
    ctx.textBaseline = "top";

    const maxWidth = width - padding * 2;
    const lines = wrap(ctx, message, maxWidth);
    const blockHeight = lines.length * lineHeight;
    const top = Math.min(height - padding - blockHeight, Math.max(padding, coordinates.y * height - blockHeight / 2));
    const fallbackHorizontal = coordinates.x < 0.34
      ? "left"
      : coordinates.x > 0.66
        ? "right"
        : "center";
    const textAlign = draft.textAlign ?? fallbackHorizontal;
    ctx.textAlign = textAlign;
    const x =
      textAlign === "left"
        ? Math.max(padding, coordinates.x * width)
        : textAlign === "right"
          ? Math.min(width - padding, coordinates.x * width)
          : coordinates.x * width;

    if (draft.foilColor === "gold") {
      const foilGrad = ctx.createLinearGradient(0, top, width, top + blockHeight);
      foilGrad.addColorStop(0, "#b8860b");
      foilGrad.addColorStop(0.3, "#ffd700");
      foilGrad.addColorStop(0.5, "#fff8db");
      foilGrad.addColorStop(0.7, "#d4af37");
      foilGrad.addColorStop(1, "#996515");
      ctx.fillStyle = foilGrad;
      ctx.shadowColor = "rgba(0,0,0,0.45)";
    } else if (draft.foilColor === "rose-gold") {
      const foilGrad = ctx.createLinearGradient(0, top, width, top + blockHeight);
      foilGrad.addColorStop(0, "#c47b85");
      foilGrad.addColorStop(0.3, "#f7c5cc");
      foilGrad.addColorStop(0.5, "#fff0f2");
      foilGrad.addColorStop(1, "#9e535e");
      ctx.fillStyle = foilGrad;
      ctx.shadowColor = "rgba(0,0,0,0.45)";
    } else if (draft.foilColor === "silver") {
      const foilGrad = ctx.createLinearGradient(0, top, width, top + blockHeight);
      foilGrad.addColorStop(0, "#a8a8a8");
      foilGrad.addColorStop(0.5, "#ffffff");
      foilGrad.addColorStop(1, "#7a7a7a");
      ctx.fillStyle = foilGrad;
      ctx.shadowColor = "rgba(0,0,0,0.5)";
    } else if (draft.foilColor === "noir") {
      ctx.fillStyle = "#18181b";
      ctx.shadowColor = "rgba(255,255,255,0.4)";
    } else {
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(0,0,0,0.55)";
    }
    ctx.shadowBlur = Math.round(fontSize * 0.4);
    ctx.shadowOffsetY = Math.round(fontSize * 0.06);

    lines.forEach((line, index) => {
      const lineY = top + index * lineHeight;
      ctx.fillText(line, x, lineY);

      if (draft.isUnderline) {
        const textMetrics = ctx.measureText(line);
        let underlineX = x;
        if (textAlign === "center") underlineX = x - textMetrics.width / 2;
        else if (textAlign === "right") underlineX = x - textMetrics.width;
        const underlineY = lineY + fontSize * 1.05;
        ctx.save();
        ctx.strokeStyle = ctx.fillStyle;
        ctx.lineWidth = Math.max(2, Math.round(fontSize * 0.06));
        ctx.beginPath();
        ctx.moveTo(underlineX, underlineY);
        ctx.lineTo(underlineX + textMetrics.width, underlineY);
        ctx.stroke();
        ctx.restore();
      }
    });
    ctx.shadowColor = "transparent";
  }

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob) throw new Error("The image could not be created.");
  return blob;
}

export async function downloadCard(draft: CreationDraft, fileName = "dearly-card.png") {
  const blob = await renderCardToBlob(draft);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
