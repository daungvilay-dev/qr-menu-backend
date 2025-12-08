import { RedisKeys } from '~/common/constants/cache.constant';

/** Generate captcha redis key */
export function genCaptchaImgKey(val: string | number) {
  return `${RedisKeys.CAPTCHA_IMG_PREFIX}${String(val)}` as const;
}

/** Generate auth token redis key */
export function genAuthTokenKey(val: string | number) {
  return `${RedisKeys.AUTH_TOKEN_PREFIX}${String(val)}` as const;
}
/** Generate auth permission redis key */
export function genAuthPermKey(val: string | number) {
  return `${RedisKeys.AUTH_PERM_PREFIX}${String(val)}` as const;
}
/** Generate auth passwordVersion redis key */
export function genAuthPVKey(val: string | number) {
  return `${RedisKeys.AUTH_PASSWORD_V_PREFIX}${String(val)}` as const;
}
/** Generate online user redis key */
export function genOnlineUserKey(tokenId: string) {
  return `${RedisKeys.ONLINE_USER_PREFIX}${String(tokenId)}` as const;
}
/** Generate token blacklist redis key */
export function genTokenBlacklistKey(tokenId: string) {
  return `${RedisKeys.TOKEN_BLACKLIST_PREFIX}${String(tokenId)}` as const;
}
