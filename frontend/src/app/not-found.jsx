"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function NotFound() {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [particles, setParticles] = useState([]);

  // Generate floating particles on mount
  useEffect(() => {
    const generated = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
    }));
    setParticles(generated);
  }, []);

  // Track mouse for spotlight effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div style={styles.container}>
      {/* Animated background gradient that follows mouse */}
      <div
        style={{
          ...styles.spotlight,
          background: `radial-gradient(600px circle at ${mousePos.x}% ${mousePos.y}%, rgba(99, 102, 241, 0.12), transparent 60%)`,
        }}
      />

      {/* Floating particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: "50%",
            backgroundColor: "rgba(99, 102, 241, 0.3)",
            animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite alternate`,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Grid pattern overlay */}
      <div style={styles.gridOverlay} />

      {/* Main content */}
      <div style={styles.content}>
        {/* Glitch 404 number */}
        <div style={styles.errorCodeWrapper}>
          <h1 style={styles.errorCode} data-text="404">
            404
          </h1>
          <div style={styles.glitchLine} />
        </div>

        {/* Divider line */}
        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <div style={styles.dividerDot} />
          <div style={styles.dividerLine} />
        </div>

        {/* Message */}
        <h2 style={styles.title}>Page Not Found</h2>
        <p style={styles.description}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          <br />
          Let&apos;s get you back on track.
        </p>

        {/* Action buttons */}
        <div style={styles.buttonGroup}>
          <Link href="/" style={styles.primaryButton}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Go Home
          </Link>
          <Link href="/products" style={styles.secondaryButton}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            Browse Products
          </Link>
        </div>

        {/* Breadcrumb hint */}
        <p style={styles.hint}>
          Error Code: <span style={styles.hintCode}>NOT_FOUND</span>
        </p>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
          50% { opacity: 0.6; }
          100% { transform: translateY(-30px) translateX(15px); opacity: 0.2; }
        }

        @keyframes glitch {
          0%, 100% { text-shadow: 2px 0 #6366f1, -2px 0 #ec4899; }
          25% { text-shadow: -2px -2px #6366f1, 2px 2px #ec4899; }
          50% { text-shadow: 2px 2px #6366f1, -2px -2px #ec4899; }
          75% { text-shadow: -2px 0 #6366f1, 2px 0 #ec4899; }
        }

        @keyframes scanline {
          0% { top: -10%; }
          100% { top: 110%; }
        }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.3); }
          50% { box-shadow: 0 0 40px rgba(99, 102, 241, 0.5); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0a0a0f",
    position: "relative",
    overflow: "hidden",
    fontFamily: "var(--font-inter), system-ui, sans-serif",
  },
  spotlight: {
    position: "absolute",
    inset: 0,
    transition: "background 0.3s ease",
    pointerEvents: "none",
  },
  gridOverlay: {
    position: "absolute",
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(99, 102, 241, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(99, 102, 241, 0.03) 1px, transparent 1px)
    `,
    backgroundSize: "60px 60px",
    pointerEvents: "none",
  },
  content: {
    position: "relative",
    zIndex: 10,
    textAlign: "center",
    padding: "2rem",
    maxWidth: "600px",
  },
  errorCodeWrapper: {
    position: "relative",
    marginBottom: "1.5rem",
  },
  errorCode: {
    fontSize: "clamp(7rem, 15vw, 12rem)",
    fontWeight: 900,
    lineHeight: 1,
    margin: 0,
    color: "transparent",
    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 40%, #ec4899 100%)",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    animation: "glitch 3s ease-in-out infinite",
    letterSpacing: "-0.02em",
    userSelect: "none",
  },
  glitchLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: "2px",
    background: "linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.6), transparent)",
    animation: "scanline 3s linear infinite",
    pointerEvents: "none",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    marginBottom: "1.5rem",
  },
  dividerLine: {
    width: "60px",
    height: "1px",
    background: "linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.4), transparent)",
  },
  dividerDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: "#6366f1",
    animation: "pulse-glow 2s ease-in-out infinite",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: 600,
    color: "#e2e8f0",
    margin: "0 0 0.75rem 0",
    letterSpacing: "-0.01em",
  },
  description: {
    fontSize: "1rem",
    color: "#94a3b8",
    lineHeight: 1.7,
    margin: "0 0 2.5rem 0",
  },
  buttonGroup: {
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: "2rem",
  },
  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 28px",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#ffffff",
    borderRadius: "12px",
    fontSize: "0.95rem",
    fontWeight: 500,
    textDecoration: "none",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 20px rgba(99, 102, 241, 0.3)",
  },
  secondaryButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 28px",
    background: "rgba(99, 102, 241, 0.08)",
    color: "#a5b4fc",
    borderRadius: "12px",
    fontSize: "0.95rem",
    fontWeight: 500,
    textDecoration: "none",
    border: "1px solid rgba(99, 102, 241, 0.2)",
    transition: "all 0.3s ease",
  },
  hint: {
    fontSize: "0.8rem",
    color: "#475569",
    margin: 0,
  },
  hintCode: {
    fontFamily: "monospace",
    color: "#6366f1",
    backgroundColor: "rgba(99, 102, 241, 0.08)",
    padding: "2px 8px",
    borderRadius: "4px",
  },
};
