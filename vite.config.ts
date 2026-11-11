/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // relative base so the build also works from a sub-path (e.g. GitHub Pages)
  base: './',
  // subagent worktrees live under .claude/ — don't let their edits reload this dev server
  server: { watch: { ignored: ['**/.claude/**'] } },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/.claude/**'],
  },
})
