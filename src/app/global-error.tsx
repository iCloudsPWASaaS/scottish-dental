"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en-GB">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>
          Something went wrong
        </h1>
        <p style={{ color: "#475569" }}>
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: "1rem",
            padding: "0.5rem 1rem",
            borderRadius: "0.5rem",
            background: "#1d6ff1",
            color: "white",
            border: "none",
          }}
        >
          Try again
        </button>
        {error.digest && (
          <p style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
            Reference: {error.digest}
          </p>
        )}
      </body>
    </html>
  );
}
