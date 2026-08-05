import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

const { trackEventMock } = vi.hoisted(() => ({
  trackEventMock: vi.fn(),
}));
vi.mock("@/lib/analytics", () => ({
  trackEvent: trackEventMock,
}));

import { ShareButtons } from "./share-buttons";

const URL = "https://gofasta.dev/blog/hello";
const TITLE = "Hello, World";

const POPUP_FEATURES = "noopener,noreferrer,width=580,height=450";

let openSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  trackEventMock.mockClear();
  openSpy = vi.fn();
  vi.stubGlobal("open", openSpy);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderButtons(placement: "header" | "footer" = "header") {
  return render(<ShareButtons url={URL} title={TITLE} placement={placement} />);
}

describe("ShareButtons", () => {
  it("renders one icon button per platform plus copy, in a labelled group", () => {
    renderButtons();
    expect(
      screen.getByRole("group", { name: "Share this post" }),
    ).toBeInTheDocument();
    for (const label of [
      "Share on X",
      "Share on Facebook",
      "Share on LinkedIn",
      "Submit to Hacker News",
      "Share on Reddit",
      "Copy link",
    ]) {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    }
  });

  it("opens the X intent URL in a small popup with url and text params", () => {
    renderButtons();
    fireEvent.click(screen.getByRole("button", { name: "Share on X" }));
    expect(openSpy).toHaveBeenCalledTimes(1);
    const [href, target, features] = openSpy.mock.calls[0];
    expect(href).toContain("x.com/intent/tweet");
    expect(href).toContain(`url=${encodeURIComponent(URL)}`);
    expect(href).toContain(`text=${encodeURIComponent(TITLE)}`);
    expect(target).toBe("_blank");
    expect(features).toBe(POPUP_FEATURES);
  });

  it("opens the Facebook sharer URL with just the u param", () => {
    renderButtons();
    fireEvent.click(screen.getByRole("button", { name: "Share on Facebook" }));
    expect(openSpy).toHaveBeenCalledWith(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(URL)}`,
      "_blank",
      POPUP_FEATURES,
    );
  });

  it("opens the LinkedIn share URL with just the url param", () => {
    renderButtons();
    fireEvent.click(screen.getByRole("button", { name: "Share on LinkedIn" }));
    expect(openSpy).toHaveBeenCalledWith(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(URL)}`,
      "_blank",
      POPUP_FEATURES,
    );
  });

  it("opens the Hacker News submitlink URL with u and t params", () => {
    renderButtons();
    fireEvent.click(
      screen.getByRole("button", { name: "Submit to Hacker News" }),
    );
    const [href] = openSpy.mock.calls[0];
    expect(href).toContain("news.ycombinator.com/submitlink");
    expect(href).toContain(`u=${encodeURIComponent(URL)}`);
    expect(href).toContain(`t=${encodeURIComponent(TITLE)}`);
  });

  it("opens the Reddit submit URL with url and title params", () => {
    renderButtons();
    fireEvent.click(screen.getByRole("button", { name: "Share on Reddit" }));
    const [href] = openSpy.mock.calls[0];
    expect(href).toContain("reddit.com/submit");
    expect(href).toContain(`url=${encodeURIComponent(URL)}`);
    expect(href).toContain(`title=${encodeURIComponent(TITLE)}`);
  });

  it("fires share_click with platform, url, and placement on click", () => {
    renderButtons("header");
    fireEvent.click(screen.getByRole("button", { name: "Share on X" }));
    expect(trackEventMock).toHaveBeenCalledWith("share_click", {
      platform: "x",
      url: URL,
      placement: "header",
    });
  });

  it("carries the footer placement through to the event", () => {
    renderButtons("footer");
    fireEvent.click(screen.getByRole("button", { name: "Share on Reddit" }));
    expect(trackEventMock).toHaveBeenCalledWith("share_click", {
      platform: "reddit",
      url: URL,
      placement: "footer",
    });
  });

  it("only the footer placement renders the divider chrome", () => {
    const { unmount } = renderButtons("footer");
    expect(screen.getByRole("group", { name: "Share this post" }).className)
      .toContain("border-t");
    unmount();
    renderButtons("header");
    expect(screen.getByRole("group", { name: "Share this post" }).className)
      .not.toContain("border-t");
  });

  describe("copy link", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    function stubClipboard(writeText: () => Promise<void>) {
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText },
        configurable: true,
      });
    }

    it("copies the post URL, confirms via tooltip, and reverts after 1.8s", async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      stubClipboard(writeText);
      renderButtons();

      fireEvent.click(screen.getByRole("button", { name: "Copy link" }));
      await act(async () => {
        await Promise.resolve();
      });

      expect(writeText).toHaveBeenCalledWith(URL);
      expect(screen.getByRole("status")).toHaveTextContent("Copied");
      expect(
        screen.getByRole("button", { name: "Copied" }),
      ).toBeInTheDocument();
      expect(trackEventMock).toHaveBeenCalledWith("share_click", {
        platform: "copy",
        url: URL,
        placement: "header",
      });

      act(() => {
        vi.advanceTimersByTime(1800);
      });
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Copy link" }),
      ).toBeInTheDocument();
    });

    it("stays quiet when the clipboard write rejects", async () => {
      stubClipboard(vi.fn().mockRejectedValue(new Error("denied")));
      renderButtons();

      fireEvent.click(screen.getByRole("button", { name: "Copy link" }));
      await act(async () => {
        await Promise.resolve();
      });

      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      expect(trackEventMock).not.toHaveBeenCalled();
    });
  });
});
