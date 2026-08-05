import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { QuickStartSection } from "./quick-start-section";

describe("QuickStartSection", () => {
  it("renders the section heading", () => {
    render(<QuickStartSection />);
    expect(
      screen.getByText("Three commands to a running backend")
    ).toBeInTheDocument();
  });

  it("does not render an eyebrow", () => {
    render(<QuickStartSection />);
    expect(screen.queryByText("Quick start")).not.toBeInTheDocument();
  });

  it("renders the terminal block with the quick start title", () => {
    render(<QuickStartSection />);
    expect(screen.getByText("quick start")).toBeInTheDocument();
  });

  it("renders the new-project command", () => {
    render(<QuickStartSection />);
    expect(
      screen.getByText("gofasta new myapp --driver postgres")
    ).toBeInTheDocument();
  });

  it("renders the dev command", () => {
    render(<QuickStartSection />);
    expect(screen.getByText("gofasta dev")).toBeInTheDocument();
  });

  it("renders the scaffold command", () => {
    render(<QuickStartSection />);
    expect(
      screen.getByText("gofasta g scaffold post title:string body:text")
    ).toBeInTheDocument();
  });

  it("renders three copy-enabled command blocks", () => {
    render(<QuickStartSection />);
    expect(
      screen.getAllByRole("button", { name: /copy command to clipboard/i })
    ).toHaveLength(3);
  });

  it("does not render the deleted dashed connector overlay", () => {
    const { container } = render(<QuickStartSection />);
    expect(container.innerHTML).not.toContain("gofasta-dot-travel");
    expect(container.innerHTML).not.toContain("gofasta-flow-dash");
    expect(
      container.querySelector(".gofasta-flow-bar")
    ).not.toBeInTheDocument();
    expect(
      container.querySelector(".gofasta-flow-bar-vert")
    ).not.toBeInTheDocument();
    expect(
      container.querySelector(".gofasta-flow-dot")
    ).not.toBeInTheDocument();
  });

  it("does not render the removed StepCard/StepNumber markup", () => {
    render(<QuickStartSection />);
    expect(screen.queryByText("Install the CLI")).not.toBeInTheDocument();
    expect(screen.queryByText("Create a project")).not.toBeInTheDocument();
    expect(screen.queryByText("Start developing")).not.toBeInTheDocument();
  });

  it("does not nest the CopyableCommand blocks inside TerminalBlock's pre wrapper", () => {
    // TerminalBlock defaults to a <pre><code> body, which is invalid HTML5
    // for the block-level CopyableCommand markup this section renders
    // inside it — QuickStartSection must opt into bodyAs="div" instead.
    // (CopyableCommand itself legitimately renders its own inline <code>
    // for the command text, so only the outer <pre> wrapper is asserted.)
    const { container } = render(<QuickStartSection />);
    expect(container.querySelector("pre")).not.toBeInTheDocument();
  });
});
