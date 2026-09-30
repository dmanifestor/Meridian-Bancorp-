/// <reference types="vite/client" />

declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

declare module 'sqlite3' {
  const sqlite3: any;
  export default sqlite3;
}

declare module 'sqlite' {
  export function open(config: any): Promise<any>;
  export interface Database {
    exec(sql: string): Promise<any>;
    all(sql: string, params?: any[]): Promise<any[]>;
    get(sql: string, params?: any[]): Promise<any>;
    run(sql: string, params?: any[]): Promise<any>;
  }
}

