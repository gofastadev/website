import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const trackEventMock = vi.fn();
vi.mock("@/lib/analytics", () => ({
  trackEvent: trackEventMock,
}));

import { ShareButtons } from "./share-buttons";

const URL = "https://gofasta.dev/blog/hello";
const TITLE = "Hello, World";

beforeEach(() => {
  trackEventMock.mockClear();
});

describe("ShareButtons", () => {
  it("renders one external-target link per platform with a labelled group", () => {
    render(<ShareButtons url={URL} title={TITLE} />);
    expect(
      screen.getByRole("group", { name: "Share this post" }),
    ).toBeInTheDocument();
    for (const label of [
      "Share on X",
      "Share on LinkedIn",
      "Submit to Hacker News",
      "Share on Reddit",
    ]) {
      const link = screen.getByRole("link", { name: label });
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("builds the X intent URL with url and text query params", () => {
    render(<ShareButtons url={URL} title={TITLE} />);
    const href = screen
      .getByRole("link", { name: "Share on X" })
      .getAttribute("href");
    expect(href).toContain("x.com/intent/tweet");
    expect(href).toContain(`url=${encodeURIComponent(URL)}`);
    expect(href).toContain(`text=${encodeURIComponent(TITLE)}`);
  });

  it("builds the LinkedIn share URL with just the url param", () => {
    render(<ShareButtons url={URL} title={TITLE} />);
    expect(
      screen.getByRole("link", { name: "Share on LinkedIn" }),
    ).toHaveAttribute(
      "href",
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(URL)}`,
    );
  });

  it("builds the Hacker News submitlink URL with u and t params", () => {
    render(<ShareButtons url={URL} title={TITLE} />);
    const href = screen
      .getByRole("link", { name: "Submit to Hacker News" })
      .getAttribute("href");
    expect(href).toContain("news.ycombinator.com/submitlink");
    expect(href).toContain(`u=${encodeURIComponent(URL)}`);
    expect(href).toContain(`t=${encodeURIComponent(TITLE)}`);
  });

  it("builds the Reddit submit URL with url and title params", () => {
    render(<ShareButtons url={URL} title={TITLE} />);
    const href = screen
      .getByRole("link", { name: "Share on Reddit" })
      .getAttribute("href");
    expect(href).toContain("reddit.com/submit");
    expect(href).toContain(`url=${encodeURIComponent(URL)}`);
    expect(href).toContain(`title=${encodeURIComponent(TITLE)}`);
  });

  it("fires share_click with the platform key and url on click", () => {
    render(<ShareButtons url={URL} title={TITLE} />);
    fireEvent.click(screen.getByRole("link", { name: "Share on X" }));
    fireEvent.click(screen.getByRole("link", { name: "Share on LinkedIn" }));
    fireEvent.click(screen.getByRole("link", { name: "Submit to Hacker News" }));
    fireEvent.click(screen.getByRole("link", { name: "Share on Reddit" }));
    expect(trackEventMock).toHaveBeenCalledWith("share_click", {
      platform: "x",
      url: URL,
    });
    expect(trackEventMock).toHaveBeenCalledWith("share_click", {
      platform: "linkedin",
      url: URL,
    });
    expect(trackEventMock).toHaveBeenCalledWith("share_click", {
      platform: "hackernews",
      url: URL,
    });
    expect(trackEventMock).toHaveBeenCalledWith("share_click", {
      platform: "reddit",
      url: URL,
    });
  });
});
