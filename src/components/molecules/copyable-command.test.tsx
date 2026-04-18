import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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
});
