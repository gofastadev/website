"use client";

import { useState } from "react";
import { Button, Input } from "@/components/atoms";
import { trackEvent } from "@/lib/analytics";

// Buttondown newsletter signup. Renders nothing unless
// NEXT_PUBLIC_BUTTONDOWN_USERNAME is set at build time (the Giscus /
// GA4 gating precedent — dev and preview deploys ship no dead form).
//
// Progressive enhancement: the form carries a real action/method, so
// without JS the browser navigates to Buttondown's hosted confirm
// page. With JS we intercept submit and POST via fetch in no-cors
// mode — the response is opaque by design, so the success copy is
// deliberately "check your inbox": Buttondown's double-opt-in email
// is the true confirmation, and a Buttondown-side rejection (already
// subscribed, blocked) is indistinguishable from success here.

export interface NewsletterSignupProps {
  location: "article_footer" | "blog_index";
}

type Status = "idle" | "submitting" | "success" | "error";

export function NewsletterSignup({ location }: NewsletterSignupProps) {
  const username = process.env.NEXT_PUBLIC_BUTTONDOWN_USERNAME;
  const [status, setStatus] = useState<Status>("idle");

  if (!username) return null;

  const action = `https://buttondown.com/api/emails/embed-subscribe/${username}`;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus("submitting");
    try {
      await fetch(action, {
        method: "POST",
        body: new FormData(form),
        mode: "no-cors",
      });
      setStatus("success");
      trackEvent("newsletter_subscribe", { location });
    } catch {
      // fetch only throws on network-level failure (offline, DNS);
      // Buttondown-side rejections are invisible in no-cors mode.
      setStatus("error");
    }
  };

  return (
    <section
      aria-label="Newsletter signup"
      data-pagefind-ignore
      className="my-12 rounded-xl border border-gray-200 p-6 sm:p-8 dark:border-white/10"
    >
      <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
        Gofasta, in your inbox
      </h2>
      <p className="mt-2 max-w-[55ch] text-sm text-gray-600 dark:text-gray-400">
        New posts, release notes, and toolkit updates. No spam, unsubscribe
        anytime.
      </p>
      {status === "success" ? (
        <p role="status" className="mt-4 text-sm font-medium text-primary">
          Almost there. Check your inbox to confirm your subscription.
        </p>
      ) : (
        <form
          action={action}
          method="post"
          onSubmit={(event) => {
            void handleSubmit(event);
          }}
          className="mt-4 flex flex-col gap-3 sm:flex-row"
        >
          <input type="hidden" name="embed" value="1" />
          <Input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            aria-label="Email address"
            className="sm:max-w-xs"
            disabled={status === "submitting"}
          />
          <Button type="submit" disabled={status === "submitting"}>
            {status === "submitting" ? "Subscribing…" : "Subscribe"}
          </Button>
        </form>
      )}
      {status === "error" ? (
        <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
          Something went wrong. Check your connection and try again.
        </p>
      ) : null}
    </section>
  );
}
