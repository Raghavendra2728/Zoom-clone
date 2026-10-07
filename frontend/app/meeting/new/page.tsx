"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createInstantMeeting } from "@/lib/api/meetings";

export default function NewMeetingPage() {
  const router = useRouter();

  const [title, setTitle] = useState("My Instant Meeting");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreateMeeting() {
    try {
      setLoading(true);
      setError("");

      const meeting = await createInstantMeeting({ title });

      router.push(`/meeting/${meeting.meeting_id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create meeting",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "520px",
          background: "#ffffff",
          border: "1px solid #eaecf0",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "0 4px 16px rgba(16, 24, 40, 0.06)",
        }}
      >
        <button
          onClick={() => router.push("/dashboard")}
          style={{
            border: "none",
            background: "transparent",
            color: "#667085",
            padding: 0,
            marginBottom: "28px",
          }}
        >
          ← Back to Dashboard
        </button>

        <div style={{ marginBottom: "28px" }}>
          <p
            style={{
              color: "#2d8cff",
              fontWeight: 600,
              marginBottom: "8px",
            }}
          >
            Instant Meeting
          </p>

          <h1
            style={{
              fontSize: "28px",
              marginBottom: "8px",
            }}
          >
            Start a new meeting
          </h1>

          <p style={{ color: "#667085" }}>
            Create a meeting instantly and invite others using
            the generated meeting link.
          </p>
        </div>

        <label
          htmlFor="meeting-title"
          style={{
            display: "block",
            fontWeight: 600,
            marginBottom: "8px",
          }}
        >
          Meeting title
        </label>

        <input
          id="meeting-title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Enter meeting title"
          style={{
            width: "100%",
            padding: "12px 14px",
            marginBottom: "20px",
          }}
        />

        {error && (
          <p
            style={{
              color: "#d92d20",
              background: "#fef3f2",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "20px",
            }}
          >
            {error}
          </p>
        )}

        <button
          onClick={handleCreateMeeting}
          disabled={loading || !title.trim()}
          style={{
            width: "100%",
            border: "none",
            borderRadius: "8px",
            padding: "13px",
            background: "#2d8cff",
            color: "#ffffff",
            fontWeight: 600,
          }}
        >
          {loading ? "Creating meeting..." : "Create Meeting"}
        </button>
      </section>
    </main>
  );
}