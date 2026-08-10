// 닉네임 규칙: 한글(완성형)·영문·숫자만 2~10자. 특수문자·공백·자모(ㄱ, ㅏ)는 허용하지 않는다.
const NICKNAME_PATTERN = /^[가-힣a-zA-Z0-9]{2,10}$/

export function isValidNickname(v: string): boolean {
  return NICKNAME_PATTERN.test(v)
}
