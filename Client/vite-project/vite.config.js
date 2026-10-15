import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig(({ mode }) => {
  if (mode === 'production') {
    const { VITE_API_URL } = loadEnv(mode, process.cwd(), '')
    let apiUrl

    try {
      apiUrl = new URL(VITE_API_URL)
    } catch {
      throw new Error('Set VITE_API_URL to the HTTPS origin of the deployed API before building.')
    }

    if (apiUrl.protocol !== 'https:' || apiUrl.pathname !== '/' || apiUrl.search || apiUrl.hash) {
      throw new Error('VITE_API_URL must be an HTTPS API origin without a path, query, or fragment.')
    }
  }

  return {
    plugins: [react(),tailwindcss()],
  }
})
