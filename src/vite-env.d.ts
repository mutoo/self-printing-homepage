/// <reference types="vite/client" />

declare module "*.html" {
  const source: string;
  export default source;
}
