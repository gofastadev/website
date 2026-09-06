import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { TableOfContents } from "./table-of-contents";
import type { TocItem } from "@/lib/toc";

const ITEMS: TocItem[] = [
  { id: "install", text: "Install", depth: 2 },
  { id: "configure", text: "Configure", depth: 3 },
  { id: "deploy", text: "Deploy", depth: 2 },
];

// Capturing IntersectionObserver stub: records the callback and
// observed elements so tests can drive intersection changes by hand.
class CapturingIO {
  static instance: CapturingIO | null = null;
  callback: IntersectionObserverCallback;
  observed: Element[] = [];
  constructor(cb: IntersectionObserverCallback) {
    this.callback = cb;
    CapturingIO.instance = this;
  }
  observe(el: Element) {
    this.observed.push(el);
  }
  unobserve() {}
  disconnect() {}
}

function mountHeadings() {
  for (const item of ITEMS) {
    const h = document.createElement("h2");
    h.id = item.id;
    document.body.appendChild(h);
  }
}

beforeEach(() => {
  CapturingIO.instance = null;
  vi.stubGlobal("IntersectionObserver", CapturingIO);
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

describe("TableOfContents", () => {
  it("renders nothing with fewer than 2 items", () => {
    const { container } = render(
      <TableOfContents items={[ITEMS[0]]} variant="sidebar" />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("sidebar renders a labelled nav with fragment links, indented by depth", () => {
    mountHeadings();
    render(<TableOfContents items={ITEMS} variant="sidebar" />);
    const nav = screen.getByRole("navigation", { name: "On this page" });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Install" })).toHaveAttribute(
      "href",
      "#install",
    );
    const configureLi = screen
      .getByRole("link", { name: "Configure" })
      .closest("li");
    expect(configureLi?.className).toContain("pl-3");
  });

  it("observes every heading and highlights the intersecting one", () => {
    mountHeadings();
    render(<TableOfContents items={ITEMS} variant="sidebar" />);
    const io = CapturingIO.instance;
    expect(io).not.toBeNull();
    expect(io!.observed.map((el) => el.id)).toEqual([
      "install",
      "configure",
      "deploy",
    ]);

    act(() => {
      io!.callback(
        [
          {
            target: document.getElementById("deploy")!,
            isIntersecting: true,
          } as unknown as IntersectionObserverEntry,
        ],
        io as unknown as IntersectionObserver,
      );
    });
    expect(screen.getByRole("link", { name: "Deploy" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(
      screen.getByRole("link", { name: "Install" }),
    ).not.toHaveAttribute("aria-current");
  });

  it("keeps the previous highlight while the reader is between headings", () => {
    mountHeadings();
    render(<TableOfContents items={ITEMS} variant="sidebar" />);
    const io = CapturingIO.instance!;
    act(() => {
      io.callback(
        [
          {
            target: document.getElementById("configure")!,
            isIntersecting: true,
          } as unknown as IntersectionObserverEntry,
        ],
        io as unknown as IntersectionObserver,
      );
    });
    expect(screen.getByRole("link", { name: "Configure" })).toHaveAttribute(
      "aria-current",
      "true",
    );

    // The heading scrolls out of the active band with nothing replacing
    // it — the highlight must stay put rather than clearing.
    act(() => {
      io.callback(
        [
          {
            target: document.getElementById("configure")!,
            isIntersecting: false,
          } as unknown as IntersectionObserverEntry,
        ],
        io as unknown as IntersectionObserver,
      );
    });
    expect(screen.getByRole("link", { name: "Configure" })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  it("prefers the first document-order heading when several intersect", () => {
    mountHeadings();
    render(<TableOfContents items={ITEMS} variant="sidebar" />);
    const io = CapturingIO.instance!;
    act(() => {
      io.callback(
        ["install", "configure"].map(
          (id) =>
            ({
              target: document.getElementById(id)!,
              isIntersecting: true,
            }) as unknown as IntersectionObserverEntry,
        ),
        io as unknown as IntersectionObserver,
      );
    });
    expect(screen.getByRole("link", { name: "Install" })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  it("skips observing TOC entries whose headings are not in the document", () => {
    // Only two of the three headings exist — the id extracted from the
    // MDX body can diverge from the rendered DOM (JSX in a heading).
    for (const item of ITEMS.slice(0, 2)) {
      const h = document.createElement("h2");
      h.id = item.id;
      document.body.appendChild(h);
    }
    render(<TableOfContents items={ITEMS} variant="sidebar" />);
    expect(CapturingIO.instance!.observed.map((el) => el.id)).toEqual([
      "install",
      "configure",
    ]);
  });

  it("inline renders a details/summary box hidden at xl, without an observer", () => {
    render(<TableOfContents items={ITEMS} variant="inline" />);
    const summary = screen.getByText("On this page", { selector: "summary" });
    const details = summary.closest("details");
    expect(details).not.toBeNull();
    expect(details!.className).toContain("xl:hidden");
    expect(CapturingIO.instance).toBeNull();
    expect(screen.getByRole("link", { name: "Deploy" })).toHaveAttribute(
      "href",
      "#deploy",
    );
  });
});
