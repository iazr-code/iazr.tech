import { describe, expect, it } from "vitest";

import { encodeQr } from "@/lib/qr";

/**
 * An independent reader for single-block QR codes (versions 1-3, level M):
 * format bits → mask, function map, unmask, zigzag read, Reed-Solomon syndromes
 * (evaluated at α^i, a different method from the encoder's division) and the
 * byte-mode payload.
 */
const EXP: number[] = [];
const LOG: number[] = new Array(256).fill(0);
{
  let x = 1;
  for (let i = 0; i < 255; i += 1) {
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
}
const mul = (a: number, b: number) => (a === 0 || b === 0 ? 0 : EXP[(LOG[a] + LOG[b]) % 255]);

function decode(m: boolean[][]): { text: string; syndromesZero: boolean; level: number; mask: number } {
  const size = m.length;
  const ver = (size - 17) / 4;
  // Format copy 1, read as the encoder writes bits 0..14.
  const coords: [number, number][] = [
    [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8], [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8],
  ];
  let f = 0;
  coords.forEach(([x, y], i) => {
    if (m[y][x]) f |= 1 << i;
  });
  const raw = f ^ 0x5412;
  const level = raw >>> 13;
  const mask = (raw >>> 10) & 7;

  const fn = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
  const mark = (x0: number, y0: number, w: number, h: number) => {
    for (let y = y0; y < y0 + h; y += 1) for (let x = x0; x < x0 + w; x += 1) if (x >= 0 && y >= 0 && x < size && y < size) fn[y][x] = true;
  };
  mark(0, 0, 9, 9);
  mark(size - 8, 0, 8, 9);
  mark(0, size - 8, 9, 8);
  mark(6, 0, 1, size);
  mark(0, 6, size, 1);
  if (ver >= 2) mark(size - 9, size - 9, 5, 5);

  const masks = [
    (x: number, y: number) => (x + y) % 2 === 0,
    (_x: number, y: number) => y % 2 === 0,
    (x: number) => x % 3 === 0,
    (x: number, y: number) => (x + y) % 3 === 0,
    (x: number, y: number) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
    (x: number, y: number) => ((x * y) % 2) + ((x * y) % 3) === 0,
    (x: number, y: number) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
    (x: number, y: number) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
  ];
  const bits: number[] = [];
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert += 1)
      for (let j = 0; j < 2; j += 1) {
        const x = right - j;
        const y = ((right + 1) & 2) === 0 ? size - 1 - vert : vert;
        if (fn[y][x]) continue;
        bits.push(Number(m[y][x] !== masks[mask](x, y)));
      }
  }
  const total = [0, 26, 44, 70][ver];
  const cw: number[] = [];
  for (let i = 0; i < total; i += 1) cw.push(parseInt(bits.slice(i * 8, i * 8 + 8).join(""), 2));
  const ecc = [0, 10, 16, 26][ver];
  // Syndromes: the codeword polynomial vanishes at α^0..α^(ecc-1).
  let zero = true;
  for (let s = 0; s < ecc; s += 1) {
    let acc = 0;
    for (const c of cw) acc = mul(acc, EXP[s]) ^ c;
    if (acc !== 0) zero = false;
  }
  const stream = cw.flatMap((c) => Array.from({ length: 8 }, (_, i) => (c >>> (7 - i)) & 1));
  const read = (from: number, len: number) => parseInt(stream.slice(from, from + len).join(""), 2);
  expect(read(0, 4)).toBe(0b0100);
  const len = read(4, 8);
  const bytes = Array.from({ length: len }, (_, i) => read(12 + i * 8, 8));
  return { text: new TextDecoder().decode(new Uint8Array(bytes)), syndromesZero: zero, level, mask };
}

describe("QR encoder", () => {
  it.each(["https://wa.me/573229132643", "https://iazr.tech", "IA-ZR"])("round-trips %s", (text) => {
    const m = encodeQr(text);
    const r = decode(m);
    expect(r.level).toBe(0); // M
    expect(r.syndromesZero).toBe(true);
    expect(r.text).toBe(text);
  });

  it("draws the three finder patterns", () => {
    const m = encodeQr("https://wa.me/573229132643");
    const n = m.length;
    for (const [x0, y0] of [[0, 0], [n - 7, 0], [0, n - 7]]) {
      expect(m[y0][x0]).toBe(true);
      expect(m[y0 + 1][x0 + 1]).toBe(false);
      expect(m[y0 + 3][x0 + 3]).toBe(true);
    }
  });
});
