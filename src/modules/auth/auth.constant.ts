export const PUBLIC_KEY = '__public_key__';

export const PERMISSION_KEY = '__permission_key__';

export const RESOURCE_KEY = '__resource_key__';

export const ALLOW_ANON_KEY = '__allow_anon_permission_key__';

export const AuthStrategy = {
  LOCAL: 'local',
  LOCAL_EMAIL: 'local_email',
  LOCAL_PHONE: 'local_phone',

  JWT: 'jwt',
} as const;

export const Roles = {
  SUPER_ADMIN: 'super_admin',
  RESTAURANT_OWNER: 'restaurant_owner',
  RESTAURANT_MANAGER: 'restaurant_manager',
  USER: 'user',
  GUEST: 'guest',
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];
