// Global type declarations to allow IDE to work without node_modules installed
// These are stubs only — actual types come from installed packages at build time

declare namespace React {
  type FC<P = {}> = (props: P) => any;
  type ReactNode = any;
  type FormEvent<T = Element> = any;
  type ChangeEvent<T = Element> = any;
  type MouseEvent<T = Element> = any;
  function useState<T>(init: T | (() => T)): [T, (v: T | ((prev: T) => T)) => void];
  function useEffect(fn: () => void | (() => void), deps?: any[]): void;
  function useMemo<T>(fn: () => T, deps: any[]): T;
  function useCallback<T extends (...args: any[]) => any>(fn: T, deps: any[]): T;
  function useRef<T>(init?: T): { current: T };
  function lazy<T>(fn: () => Promise<{ default: T }>): T;
  const Suspense: any;
  function createContext<T>(defaultValue: T): any;
  function useContext<T>(ctx: any): T;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
  type Element = any;
  type ElementType = any;
}

// Stub module declarations for packages that may not be installed locally
declare module 'react' {
  export = React;
  export as namespace React;
  const _default: typeof React & { default: typeof React };
  export default _default;
}
declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}
declare module 'react-router-dom';
declare module 'lucide-react';
declare module 'recharts';
declare module 'date-fns';
declare module 'react-i18next';
declare module 'i18next';
declare module 'i18next-browser-languagedetector';
declare module '@supabase/supabase-js';
