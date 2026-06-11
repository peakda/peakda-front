import { vi, describe, it, expect, beforeEach } from "vitest";
import * as mutator from "@/api/mutator";
import { checkNicknameApi, getCurrentUserApi, logoutApi } from "./auth";

describe("facades/auth", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("getCurrentUserApi — 유저 정보 반환", async () => {
    const mockUser = {
      id: 1,
      email: "a@b.com",
      nickname: "테스트",
      profileImageUrl: null,
      status: "ACTIVE" as const,
    };
    vi.spyOn(mutator, "customInstance").mockResolvedValue({
      data: { status: 200, code: "SUCCESS", message: "ok", data: mockUser },
      status: 200,
    });
    expect(await getCurrentUserApi()).toEqual(mockUser);
  });

  it("checkNicknameApi — 사용 가능한 닉네임", async () => {
    vi.spyOn(mutator, "customInstance").mockResolvedValue({
      data: { status: 200, code: "SUCCESS", message: "사용 가능", data: { available: true } },
      status: 200,
    });
    expect((await checkNicknameApi("테스트닉네임")).data).toEqual({ available: true });
  });

  it("HTTP 에러 — throw 전파", async () => {
    vi.spyOn(mutator, "customInstance").mockRejectedValue({
      response: { status: 401, data: { message: "인증이 필요합니다" } },
    });
    await expect(getCurrentUserApi()).rejects.toMatchObject({ response: { status: 401 } });
  });

  it("logoutApi — 반환값 없음", async () => {
    vi.spyOn(mutator, "customInstance").mockResolvedValue({
      data: { status: 200, code: "SUCCESS", message: "로그아웃 완료" },
      status: 200,
    });
    await expect(logoutApi()).resolves.toBeUndefined();
  });
});
