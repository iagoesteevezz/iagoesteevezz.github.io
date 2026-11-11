import { defineConfig } from 'vite'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))

const HTML_REDIRECTS = {
  '/about.html': '/about',
  '/work.html': '/work',
  '/contact.html': '/contact',
  '/index.html': '/',
}

function cleanUrls() {
  return {
    name: 'clean-urls',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = (req.url || '').split('?')[0]
        const dest = HTML_REDIRECTS[path]
        if (!dest) return next()
        res.statusCode = 301
        res.setHeader('Location', dest)
        res.end()
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = (req.url || '').split('?')[0]
        const dest = HTML_REDIRECTS[path]
        if (!dest) return next()
        res.statusCode = 301
        res.setHeader('Location', dest)
        res.end()
      })
    },
  }
}

// GitHub Pages lets browsers cache /iago.css and /iago.js for 10 minutes under a fixed URL,
// so a fresh page could pair with a stale stylesheet. Tie the URL to the file's content.
function versionedPublicAssets() {
  const hash = (file) =>
    createHash('md5').update(readFileSync(resolve(__dirname, 'public', file))).digest('hex').slice(0, 8)
  return {
    name: 'versioned-public-assets',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        return html.replace(/(["'])\/(iago\.(?:css|js)|vendor\/[^"'?]+)\1/g, (_, q, file) => `${q}/${file}?v=${hash(file)}${q}`)
      },
    },
  }
}

export default defineConfig({
  base: '/',
  appType: 'mpa',
  plugins: [cleanUrls(), versionedPublicAssets()],
  build: {
    rollupOptions: {
      input: {
        main:    resolve(__dirname, 'index.html'),
        work:    resolve(__dirname, 'work/index.html'),
        about:   resolve(__dirname, 'about/index.html'),
        contact: resolve(__dirname, 'contact/index.html'),
      },
    },
  },
})
