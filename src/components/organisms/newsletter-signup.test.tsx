import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";

const { trackEventMock } = vi.hoisted(() => ({
  trackEventMock: vi.fn(),
}));
vi.mock("@/lib/analytics", () => ({
  trackEvent: trackEventMock,
}));

import { NewsletterSignup } from "./newsletter-signup";

const ACTION =
  "https://buttondown.com/api/emails/embed-subscribe/gofasta";

beforeEach(() => {
  trackEventMock.mockClear();
  vi.stubEnv("NEXT_PUBLIC_BUTTONDOWN_USERNAME", "gofasta");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("NewsletterSignup", () => {
  it("renders nothing when the Buttondown username is unset", () => {
    vi.stubEnv("NEXT_PUBLIC_BUTTONDOWN_USERNAME", "");
    const { container } = render(<NewsletterSignup location="blog_index" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a native-fallback form targeting the Buttondown embed endpoint", () => {
    render(<NewsletterSignup location="blog_index" />);
    const input = screen.getByLabelText("Email address");
    const form = input.closest("form");
    expect(form).toHaveAttribute("action", ACTION);
    expect(form).toHaveAttribute("method", "post");
    expect(form?.querySelector('input[name="embed"]')).toHaveAttribute(
      "value",
      "1",
    );
    expect(input).toHaveAttribute("name", "email");
    expect(input).toBeRequired();
  });

  it("submits via fetch (FormData, no-cors), shows success, fires the event", async () => {
    const fetchMock = vi.fn().mockResolvedValue({});
    vi.stubGlobal("fetch", fetchMock);
    render(<NewsletterSignup location="article_footer" />);

    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "reader@example.com" },
    });
    fireEvent.submit(
      screen.getByLabelText("Email address").closest("form")!,
    );
    await act(async () => {
      await Promise.resolve();
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(ACTION);
    expect(init.method).toBe("POST");
    expect(init.mode).toBe("no-cors");
    expect(init.body).toBeInstanceOf(FormData);
    expect((init.body as FormData).get("email")).toBe("reader@example.com");

    expect(screen.getByRole("status")).toHaveTextContent(/check your inbox/i);
    expect(trackEventMock).toHaveBeenCalledWith("newsletter_subscribe", {
      location: "article_footer",
    });
  });

  it("shows the error state when fetch rejects and fires no event", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    render(<NewsletterSignup location="blog_index" />);

    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "reader@example.com" },
    });
    fireEvent.submit(
      screen.getByLabelText("Email address").closest("form")!,
    );
    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByRole("alert")).toHaveTextContent(/went wrong/i);
    expect(trackEventMock).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
  });
});
