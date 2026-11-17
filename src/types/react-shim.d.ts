// Minimal typings for React: @types/react could not be installed in the build
// environment (no network). Engine/data/services code is fully type-checked;
// UI components are checked for their calls into the engine. Replace with
// `npm i -D @types/react @types/react-dom` in a normal setup.
declare module 'react' {
  export const useState: any, useEffect: any, useRef: any, useMemo: any, useCallback: any, useContext: any, createContext: any, Fragment: any, StrictMode: any;
  const React: any;
  export default React;
}
declare module 'react/jsx-runtime' {
  export const jsx: any, jsxs: any, Fragment: any;
  export namespace JSX {
    interface Element {}
    interface ElementChildrenAttribute { children: {} }
    interface IntrinsicAttributes { key?: any }
    interface IntrinsicElements { [name: string]: any }
  }
}
declare module 'react-dom/client' { export const createRoot: any; }
