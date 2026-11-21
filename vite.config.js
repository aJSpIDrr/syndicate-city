import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'node:child_process'

// Build id: commit SHA (CI or local git) + date. Shown in Settings and used to detect new deploys.
const sha = (process.env.GITHUB_SHA || (() => { try { return execSync('git rev-parse HEAD').toString().trim() } catch { return 'dev' } })()).slice(0, 7)
const BUILD = `${sha}-${new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '')}`

// Emits version.json so open games can notice a newer deploy and offer a refresh.
const versionFile = () => ({
  name: 'version-file',
  generateBundle() { this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ build: BUILD }) }) },
})

// base: './' keeps asset paths relative so the build works on GitHub Pages or any static host
export default defineConfig({
  plugins: [react(), versionFile()],
  base: './',
  define: { __BUILD__: JSON.stringify(BUILD) },
})
