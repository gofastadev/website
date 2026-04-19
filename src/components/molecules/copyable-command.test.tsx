import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { CopyableCommand } from "./copyable-command";

describe("CopyableCommand", () => {
  beforeEach(() => {
    // Fresh Clipboard API stub per test so call counts don't bleed.
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
  });

  it("renders the command and default prompt", () => {
    render(<CopyableCommand command="gofasta new myapp" />);
    expect(screen.getByText("gofasta new myapp")).toBeInTheDocument();
    expect(screen.getByText("$")).toBeInTheDocument();
  });

  it("renders a custom prompt when provided", () => {
    render(<CopyableCommand command="ls" prompt=">" />);
    expect(screen.getByText(">")).toBeInTheDocument();
  });

  it("omits the prompt when explicitly empty", () => {
    render(<CopyableCommand command="ls" prompt="" />);
    expect(screen.queryByText("$")).not.toBeInTheDocument();
  });

  it("copies the command and shows the Copied feedback on click", async () => {
    render(
      <CopyableCommand command="go install github.com/gofastadev/cli/cmd/gofasta@latest" />
    );
    const button = screen.getByRole("button", {
      name: /copy command to clipboard/i,
    });
    fireEvent.click(button);
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        "go install github.com/gofastadev/cli/cmd/gofasta@latest"
      );
    });
    await waitFor(() => {
      expect(screen.getByText("Copied")).toBeInTheDocument();
    });
  });

  it("reports copied state via aria-label after clicking", async () => {
    render(<CopyableCommand command="go build ./..." />);
    fireEvent.click(
      screen.getByRole("button", { name: /copy command to clipboard/i })
    );
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /copied to clipboard/i })
      ).toBeInTheDocument();
    });
  });

  it("falls back to execCommand when Clipboard API is missing", async () => {
    // Strip the Clipboard API to force the legacy branch.
    Object.assign(navigator, { clipboard: undefined });
    const execSpy = vi.fn().mockReturnValue(true);
    // @ts-expect-error — jsdom provides execCommand as any; we replace it.
    document.execCommand = execSpy;

    render(<CopyableCommand command="ls -la" />);
    fireEvent.click(
      screen.getByRole("button", { name: /copy command to clipboard/i })
    );

    await waitFor(() => {
      expect(execSpy).toHaveBeenCalledWith("copy");
    });
    await waitFor(() => {
      expect(screen.getByText("Copied")).toBeInTheDocument();
    });
  });

  it("swallows a Clipboard API error without throwing", async () => {
    // writeText rejects — the handler should silently recover and
    // never reach the Copied state.
    const writeText = vi.fn().mockRejectedValue(new Error("permission denied"));
    Object.assign(navigator, { clipboard: { writeText } });

    render(<CopyableCommand command="cat /etc/shadow" />);
    fireEvent.click(
      screen.getByRole("button", { name: /copy command to clipboard/i })
    );

    await waitFor(() => {
      expect(writeText).toHaveBeenCalled();
    });
    // After the rejection resolves, "Copied" must NOT appear.
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.queryByText("Copied")).not.toBeInTheDocument();
  });

  it("clears an in-flight copied timer on unmount", async () => {
    const { unmount } = render(<CopyableCommand command="pwd" />);
    fireEvent.click(
      screen.getByRole("button", { name: /copy command to clipboard/i })
    );
    await waitFor(() => {
      expect(screen.getByText("Copied")).toBeInTheDocument();
    });
    // Spy on clearTimeout to prove the cleanup path runs.
    const clearSpy = vi.spyOn(window, "clearTimeout");
    unmount();
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });

  it("resets a stale timer when the button is clicked again quickly", async () => {
    const clearSpy = vi.spyOn(window, "clearTimeout");
    render(<CopyableCommand command="echo hi" />);
    const button = screen.getByRole("button", {
      name: /copy command to clipboard/i,
    });
    fireEvent.click(button);
    await waitFor(() => expect(screen.getByText("Copied")).toBeInTheDocument());

    // Second click while the first timer is still active — the handler
    // must clear the previous timer before scheduling the new one.
    fireEvent.click(button);
    await waitFor(() => expect(clearSpy).toHaveBeenCalled());
    clearSpy.mockRestore();
  });

  it("reverts to the idle state after the 1.8s feedback window elapses", async () => {
    vi.useFakeTimers();
    render(<CopyableCommand command="go mod tidy" />);
    const button = screen.getByRole("button", {
      name: /copy command to clipboard/i,
    });

    // Fire the click; flush the microtask queue so the awaited
    // `navigator.clipboard.writeText` resolves and setCopied(true)
    // commits into React state.
    await act(async () => {
      fireEvent.click(button);
      // A few awaits to let the async/await chain + state commit finish.
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(screen.getByText("Copied")).toBeInTheDocument();

    // Advance past the 1800ms window — the setTimeout callback that
    // calls setCopied(false) fires, flipping the label back to "Copy".
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.queryByText("Copied")).not.toBeInTheDocument();

    vi.useRealTimers();
  });
});
