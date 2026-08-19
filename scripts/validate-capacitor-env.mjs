import { validateCapacitorServerUrl } from './lib/capacitor-env.mjs'

try {
  validateCapacitorServerUrl(process.env.CAPACITOR_SERVER_URL)
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Invalid Capacitor environment.')
  process.exitCode = 1
}
