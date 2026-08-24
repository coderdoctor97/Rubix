// PDF export — renders the live canvas via the SAME html-to-image pipeline the
// PNG export uses (content bounding box, selection-clear, #world capture), then
// wraps the resulting JPEG in a minimal single-page PDF. No PDF dependency: PDF
// supports baseline JPEG natively via the /DCTDecode filter, so we embed the
// image bytes verbatim. This faithfully reproduces node styles, shadows, paper
// grain, Excalifont node text and curved connections — it is a true render of
// the knowledge canvas, never the surrounding UI chrome.
import { toJpeg } from 'html-to-image';
import { useCanvasStore } from './store';
import { visibleOrder } from './operations/hierarchy';
import { NODE_MIN_HEIGHT, NODE_WIDTH } from './types';

function sanitize(name: string): string {
  const s = name.trim().replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');
  return s || 'canvas';
}

/**
 * Resolved canvas-board colour as an rgb()/rgba() string. Read from the live
 * `#viewport` element so it tracks the active theme (warm paper in light mode,
 * dark warm board in dark mode) and is returned as a canvas-safe value. Used as
 * the PDF page background (JPEG has no alpha).
 */
function canvasBoardColor(): string {
  const vp = document.querySelector<HTMLElement>('#viewport');
  if (vp) {
    const c = getComputedStyle(vp).backgroundColor;
    if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') return c;
  }
  return 'rgb(243, 240, 232)'; // warm paper fallback
}

/**
 * Build a minimal single-page PDF that embeds one baseline JPEG.
 * Pure + dependency-free. Exported so the byte structure is unit-tested.
 *
 * Layout: the page (MediaBox) is sized in CSS pixels treated as points; the
 * image is rendered at `pixelRatio` resolution and scaled to fill the page —
 * so e.g. pixelRatio 2 yields a crisp ~144-DPI page with a conventional size.
 */
export function buildImagePdf(jpeg: Uint8Array, cssWidth: number, cssHeight: number, pixelRatio: number): Uint8Array {
  const pageW = Math.max(1, Math.round(cssWidth));
  const pageH = Math.max(1, Math.round(cssHeight));
  const imgW = Math.max(1, Math.round(cssWidth * pixelRatio));
  const imgH = Math.max(1, Math.round(cssHeight * pixelRatio));

  const enc = new TextEncoder();
  const chunks: Uint8Array[] = [];
  let length = 0;
  const offsets: number[] = []; // byte offset of each indirect object (1-based index)
  const str = (s: string) => { const b = enc.encode(s); chunks.push(b); length += b.length; };
  const raw = (b: Uint8Array) => { chunks.push(b); length += b.length; };

  // Header + binary marker comment (4 high-bit bytes signal a binary PDF).
  str('%PDF-1.4\n');
  raw(new Uint8Array([0x25, 0xE2, 0xE3, 0xCF, 0xD3, 0x0A]));

  offsets[1] = length;
  str('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  offsets[2] = length;
  str('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
  offsets[3] = length;
  str(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`);

  // Image XObject — JPEG via DCTDecode. Length is exactly the image byte count;
  // the EOL we emit before endstream is not counted (spec: read Length bytes,
  // then expect EOL + endstream).
  offsets[4] = length;
  str(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imgW} /Height ${imgH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`);
  raw(jpeg);
  str('\nendstream\nendobj\n');

  // Page contents — paint the image to fill the page exactly.
  const content = `q\n${pageW} 0 0 ${pageH} 0 0 cm\n/Im1 Do\nQ\n`;
  offsets[5] = length;
  str(`5 0 obj\n<< /Length ${content.length} >>\nstream\n${content}endstream\nendobj\n`);

  // Cross-reference table (20-byte entries) + trailer.
  const xrefOffset = length;
  const size = 6; // objects 0..5
  str(`xref\n0 ${size}\n`);
  str('0000000000 65535 f \n');
  for (let i = 1; i < size; i++) str(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
  str(`trailer\n<< /Size ${size} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

  const out = new Uint8Array(length);
  let o = 0;
  for (const c of chunks) { out.set(c, o); o += c.length; }
  return out;
}

/** Export the current canvas as a PDF. Throws if there is nothing to export. */
export async function exportCanvasPdf(): Promise<void> {
  const { canvas, clearSelection } = useCanvasStore.getState();
  if (!canvas) return;
  const worldEl = document.querySelector<HTMLElement>('[data-export-root]');
  if (!worldEl) throw new Error('Export root not found');
  const order = visibleOrder(canvas);
  if (order.length === 0) throw new Error('The canvas is empty — add a node before exporting.');
  clearSelection();
  // Let React re-render without the selection outline before capturing.
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

  // Content bounding box — same computation as the PNG export (full logical
  // canvas bounds, not the visible viewport, so off-screen nodes are included).
  const cards = Array.from(worldEl.querySelectorAll<HTMLElement>('.node-card'));
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  order.forEach((id, i) => {
    const node = canvas.nodes[id];
    if (!node) return;
    const el = cards[i];
    const w = el?.offsetWidth || NODE_WIDTH;
    const h = el?.offsetHeight || NODE_MIN_HEIGHT;
    minX = Math.min(minX, node.position.x);
    minY = Math.min(minY, node.position.y);
    maxX = Math.max(maxX, node.position.x + w);
    maxY = Math.max(maxY, node.position.y + h);
  });
  const width = Math.max(1, Math.ceil(maxX - minX));
  const height = Math.max(1, Math.ceil(maxY - minY));

  const pixelRatio = 2;
  const dataUrl = await toJpeg(worldEl, {
    pixelRatio,
    quality: 0.95,
    width,
    height,
    backgroundColor: canvasBoardColor(),
    style: { transform: `translate(${-minX}px, ${-minY}px)` },
    filter: el => !(el instanceof HTMLElement && el.classList.contains('lasso-marquee')),
  });

  // Fetch the data URL → raw JPEG bytes, then wrap in a PDF.
  const resp = await fetch(dataUrl);
  const jpeg = new Uint8Array(await resp.arrayBuffer());
  const pdf = buildImagePdf(jpeg, width, height, pixelRatio);

  const blob = new Blob([pdf], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${sanitize(canvas.name)}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
