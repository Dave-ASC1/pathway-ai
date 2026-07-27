import "@testing-library/jest-dom/vitest";

// jsdom doesn't implement SVG geometry APIs or matchMedia. Components like
// JourneyBoard use these purely for its road-trip animation, which is
// irrelevant to what our component tests assert, so we stub them out.
// This jsdom build has no specialized SVGPathElement class — <path> elements
// are plain SVGElement instances — so the geometry stubs go on SVGElement.
if (typeof window !== "undefined" && window.SVGElement) {
  Object.assign(window.SVGElement.prototype, {
    getTotalLength: () => 100,
    getPointAtLength: () => ({ x: 0, y: 0 }) as DOMPoint,
  });
}

if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
