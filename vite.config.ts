import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  server: {
    port: 3000,
    open: '/login',
  },
  plugins: [
    devtools(),
    nitro({ rollupConfig: { external: [/^@sentry\//] } }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    {
      name: 'custom-login-url',
      configureServer(server) {
        const originalPrintUrls = server.printUrls
        server.printUrls = () => {
          if (server.resolvedUrls?.local) {
            server.resolvedUrls.local = server.resolvedUrls.local.map((url) =>
              url.endsWith('/login')
                ? url
                : `${url.replace(/\/$/, '')}/login`,
            )
          }
          originalPrintUrls()
        }
      },
    },
  ],
})

export default config