"use client";
import React, { useEffect, useRef, useCallback, useState, forwardRef, useImperativeHandle } from "react";
import Script from "next/script";

/**
 * Reusable Cloudflare Turnstile Widget Component.
 *
 * Props:
 * - onVerify(token: string): Called when the user passes verification.
 * - onExpire(): Called when the token expires (user needs to re-verify).
 * - onError(error): Called on widget error.
 * - theme: "light" | "dark" | "auto" (default: "auto")
 *
 * Ref methods:
 * - reset(): Programmatically reset the widget (e.g., after form submission failure).
 */
const TurnstileWidget = forwardRef(({ onVerify, onExpire, onError, theme = "auto" }, ref) => {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

  const renderWidget = useCallback(() => {
    if (
      !scriptLoaded ||
      !containerRef.current ||
      !window.turnstile ||
      widgetIdRef.current !== null
    ) {
      return;
    }

    try {
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme,
        callback: (token) => {
          onVerify?.(token);
        },
        "expired-callback": () => {
          onExpire?.();
        },
        "error-callback": (error) => {
          onError?.(error);
        },
      });
    } catch (err) {
      console.error("Turnstile render error:", err);
    }
  }, [scriptLoaded, siteKey, theme, onVerify, onExpire, onError]);

  useEffect(() => {
    renderWidget();
  }, [renderWidget]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (widgetIdRef.current !== null && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore cleanup errors
        }
        widgetIdRef.current = null;
      }
    };
  }, []);

  // Expose reset method to parent via ref
  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetIdRef.current !== null && window.turnstile) {
        try {
          window.turnstile.reset(widgetIdRef.current);
        } catch {
          // If reset fails, remove and re-render
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {
            // ignore
          }
          widgetIdRef.current = null;
          renderWidget();
        }
      }
    },
  }));

  // Don't render anything if no site key is configured
  if (!siteKey) {
    return null;
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
      <div
        ref={containerRef}
        className="flex justify-center my-3"
        id="turnstile-container"
      />
    </>
  );
});

TurnstileWidget.displayName = "TurnstileWidget";

export default TurnstileWidget;
