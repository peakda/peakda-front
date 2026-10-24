import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as mutator from '@/api/mutator'
import { ApiError } from '@/lib/utils/apiError'
import { spotDetailApi } from '@/api/facades/spot'

const ok = (data: unknown) => ({
  data: { status: 200, code: 'SUCCESS', message: 'OK', data },
  status: 200,
})

describe('facades/spot spotDetailApi', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('5xx 면 한 번 더 물어 성공 응답을 돌려준다', async () => {
    const spy = vi
      .spyOn(mutator, 'customInstance')
      .mockRejectedValueOnce(new ApiError(503, null))
      .mockResolvedValueOnce(ok({ id: 3710 }))

    expect(await spotDetailApi(3710)).toEqual({ id: 3710 })
    expect(spy).toHaveBeenCalledTimes(2)
  })

  it('다시 물어도 5xx 면 그 에러를 던진다', async () => {
    const spy = vi.spyOn(mutator, 'customInstance').mockRejectedValue(new ApiError(503, null))

    await expect(spotDetailApi(3710)).rejects.toMatchObject({ response: { status: 503 } })
    expect(spy).toHaveBeenCalledTimes(2)
  })

  it('4xx 는 다시 묻지 않는다', async () => {
    const spy = vi.spyOn(mutator, 'customInstance').mockRejectedValue(new ApiError(404, null))

    await expect(spotDetailApi(3710)).rejects.toMatchObject({ response: { status: 404 } })
    expect(spy).toHaveBeenCalledTimes(1)
  })
})
