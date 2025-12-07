declare global {
  interface IAuthUser {
    uid: number;
    pv: number;
    /** Expiration time */
    exp?: number;
    /** Issued at time */
    iat?: number;
    roles?: string[];
  }

  export interface IBaseResponse<T = any> {
    message: string;
    code: number;
    data?: T;
  }

  export interface IListRespData<T = any> {
    items: T[];
  }
}

export {};
