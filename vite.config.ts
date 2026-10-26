import build from '@hono/vite-build/cloudflare-pages'
import devServer from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'
import { defineConfig } from 'vite'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

// 정적 CSS/JS 캐시버스팅: 파일 내용 해시를 ?v= 로 (수동 버전 문자열 갱신 누락 방지, 2026-10-26)
const assetHash = (files: string[]) => {
  const h = createHash('sha1')
  for (const f of files) h.update(readFileSync(new URL(f, import.meta.url)))
  return h.digest('hex').slice(0, 10)
}
const ASSET_V = assetHash(['./public/static/style.css', './public/static/app.js'])
const ADMIN_ASSET_V = assetHash(['./public/static/style.css', './public/static/admin.css', './public/static/admin.js'])

export default defineConfig({
  define: {
    __ASSET_V__: JSON.stringify(ASSET_V),
    __ADMIN_ASSET_V__: JSON.stringify(ADMIN_ASSET_V),
  },
  plugins: [
    build(),
    devServer({
      adapter,
      entry: 'src/index.tsx'
    })
  ]
})
