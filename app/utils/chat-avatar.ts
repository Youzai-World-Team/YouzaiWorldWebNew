// 聊天区没有账号系统，头像按昵称哈希在本地生成，确定性且无需任何网络请求：
// 同一个昵称在任何人的浏览器里都会得到同一张头像。

const PALETTES: Array<[string, string]> = [
  ['#6bb39b', '#dff3ea'],
  ['#4f9d85', '#e4f4ec'],
  ['#7fbf8f', '#e6f5e9'],
  ['#59a4b3', '#e0f1f4'],
  ['#8bb36b', '#eef5e2'],
  ['#a8886b', '#f4ece4'],
  ['#7c8fc4', '#e7ebf7'],
  ['#b3798f', '#f6e8ee'],
]

const GRID = 5
const CELL = 12
const SIZE = GRID * CELL

function hashName(name: string): number {
  // FNV-1a 32 位
  let hash = 0x811c9dc5
  for (let i = 0; i < name.length; i++) {
    hash ^= name.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash >>> 0
}

/**
 * 生成确定性像素方块头像，返回可直接放进 <img src> 的 data URI。
 */
export function chatAvatar(name: string): string {
  const seed = hashName(name.trim().toLowerCase() || 'anonymous')
  const [fg, bg] = PALETTES[seed % PALETTES.length]!

  const rects: string[] = []
  // 只决定左半边（含中列），右半边镜像，得到左右对称的图案。
  const half = Math.ceil(GRID / 2)
  let bits = seed
  for (let x = 0; x < half; x++) {
    for (let y = 0; y < GRID; y++) {
      bits = (Math.imul(bits, 1103515245) + 12345) >>> 0
      if ((bits >>> 16) % 100 < 52) continue
      const mirrored = GRID - 1 - x
      rects.push(`<rect x="${x * CELL}" y="${y * CELL}" width="${CELL}" height="${CELL}"/>`)
      if (mirrored !== x) {
        rects.push(`<rect x="${mirrored * CELL}" y="${y * CELL}" width="${CELL}" height="${CELL}"/>`)
      }
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" `
    + `viewBox="0 0 ${SIZE} ${SIZE}" shape-rendering="crispEdges">`
    + `<rect width="${SIZE}" height="${SIZE}" fill="${bg}"/>`
    + `<g fill="${fg}">${rects.join('')}</g>`
    + '</svg>'

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
