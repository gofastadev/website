import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CodePreview } from "./code-preview";

describe("CodePreview", () => {
  it("renders the code content", () => {
    render(<CodePreview>const x = 1;</CodePreview>);
    expect(screen.getByText("const x = 1;")).toBeInTheDocument();
  });

  it("renders the label and language when provided", () => {
    render(
      <CodePreview label="example.ts" language="ts">
        const x = 1;
      </CodePreview>
    );
    expect(screen.getByText("example.ts")).toBeInTheDocument();
    expect(screen.getByText("ts")).toBeInTheDocument();
  });
});
