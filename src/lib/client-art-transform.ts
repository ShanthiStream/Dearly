// High-fidelity client-side artistic rendering engine.
// Transforms photographs into authentic, stunning painterly artworks (oil painting, watercolor,
// classic cartoon, pop art, vintage noir, impressionism, pointillism) using computer graphics algorithms.

import type { StyleId, StyleIntensity } from "@/domain/entities/types";

// Helper: Clamp values to [0, 255]
function clamp(val: number): number {
  return Math.max(0, Math.min(255, Math.round(val)));
}

/**
 * Kuwahara filter: The gold standard for turning photos into real oil & watercolor paintings.
 * Divides the neighborhood into 4 quadrants, calculates mean & variance of each,
 * and sets the pixel to the mean of the quadrant with lowest variance.
 * This flattens textures into painterly brush patches while keeping essential edges sharp!
 */
function applyKuwahara(
  srcData: Uint8ClampedArray,
  dstData: Uint8ClampedArray,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.max(1, radius);

  for (let y = 0; y < height; y++) {
    const yMin = Math.max(0, y - r);
    const yMax = Math.min(height - 1, y + r);

    for (let x = 0; x < width; x++) {
      const xMin = Math.max(0, x - r);
      const xMax = Math.min(width - 1, x + r);

      // Four quadrants: Q1 (top-left), Q2 (top-right), Q3 (bottom-left), Q4 (bottom-right)
      const quads = [
        { x0: xMin, x1: x, y0: yMin, y1: y },
        { x0: x, x1: xMax, y0: yMin, y1: y },
        { x0: xMin, x1: x, y0: y, y1: yMax },
        { x0: x, x1: xMax, y0: y, y1: yMax },
      ];

      let minVariance = Infinity;
      let bestR = 0;
      let bestG = 0;
      let bestB = 0;

      for (let q = 0; q < 4; q++) {
        const { x0, x1, y0, y1 } = quads[q]!;
        let sumR = 0, sumG = 0, sumB = 0;
        let sumSqR = 0, sumSqG = 0, sumSqB = 0;
        let count = 0;

        for (let qy = y0; qy <= y1; qy++) {
          const rowOffset = qy * width * 4;
          for (let qx = x0; qx <= x1; qx++) {
            const idx = rowOffset + qx * 4;
            const pr = srcData[idx]!;
            const pg = srcData[idx + 1]!;
            const pb = srcData[idx + 2]!;

            sumR += pr;
            sumG += pg;
            sumB += pb;
            sumSqR += pr * pr;
            sumSqG += pg * pg;
            sumSqB += pb * pb;
            count++;
          }
        }

        if (count === 0) continue;

        const meanR = sumR / count;
        const meanG = sumG / count;
        const meanB = sumB / count;

        const varR = sumSqR / count - meanR * meanR;
        const varG = sumSqG / count - meanG * meanG;
        const varB = sumSqB / count - meanB * meanB;
        const totalVariance = varR + varG + varB;

        if (totalVariance < minVariance) {
          minVariance = totalVariance;
          bestR = meanR;
          bestG = meanG;
          bestB = meanB;
        }
      }

      const outIdx = (y * width + x) * 4;
      dstData[outIdx] = clamp(bestR);
      dstData[outIdx + 1] = clamp(bestG);
      dstData[outIdx + 2] = clamp(bestB);
      dstData[outIdx + 3] = srcData[outIdx + 3]!;
    }
  }
}

/**
 * Sobel filter: Extracts delicate artist line-drawings and ink contours from the photo.
 */
function getSobelEdges(srcData: Uint8ClampedArray, width: number, height: number, threshold = 40): Uint8Array {
  const edges = new Uint8Array(width * height);
  const gray = new Uint8Array(width * height);

  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    gray[i] = clamp(srcData[idx]! * 0.299 + srcData[idx + 1]! * 0.587 + srcData[idx + 2]! * 0.114);
  }

  for (let y = 1; y < height - 1; y++) {
    const row = y * width;
    for (let x = 1; x < width - 1; x++) {
      const gx =
        -gray[row - width + x - 1]! + gray[row - width + x + 1]! +
        -2 * gray[row + x - 1]! + 2 * gray[row + x + 1]! +
        -gray[row + width + x - 1]! + gray[row + width + x + 1]!;

      const gy =
        -gray[row - width + x - 1]! - 2 * gray[row - width + x]! - gray[row - width + x + 1]! +
        gray[row + width + x - 1]! + 2 * gray[row + width + x]! + gray[row + width + x + 1]!;

      const mag = Math.sqrt(gx * gx + gy * gy);
      edges[row + x] = mag > threshold ? clamp(mag) : 0;
    }
  }
  return edges;
}

