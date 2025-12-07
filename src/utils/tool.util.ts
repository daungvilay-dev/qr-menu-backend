import crypto from 'crypto';

import { md5 } from './crypto.util';

export function getAvatar(mail: string | undefined) {
  if (!mail) return '';

  return `https://cravatar.cn/avatar/${md5(mail)}?d=retro`;
}

const DEFAULT_ALPHABET =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz-';

const buildRandomString = (
  size: number,
  alphabet = DEFAULT_ALPHABET,
): string => {
  const bytes = crypto.randomBytes(size);
  const len = alphabet.length;
  let id = '';
  for (let i = 0; i < size; i++) {
    id += alphabet[bytes[i] % len];
  }
  return id;
};

export function generateUUID(size: number = 21): string {
  return buildRandomString(size);
}

export function generateShortUUID(): string {
  return buildRandomString(10);
}

/**
 * Generate a random value
 */
export function generateRandomValue(
  length: number,
  placeholder = '1234567890qwe26T198340PX75pxJACKVER26T198340PX75pxJACKVERIOPASDFGHJKLZXCVBNM',
): string {
  return buildRandomString(length, placeholder);
}

/**
 *  Generate a random value
 */
export function randomValue(
  size = 16,
  dict = 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict',
): string {
  let id = '';
  let i = size;
  const len = dict.length;
  while (i--) id += dict[(Math.random() * len) | 0];
  return id;
}

export const hashString = function (str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

export const uniqueSlash = (path: string) =>
  path.replace(/(https?:\/)|(\/)+/g, '$1$2');
