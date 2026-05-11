import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BlogPagination } from "./blog-pagination";

describe("BlogPagination", () => {
  it("renders nothing when there is only one page", () => {
    const { container } = render(
      <BlogPagination currentPage={1} totalPages={1} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders one numbered link per page", () => {
    render(<BlogPagination currentPage={2} totalPages={3} />);
    expect(screen.getByRole("link", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "2" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "3" })).toBeInTheDocument();
  });

  it("marks the current page with aria-current=page", () => {
    render(<BlogPagination currentPage={2} totalPages={3} />);
    expect(screen.getByRole("link", { name: "2" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "1" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("links page 1 to the base path without a ?page param", () => {
    render(<BlogPagination currentPage={2} totalPages={3} />);
    expect(screen.getByRole("link", { name: "1" })).toHaveAttribute(
      "href",
      "/blog",
    );
  });

  it("links pages > 1 to the base path with ?page=N", () => {
    render(<BlogPagination currentPage={1} totalPages={3} />);
    expect(screen.getByRole("link", { name: "2" })).toHaveAttribute(
      "href",
      "/blog?page=2",
    );
    expect(screen.getByRole("link", { name: "3" })).toHaveAttribute(
      "href",
      "/blog?page=3",
    );
  });

  it("omits Previous on page 1 and renders Next", () => {
    render(<BlogPagination currentPage={1} totalPages={3} />);
    expect(screen.queryByRole("link", { name: "Previous" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute(
      "href",
      "/blog?page=2",
    );
  });

  it("omits Next on the last page and renders Previous", () => {
    render(<BlogPagination currentPage={3} totalPages={3} />);
    expect(screen.queryByRole("link", { name: "Next" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute(
      "href",
      "/blog?page=2",
    );
  });

  it("renders both Previous and Next on a middle page", () => {
    render(<BlogPagination currentPage={2} totalPages={3} />);
    expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute(
      "href",
      "/blog",
    );
    expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute(
      "href",
      "/blog?page=3",
    );
  });

  it("respects a custom basePath", () => {
    render(
      <BlogPagination
        currentPage={1}
        totalPages={2}
        basePath="/blog/tags/go"
      />,
    );
    expect(screen.getByRole("link", { name: "2" })).toHaveAttribute(
      "href",
      "/blog/tags/go?page=2",
    );
  });
});
