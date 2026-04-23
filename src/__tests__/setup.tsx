import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// jsdom doesn't ship IntersectionObserver — provide a no-op stub so
// components that lean on our `useOnScreen` hook can mount under test
// without throwing. Individual tests that need to assert intersection
// behaviour can override this with their own stub.
class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [] as IntersectionObserverEntry[];
  }
}
vi.stubGlobal(
  "IntersectionObserver",
  MockIntersectionObserver as unknown as typeof IntersectionObserver
);

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock next-themes
const mockSetTheme = vi.fn();
vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: mockSetTheme,
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

export { mockSetTheme };