/**
 * Main application of high-fidelity canvas artistic transformations.
 */
export async function applyClientArtStyle(
  imageSource: string,
  styleId: StyleId,
  intensity: StyleIntensity = "medium",
): Promise<string> {
  if (styleId === "original") return imageSource;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          resolve(imageSource);
          return;
        }

        // Maintain quality while keeping rendering silky smooth
        const maxDim = 900;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const imgData = ctx.getImageData(0, 0, width, height);
        const src = imgData.data;
        const outData = ctx.createImageData(width, height);
        const dst = outData.data;

        const kuwaharaRadius = intensity === "low" ? 2 : intensity === "high" ? 5 : 3;

        switch (styleId) {
          case "pop-oil":
          case "impressionist": {
            // Step 1: Thick oil paint Kuwahara brush strokes
            applyKuwahara(src, dst, width, height, kuwaharaRadius);

            // Step 2: Specular impasto relief highlighting (embossed 3D paint texture catching light)
            const reliefData = ctx.createImageData(width, height);
            const rData = reliefData.data;
            for (let y = 1; y < height - 1; y++) {
              for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4;
                const rightIdx = (y * width + (x + 1)) * 4;
                const downIdx = ((y + 1) * width + x) * 4;

                // Color saturation boost
                let r = dst[idx]!;
                let g = dst[idx + 1]!;
                let b = dst[idx + 2]!;

                const lum = 0.299 * r + 0.587 * g + 0.114 * b;
                const lumRight = 0.299 * dst[rightIdx]! + 0.587 * dst[rightIdx + 1]! + 0.114 * dst[rightIdx + 2]!;
                const lumDown = 0.299 * dst[downIdx]! + 0.587 * dst[downIdx + 1]! + 0.114 * dst[downIdx + 2]!;

                // Directional 45-degree top-left light
                const diff = (lum - lumRight) + (lum - lumDown);
                const lightGain = diff * 0.45;

                // Oil saturation curve
                const satBoost = styleId === "pop-oil" ? 1.35 : 1.2;
                r = clamp(lum + (r - lum) * satBoost + lightGain);
                g = clamp(lum + (g - lum) * satBoost + lightGain);
                b = clamp(lum + (b - lum) * satBoost + lightGain);

                // Van Gogh / Impressionist golden glaze
                if (styleId === "impressionist") {
                  r = clamp(r * 1.05 + 8);
                  g = clamp(g * 1.02 + 4);
                  b = clamp(b * 0.95);
                }

                rData[idx] = r;
                rData[idx + 1] = g;
                rData[idx + 2] = b;
                rData[idx + 3] = 255;
              }
            }
            ctx.putImageData(reliefData, 0, 0);

            // Canvas texture overlay
            ctx.globalCompositeOperation = "overlay";
            ctx.fillStyle = "rgba(255, 230, 180, 0.18)";
            ctx.fillRect(0, 0, width, height);
            ctx.globalCompositeOperation = "source-over";
            break;
          }

          case "watercolor":
          case "storybook-watercolor": {
            // Step 1: Painterly pigment pooling
            applyKuwahara(src, dst, width, height, kuwaharaRadius + 1);

            // Step 2: Delicate pencil / ink underdrawing
            const edges = getSobelEdges(src, width, height, 35);

            for (let i = 0; i < width * height; i++) {
              const idx = i * 4;
              let r = dst[idx]!;
              let g = dst[idx + 1]!;
              let b = dst[idx + 2]!;

              // Watercolor pastel translucency and lift
              const lum = 0.299 * r + 0.587 * g + 0.114 * b;
              r = clamp(r * 0.85 + lum * 0.15 + 16);
              g = clamp(g * 0.85 + lum * 0.15 + 14);
              b = clamp(b * 0.82 + lum * 0.15 + 18);

              // Blend delicate ink contour lines
              const edgeVal = edges[i]!;
              if (edgeVal > 0) {
                const inkFactor = (edgeVal / 255) * (styleId === "storybook-watercolor" ? 0.6 : 0.4);
                // Sepia/pencil tone
                const inkR = 50, inkG = 40, inkB = 35;
                r = clamp(r * (1 - inkFactor) + inkR * inkFactor);
                g = clamp(g * (1 - inkFactor) + inkG * inkFactor);
                b = clamp(b * (1 - inkFactor) + inkB * inkFactor);
              }

              dst[idx] = r;
              dst[idx + 1] = g;
              dst[idx + 2] = b;
              dst[idx + 3] = 255;
            }
            ctx.putImageData(outData, 0, 0);

            // Cold-press watercolor paper wash & granulation
            ctx.globalCompositeOperation = "multiply";
            const washGrad = ctx.createRadialGradient(
              width / 2, height / 2, width * 0.1,
              width / 2, height / 2, width * 0.75
            );
            washGrad.addColorStop(0, "rgba(255, 252, 245, 1.0)");
            washGrad.addColorStop(0.8, "rgba(248, 240, 226, 0.95)");
            washGrad.addColorStop(1, "rgba(235, 220, 200, 0.85)");
            ctx.fillStyle = washGrad;
            ctx.fillRect(0, 0, width, height);

            // Subtle paper grain
            ctx.globalCompositeOperation = "overlay";
            ctx.fillStyle = "rgba(180, 160, 140, 0.12)";
            ctx.fillRect(0, 0, width, height);
            ctx.globalCompositeOperation = "source-over";
            break;
          }

          case "classic-cartoon": {
            // Pixar/Animated Feature style: cel-shading + bold ink lines + glowing warm saturation
            applyKuwahara(src, dst, width, height, 3);
            const edges = getSobelEdges(src, width, height, 45);

            for (let i = 0; i < width * height; i++) {
              const idx = i * 4;
              let r = dst[idx]!;
              let g = dst[idx + 1]!;
              let b = dst[idx + 2]!;

              // Cel-shade posterization into smooth steps
              const levels = 8;
              const step = 255 / (levels - 1);
              r = Math.round(r / step) * step;
              g = Math.round(g / step) * step;
              b = Math.round(b / step) * step;

              // Boost warm tones and skin glow
              r = clamp(r * 1.15 + 10);
              g = clamp(g * 1.05 + 5);
              b = clamp(b * 0.95);

              // Ink contour lines
              const edgeVal = edges[i]!;
              if (edgeVal > 0) {
                const dark = (1 - (edgeVal / 255) * 0.75);
                r = clamp(r * dark);
                g = clamp(g * dark);
                b = clamp(b * dark);
              }

              dst[idx] = r;
              dst[idx + 1] = g;
              dst[idx + 2] = b;
              dst[idx + 3] = 255;
            }
            ctx.putImageData(outData, 0, 0);

            // Studio rim light bloom
            ctx.globalCompositeOperation = "screen";
            ctx.fillStyle = "rgba(255, 240, 220, 0.15)";
            ctx.fillRect(0, 0, width, height);
            ctx.globalCompositeOperation = "source-over";
            break;
          }

          case "pop-art": {
            // Andy Warhol / Roy Lichtenstein: bold 4-tone graphic silkscreen with Ben-Day dot pattern
            applyKuwahara(src, dst, width, height, 4);
            const edges = getSobelEdges(src, width, height, 50);

            for (let i = 0; i < width * height; i++) {
              const idx = i * 4;
              let r = dst[idx]!;
              let g = dst[idx + 1]!;
              let b = dst[idx + 2]!;

              // High-contrast primary color quantization
              const lum = 0.299 * r + 0.587 * g + 0.114 * b;
              if (lum < 60) {
                r = 20; g = 25; b = 40; // Deep ink navy
              } else if (lum < 130) {
                r = 230; g = 50; b = 80; // Vivid pop magenta/red
              } else if (lum < 200) {
                r = 255; g = 195; b = 40; // Vibrant sunny yellow
              } else {
                r = 255; g = 250; b = 240; // Light cream
              }

              // Bold black graphic outline
              if (edges[i]! > 0) {
                r = 15; g = 15; b = 25;
              }

              dst[idx] = r;
              dst[idx + 1] = g;
              dst[idx + 2] = b;
              dst[idx + 3] = 255;
            }
            ctx.putImageData(outData, 0, 0);

            // Silkscreen dot matrix overlay (Ben-Day dots)
            ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
            const dotSpacing = 8;
            for (let y = 0; y < height; y += dotSpacing) {
              for (let x = 0; x < width; x += dotSpacing) {
                ctx.beginPath();
                ctx.arc(x + (y % (dotSpacing * 2) === 0 ? 0 : dotSpacing / 2), y, 1.5, 0, Math.PI * 2);
                ctx.fill();
              }
            }
            break;
          }

          case "noir-vintage": {
            // Kodak Tri-X 400 silver-gelatin film: rich deep blacks, glowing high-key highlights, fine analog grain
            const edges = getSobelEdges(src, width, height, 60);

            for (let i = 0; i < width * height; i++) {
              const idx = i * 4;
              const r = src[idx]!;
              const g = src[idx + 1]!;
              const b = src[idx + 2]!;

              // Perceptual monochrome conversion
              let gray = 0.299 * r + 0.587 * g + 0.114 * b;

              // Classic film S-curve contrast
              const norm = gray / 255;
              const sCurve = norm < 0.5 ? 2 * norm * norm : 1 - 2 * (1 - norm) * (1 - norm);
              gray = sCurve * 255;

              // High-contrast film push
              gray = clamp((gray - 128) * 1.35 + 128);

              // Organic silver grain simulation
              const grain = (Math.random() - 0.5) * 22;
              gray = clamp(gray + grain);

              // Deep silver tone with very subtle antique warmth
              dst[idx] = clamp(gray * 1.04);
              dst[idx + 1] = clamp(gray * 0.98);
              dst[idx + 2] = clamp(gray * 0.91);
              dst[idx + 3] = 255;
            }
            ctx.putImageData(outData, 0, 0);

            // Hollywood Chiaroscuro vignette
            ctx.globalCompositeOperation = "multiply";
            const vig = ctx.createRadialGradient(
              width / 2, height / 2, width * 0.25,
              width / 2, height / 2, width * 0.72
            );
            vig.addColorStop(0, "rgba(255, 255, 255, 1.0)");
            vig.addColorStop(0.7, "rgba(240, 240, 240, 0.9)");
            vig.addColorStop(1, "rgba(20, 20, 25, 0.75)");
            ctx.fillStyle = vig;
            ctx.fillRect(0, 0, width, height);
            ctx.globalCompositeOperation = "source-over";
            break;
          }

          case "pointillist": {
            // Georges Seurat: Optical stippled color pointillism
            applyKuwahara(src, dst, width, height, 2);
            ctx.putImageData(outData, 0, 0);

            // Generate dense stippled color dab dots
            const dotSize = intensity === "high" ? 4 : 3;
            const step = dotSize * 1.4;
            for (let y = 0; y < height; y += step) {
              for (let x = 0; x < width; x += step) {
                const sampleX = clamp(Math.round(x + (Math.random() - 0.5) * 2));
                const sampleY = clamp(Math.round(y + (Math.random() - 0.5) * 2));
                const idx = (sampleY * width + sampleX) * 4;

                const r = src[idx] ?? 128;
                const g = src[idx + 1] ?? 128;
                const b = src[idx + 2] ?? 128;

                // Color vibration jitter (pure pigment dots)
                const jitter = (Math.random() - 0.5) * 35;
                ctx.fillStyle = `rgb(${clamp(r + jitter)}, ${clamp(g - jitter * 0.5)}, ${clamp(b + jitter * 0.5)})`;
                ctx.beginPath();
                ctx.arc(sampleX, sampleY, dotSize * (0.8 + Math.random() * 0.4), 0, Math.PI * 2);
                ctx.fill();
              }
            }
            break;
          }

          case "abstract": {
            // Picasso Cubist faceted planes & geometric color fragmentation
            applyKuwahara(src, dst, width, height, 4);
            ctx.putImageData(outData, 0, 0);

            // Faceted geometry overlay
            ctx.strokeStyle = "rgba(40, 30, 20, 0.4)";
            ctx.lineWidth = 1.5;
            const cellSize = 45;
            for (let y = 0; y < height; y += cellSize) {
              for (let x = 0; x < width; x += cellSize) {
                const offsetX = (Math.random() - 0.5) * 20;
                const offsetY = (Math.random() - 0.5) * 20;
                ctx.beginPath();
                ctx.moveTo(x + offsetX, y + offsetY);
                ctx.lineTo(x + cellSize, y);
                ctx.lineTo(x, y + cellSize);
                ctx.closePath();
                ctx.stroke();
              }
            }
            break;
          }

          default:
            ctx.putImageData(imgData, 0, 0);
            break;
        }

        resolve(canvas.toDataURL("image/jpeg", 0.94));
      } catch (err) {
        console.error("Artistic rendering error:", err);
        resolve(imageSource);
      }
    };
    img.onerror = () => reject(new Error("Could not load image for artistic styling."));
    img.src = imageSource;
  });
}
