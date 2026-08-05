import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NavLinks } from "./nav-links";

const trackEventSpy = vi.fn();
vi.mock("@/lib/analytics", () => ({
  trackEvent: (...args: unknown[]) => trackEventSpy(...args),
}));

// usePathname drives the active-link state; each test sets the mock's
// return value to the route under test (default: "/", which matches
// none of the nav hrefs).
const usePathnameMock = vi.fn<() => string | null>();
vi.mock("next/navigation", () => ({
  usePathname: () => usePathnameMock(),
}));

describe("NavLinks", () => {
  beforeEach(() => {
    trackEventSpy.mockReset();
    usePathnameMock.mockReset();
    usePathnameMock.mockReturnValue("/");
  });

  it("renders Docs, Blog, and GitHub links in header variant", () => {
    render(<NavLinks variant="header" />);
    expect(screen.getByText("Docs")).toBeInTheDocument();
    expect(screen.getByText("Blog")).toBeInTheDocument();
    expect(screen.getByText("GitHub")).toBeInTheDocument();
  });

  it("does not render footer-only links in header variant", () => {
    render(<NavLinks variant="header" />);
    expect(screen.queryByText("License")).not.toBeInTheDocument();
    expect(screen.queryByText("White Paper")).not.toBeInTheDocument();
  });

  it("renders all links in footer variant", () => {
    render(<NavLinks variant="footer" />);
    expect(screen.getByText("Docs")).toBeInTheDocument();
    expect(screen.getByText("GitHub")).toBeInTheDocument();
    expect(screen.getByText("White Paper")).toBeInTheDocument();
    expect(screen.getByText("License")).toBeInTheDocument();
  });

  it("White Paper link points to docs white paper page", () => {
    render(<NavLinks variant="footer" />);
    expect(screen.getByText("White Paper")).toHaveAttribute(
      "href",
      "/docs/white-paper"
    );
  });

  it("defaults to header variant", () => {
    render(<NavLinks />);
    expect(screen.queryByText("License")).not.toBeInTheDocument();
    expect(screen.queryByText("White Paper")).not.toBeInTheDocument();
  });

  it("Docs link points to getting started", () => {
    render(<NavLinks />);
    expect(screen.getByText("Docs")).toHaveAttribute(
      "href",
      "/docs/getting-started/introduction"
    );
  });

  it("GitHub link opens in new tab", () => {
    render(<NavLinks />);
    const github = screen.getByText("GitHub");
    expect(github).toHaveAttribute("target", "_blank");
    expect(github).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("applies custom className", () => {
    const { container } = render(<NavLinks className="my-class" />);
    expect(container.firstChild).toHaveClass("my-class");
  });

  // Click-tracking coverage for every link in both variants. The
  // analytics layer is the only thing being verified here — actual
  // navigation is handled by next/link and is out of scope for unit
  // tests.

  it("header Docs click fires nav_to_docs", () => {
    render(<NavLinks variant="header" />);
    fireEvent.click(screen.getByText("Docs"));
    expect(trackEventSpy).toHaveBeenCalledWith("nav_to_docs", {
      destination: "/docs/getting-started/introduction",
    });
  });

  it("header GitHub click fires nav_to_github_library", () => {
    render(<NavLinks variant="header" />);
    fireEvent.click(screen.getByText("GitHub"));
    expect(trackEventSpy).toHaveBeenCalledWith("nav_to_github_library", {
      destination: "https://github.com/gofastadev/gofasta",
    });
  });

  it("Blog link points to /blog", () => {
    render(<NavLinks variant="header" />);
    expect(screen.getByText("Blog")).toHaveAttribute("href", "/blog");
  });

  it("header Blog click fires nav_to_blog", () => {
    render(<NavLinks variant="header" />);
    fireEvent.click(screen.getByText("Blog"));
    expect(trackEventSpy).toHaveBeenCalledWith("nav_to_blog", {
      destination: "/blog",
    });
  });

  it("footer Blog click fires footer_link_click with label=Blog", () => {
    render(<NavLinks variant="footer" />);
    fireEvent.click(screen.getByText("Blog"));
    expect(trackEventSpy).toHaveBeenCalledWith("footer_link_click", {
      label: "Blog",
      destination: "/blog",
    });
  });

  it("footer Docs click fires footer_link_click with label=Docs", () => {
    render(<NavLinks variant="footer" />);
    fireEvent.click(screen.getByText("Docs"));
    expect(trackEventSpy).toHaveBeenCalledWith("footer_link_click", {
      label: "Docs",
      destination: "/docs/getting-started/introduction",
    });
  });

  it("footer GitHub click fires footer_link_click with label=GitHub", () => {
    render(<NavLinks variant="footer" />);
    fireEvent.click(screen.getByText("GitHub"));
    expect(trackEventSpy).toHaveBeenCalledWith("footer_link_click", {
      label: "GitHub",
      destination: "https://github.com/gofastadev/gofasta",
    });
  });

  it("footer White Paper click fires footer_link_click", () => {
    render(<NavLinks variant="footer" />);
    fireEvent.click(screen.getByText("White Paper"));
    expect(trackEventSpy).toHaveBeenCalledWith("footer_link_click", {
      label: "White Paper",
      destination: "/docs/white-paper",
    });
  });

  it("footer Sitemap click fires footer_link_click", () => {
    render(<NavLinks variant="footer" />);
    fireEvent.click(screen.getByText("Sitemap"));
    expect(trackEventSpy).toHaveBeenCalledWith("footer_link_click", {
      label: "Sitemap",
      destination: "/sitemap",
    });
  });

  it("footer Cookies click fires footer_link_click", () => {
    render(<NavLinks variant="footer" />);
    fireEvent.click(screen.getByText("Cookies"));
    expect(trackEventSpy).toHaveBeenCalledWith("footer_link_click", {
      label: "Cookies",
      destination: "/cookies",
    });
  });

  // llms.txt / llms-full.txt in the footer. These are the site-wide
  // inbound links that make the files crawlable at all — before them
  // the files had no hyperlink anywhere and stayed out of every search
  // index despite returning HTTP 200.

  it("renders both llms files in footer variant only", () => {
    const { unmount } = render(<NavLinks variant="footer" />);
    expect(screen.getByText("llms.txt")).toHaveAttribute("href", "/llms.txt");
    expect(screen.getByText("llms-full.txt")).toHaveAttribute(
      "href",
      "/llms-full.txt"
    );
    unmount();

    render(<NavLinks variant="header" />);
    expect(screen.queryByText("llms.txt")).not.toBeInTheDocument();
    expect(screen.queryByText("llms-full.txt")).not.toBeInTheDocument();
  });

  it("footer llms.txt click fires footer_link_click", () => {
    render(<NavLinks variant="footer" />);
    fireEvent.click(screen.getByText("llms.txt"));
    expect(trackEventSpy).toHaveBeenCalledWith("footer_link_click", {
      label: "llms.txt",
      destination: "/llms.txt",
    });
  });

  it("footer llms-full.txt click fires footer_link_click", () => {
    render(<NavLinks variant="footer" />);
    fireEvent.click(screen.getByText("llms-full.txt"));
    expect(trackEventSpy).toHaveBeenCalledWith("footer_link_click", {
      label: "llms-full.txt",
      destination: "/llms-full.txt",
    });
  });

  it("footer License click fires footer_link_click", () => {
    render(<NavLinks variant="footer" />);
    fireEvent.click(screen.getByText("License"));
    expect(trackEventSpy).toHaveBeenCalledWith("footer_link_click", {
      label: "License",
      destination: "https://github.com/gofastadev/gofasta/blob/main/LICENSE",
    });
  });

  // Active-state coverage — the current route's link gets aria-current
  // plus the active color/weight; every other link stays in the
  // inactive style with no aria-current attribute.

  it("marks the link matching the current pathname as active", () => {
    usePathnameMock.mockReturnValue("/docs/getting-started/introduction");
    render(<NavLinks variant="header" />);
    const docsLink = screen.getByText("Docs");
    expect(docsLink).toHaveAttribute("aria-current", "page");
    expect(docsLink).toHaveClass("text-foreground", "font-medium");
  });

  it("does not mark non-matching links as active", () => {
    usePathnameMock.mockReturnValue("/docs/getting-started/introduction");
    render(<NavLinks variant="header" />);
    const blogLink = screen.getByText("Blog");
    expect(blogLink).not.toHaveAttribute("aria-current");
    expect(blogLink).toHaveClass("text-gray-600", "dark:text-gray-400");
  });

  it("marks the Blog link as active on /blog", () => {
    usePathnameMock.mockReturnValue("/blog");
    render(<NavLinks variant="header" />);
    expect(screen.getByText("Blog")).toHaveAttribute("aria-current", "page");
  });

  it("marks no link as active when the pathname matches none of them", () => {
    usePathnameMock.mockReturnValue("/some-other-page");
    render(<NavLinks variant="header" />);
    expect(screen.getByText("Docs")).not.toHaveAttribute("aria-current");
    expect(screen.getByText("Blog")).not.toHaveAttribute("aria-current");
  });

  it("applies font-mono text-xs typography to footer links", () => {
    render(<NavLinks variant="footer" />);
    expect(screen.getByText("Docs")).toHaveClass("font-mono", "text-xs");
  });

  // /blog is the one link that needs prefix matching: the landing
  // navbar/footer also render on /blog/[slug] post pages, so Blog
  // should stay highlighted there — unlike Docs, which must NOT
  // prefix-match (it would collide with /docs/white-paper).

  it("marks the Blog link as active on a /blog/[slug] post page", () => {
    usePathnameMock.mockReturnValue("/blog/some-post");
    render(<NavLinks variant="header" />);
    expect(screen.getByText("Blog")).toHaveAttribute("aria-current", "page");
  });

  it("does not mark Docs as active on /docs/white-paper", () => {
    usePathnameMock.mockReturnValue("/docs/white-paper");
    render(<NavLinks variant="footer" />);
    expect(screen.getByText("Docs")).not.toHaveAttribute("aria-current");
  });
});
