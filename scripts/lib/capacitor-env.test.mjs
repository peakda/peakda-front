import { describe, expect, it } from 'vitest'
import { validateCapacitorServerUrl } from './capacitor-env.mjs'

describe('validateCapacitorServerUrl', () => {
  it('accepts an HTTPS origin', () => {
    expect(validateCapacitorServerUrl('https://app.peakda.example')).toBe('https://app.peakda.example')
  })

  it.each([
    [undefined, 'required'],
    ['', 'required'],
    ['peakda.example', 'valid absolute URL'],
    ['http://peakda.example', 'HTTPS origin'],
    ['https://peakda.example/app', 'HTTPS origin'],
    ['https://peakda.example?preview=true', 'HTTPS origin'],
    ['https://peakda.example/#app', 'HTTPS origin'],
  ])('rejects %s', (value, message) => {
    expect(() => validateCapacitorServerUrl(value)).toThrow(message)
  })
})
