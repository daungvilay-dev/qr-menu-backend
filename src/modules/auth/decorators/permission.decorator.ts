import { applyDecorators, SetMetadata } from '@nestjs/common';

import { isPlainObject } from 'lodash';

import { PERMISSION_KEY, ROLE_KEY, Role } from '../auth.constant';

type TupleToObject<T extends string, P extends ReadonlyArray<string>> = {
  [K in Uppercase<P[number]>]: `${T}:${Lowercase<K>}`;
};
type AddPrefixToObjectValue<
  T extends string,
  P extends Record<string, string>,
> = {
  [K in keyof P]: K extends string ? `${T}:${P[K]}` : never;
};

/** Resource operations require specific permissions */
export function Perm(permission: string | string[]) {
  return applyDecorators(SetMetadata(PERMISSION_KEY, permission));
}

/** Restrict route by role(s) */
export function RoleAccess(role: Role | Role[]) {
  return applyDecorators(
    SetMetadata(ROLE_KEY, Array.isArray(role) ? role : [role]),
  );
}

/** (This is not required) Save all permissions defined by definePermission, which can be used for ts type hints during the development phase of front-end developers to avoid mismatches between front-end permission definitions and back-end definitions */
let permissions: string[] = [];
/**
 * Define permissions and collect all defined permissions
 *
 * - Define in object form, eg:
 * ```ts
 * definePermission('app:health', {
 * NETWORK: 'network'
 * };
 * ```
 *
 * - Define in string array form, eg:
 * ```ts
 * definePermission('app:health', ['network']);
 * ```
 */
export function definePermission<
  T extends string,
  U extends Record<string, string>,
>(modulePrefix: T, actionMap: U): AddPrefixToObjectValue<T, U>;
export function definePermission<
  T extends string,
  U extends ReadonlyArray<string>,
>(modulePrefix: T, actions: U): TupleToObject<T, U>;
export function definePermission(modulePrefix: string, actions) {
  if (isPlainObject(actions)) {
    Object.entries(actions).forEach(([key, action]) => {
      actions[key] = `${modulePrefix}:${action}`;
    });
    permissions = [
      ...new Set([...permissions, ...Object.values<string>(actions)]),
    ];
    return actions;
  } else if (Array.isArray(actions)) {
    const permissionFormats = actions.map(
      (action) => `${modulePrefix}:${action}`,
    );
    permissions = [...new Set([...permissions, ...permissionFormats])];

    return actions.reduce((prev, action) => {
      prev[action.toUpperCase()] = `${modulePrefix}:${action}`;
      return prev;
    }, {});
  }
}

/** Get all permissions defined by definePermission */
export const getDefinePermissions = () => permissions;
