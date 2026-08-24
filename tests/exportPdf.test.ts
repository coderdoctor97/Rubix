import { describe, it, expect } from 'vitest';
import { buildImagePdf } from '../src/lib/exportPdf';

// A tiny stand-in for a baseline JPEG. buildImagePdf embeds the bytes verbatim
// (PDF /DCTDecode), so the exact contents don't matter for structural tests —
// only that they are preserved byte-for-byte inside the document.
const FAKE_JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x01, 0x02, 0x03, 0xff, 0xd9]);

function decode(pdf: Uint8Array): string {
  return new TextDecoder('latin1').decode(pdf);
}

describe('buildImagePdf — minimal single-image PDF', () => {
  const pdf = buildImagePdf(FAKE_JPEG, 800, 600, 2);
  const text = decode(pdf);

  it('starts with the PDF header and ends with the EOF marker', () => {
    expect(text.startsWith('%PDF-1.4')).toBe(true);
    expect(text.trimEnd().endsWith('%%EOF')).toBe(true);
  });

  it('declares the required object graph (catalog, pages, page, image, contents)', () => {
    expect(text).toContain('/Type /Catalog');
    expect(text).toContain('/Type /Pages');
    expect(text).toContain('/Kids [3 0 R]');
    expect(text).toContain('/Type /Page');
    expect(text).toContain('/Type /XObject');
    expect(text).toContain('/Subtype /Image');
    expect(text).toContain('/Filter /DCTDecode');
    expect(text).toContain('/ColorSpace /DeviceRGB');
    expect(text).toContain('/BitsPerComponent 8');
  });

  it('sizes the page in CSS points and the image at pixelRatio resolution', () => {
    // MediaBox uses the CSS dimensions as points; image XObject uses px*pixelRatio.
    expect(text).toContain('/MediaBox [0 0 800 600]');
    expect(text).toContain('/Width 1600');
    expect(text).toContain('/Height 1200');
    // Content stream paints the image to fill the whole page.
    expect(text).toContain('800 0 0 600 0 0 cm');
    expect(text).toContain('/Im1 Do');
  });

  it('embeds the JPEG bytes verbatim with the correct stream length', () => {
    expect(text).toContain(`/Length ${FAKE_JPEG.length}`);
    // The raw image bytes must appear inside the stream, between stream/endstream.
    const streamStart = text.indexOf('stream\n') + 'stream\n'.length;
    const streamEnd = text.indexOf('\nendstream');
    const segment = text.slice(streamStart, streamEnd);
    expect(segment.length).toBe(FAKE_JPEG.length);
    expect(segment.charCodeAt(0)).toBe(0xff);
    expect(segment.charCodeAt(segment.length - 1)).toBe(0xd9);
  });

  it('has a /Size trailer matching the object count and a valid root', () => {
    expect(text).toContain('/Root 1 0 R');
    expect(text).toContain('/Size 6');
  });

  it('points startxref at the actual byte offset of the xref table', () => {
    const m = text.match(/startxref\n(\d+)\n/);
    expect(m).not.toBeNull();
    const offset = Number(m![1]);
    expect(text.slice(offset, offset + 4)).toBe('xref');
  });

  it('every xref entry points to its "N 0 obj" header', () => {
    // Parse each in-use entry; verify the offset lands on "<num> 0 obj".
    const entries = [...text.matchAll(/(\d{10}) 00000 n/g)];
    expect(entries.length).toBe(5); // objects 1..5
    entries.forEach((e, i) => {
      const offset = Number(e[1]);
      const num = i + 1;
      expect(text.slice(offset).startsWith(`${num} 0 obj\n`)).toBe(true);
    });
  });

  it('produces a stable, deterministic byte length', () => {
    const again = buildImagePdf(FAKE_JPEG, 800, 600, 2);
    expect(again.length).toBe(pdf.length);
    expect(Array.from(again)).toEqual(Array.from(pdf));
  });

  it('clamps zero dimensions without throwing', () => {
    const tiny = buildImagePdf(new Uint8Array([1, 2, 3]), 0, 0, 1);
    const t = decode(tiny);
    expect(t).toContain('/MediaBox [0 0 1 1]');
    expect(t).toContain('/Width 1');
    expect(t).toContain('/Height 1');
  });
});
