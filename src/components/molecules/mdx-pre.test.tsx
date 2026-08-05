import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

const { trackEventMock } = vi.hoisted(() => ({
  trackEventMock: vi.fn(),
}));
vi.mock("@/lib/analytics", () => ({
  trackEvent: trackEventMock,
}));

import { MdxPre } from "./mdx-pre";

function stubClipboard(writeText: (text: string) => Promise<void>) {
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });
}

beforeEach(() => {
  trackEventMock.mockClear();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("MdxPre", () => {
  it("renders children inside a pre, preserving data attributes", () => {
    const { container } = render(
      <MdxPre data-language="go" data-theme="gofasta-css-variables">
        <code>{'fmt.Println("hi")'}</code>
      </MdxPre>,
    );
    const pre = container.querySelector("pre");
    expect(pre).toHaveAttribute("data-language", "go");
    expect(pre).toHaveAttribute("data-theme", "gofasta-css-variables");
    expect(pre?.textContent).toBe('fmt.Println("hi")');
  });

  it("copies the code textContent, shows Copied, fires copy_code, and reverts", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);
    render(
      <MdxPre data-language="go">
        <code>go build ./...</code>
      </MdxPre>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Copy code" }));
    await act(async () => {
      await Promise.resolve();
    });

    expect(writeText).toHaveBeenCalledWith("go build ./...");
    expect(screen.getByRole("button", { name: "Copied" })).toBeInTheDocument();
    expect(trackEventMock).toHaveBeenCalledWith("copy_code", {
      language: "go",
    });

    act(() => {
      vi.advanceTimersByTime(1800);
    });
    expect(
      screen.getByRole("button", { name: "Copy code" }),
    ).toBeInTheDocument();
  });

  it("does nothing when the pre contains no code element", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);
    render(<MdxPre>plain text</MdxPre>);

    fireEvent.click(screen.getByRole("button", { name: "Copy code" }));
    await act(async () => {
      await Promise.resolve();
    });

    expect(writeText).not.toHaveBeenCalled();
    expect(trackEventMock).not.toHaveBeenCalled();
  });

  it("stays quiet when the clipboard write rejects", async () => {
    stubClipboard(vi.fn().mockRejectedValue(new Error("denied")));
    render(
      <MdxPre>
        <code>x</code>
      </MdxPre>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Copy code" }));
    await act(async () => {
      await Promise.resolve();
    });

    expect(
      screen.getByRole("button", { name: "Copy code" }),
    ).toBeInTheDocument();
    expect(trackEventMock).not.toHaveBeenCalled();
  });
});
