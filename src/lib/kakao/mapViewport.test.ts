import { describe, it, expect, vi } from 'vitest'
import { prepareInitialMapLocation } from '@/lib/kakao/mapViewport'

describe('prepareInitialMapLocation', () => {
  const permission = (state: PermissionState) =>
    ({ query: vi.fn().mockResolvedValue({ state }) }) as unknown as Permissions

  it('이미 허용한 권한이면 지도 생성 전에 현재 좌표를 받는다', async () => {
    const getCurrentPosition = vi.fn((success: PositionCallback) => {
      success({ coords: { latitude: 35.1796, longitude: 129.0756 } } as GeolocationPosition)
    })

    await expect(
      prepareInitialMapLocation(permission('granted'), {
        getCurrentPosition,
      } as unknown as Geolocation)
    ).resolves.toEqual({ permission: 'granted', center: { lat: 35.1796, lng: 129.0756 } })
    expect(getCurrentPosition).toHaveBeenCalledOnce()
    expect(getCurrentPosition).toHaveBeenCalledWith(expect.any(Function), expect.any(Function), {
      enableHighAccuracy: false,
      maximumAge: 5 * 60 * 1000,
      timeout: 8_000,
    })
  })

  it.each(['prompt', 'denied'] as const)(
    '%s 상태에서는 먼저 위치를 요청하지 않는다',
    async (state) => {
      const getCurrentPosition = vi.fn()
      await expect(
        prepareInitialMapLocation(permission(state), {
          getCurrentPosition,
        } as unknown as Geolocation)
      ).resolves.toEqual({ permission: state })
      expect(getCurrentPosition).not.toHaveBeenCalled()
    }
  )

  it('이미 허용했지만 위치 조회가 실패하면 기본 지도로 돌아간다', async () => {
    const getCurrentPosition = vi.fn((_: PositionCallback, error: PositionErrorCallback) => {
      error({ code: 3, PERMISSION_DENIED: 1 } as GeolocationPositionError)
    })
    await expect(
      prepareInitialMapLocation(permission('granted'), {
        getCurrentPosition,
      } as unknown as Geolocation)
    ).resolves.toEqual({ permission: 'granted', center: null })
  })

  it('권한 상태를 읽을 수 없으면 기존 위치 요청 흐름으로 돌아간다', async () => {
    const permissions = {
      query: vi.fn().mockRejectedValue(new Error('unsupported')),
    } as unknown as Permissions
    await expect(prepareInitialMapLocation(permissions)).resolves.toEqual({ permission: 'unknown' })
  })
})
