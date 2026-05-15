import {
  checkNickname,
  completeSignup,
  getCurrentUser,
  logout,
  refresh,
} from "@/api/generated/auth/auth";
import type { SignupCompleteRequest } from "@/api/generated/peakdaApi.schemas";

// 언래핑 규칙: res.data (Orval 래퍼) → res.data.data (백엔드 실제 payload)

export async function getCurrentUserApi() {
  const res = await getCurrentUser();
  return res.data.data ?? null;
}

export async function checkNicknameApi(nickname: string) {
  const res = await checkNickname({ value: nickname });
  return res.data.data ?? null;
}

export async function completeSignupApi(payload: SignupCompleteRequest) {
  await completeSignup(payload);
}

export async function refreshApi() {
  await refresh();
}

export async function logoutApi() {
  await logout();
}
