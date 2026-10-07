"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { getMeeting } from "@/lib/api/meetings";
import { joinMeeting } from "@/lib/api/participants";

export default function JoinMeetingPage() {
  const router = useRouter();

  const [meetingId, setMeetingId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleJoinMeeting(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedMeetingId = meetingId.trim();
    const trimmedDisplayName = displayName.trim();

    if (!trimmedMeetingId || !trimmedDisplayName) {
      setError("Meeting ID and display name are required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const meeting = await getMeeting(trimmedMeetingId);

      await joinMeeting({
        meeting_id: meeting.id,
        display_name: trimmedDisplayName,
      });

      router.push(`/meeting/${meeting.meeting_id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to join the meeting.",
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
          type="button"
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
            Join Meeting
          </p>

          <h1
            style={{
              fontSize: "28px",
              marginBottom: "8px",
            }}
          >
            Join a meeting
          </h1>

          <p style={{ color: "#667085" }}>
            Enter the meeting ID and your display name to join.
          </p>
        </div>

        <form onSubmit={handleJoinMeeting}>
          <label
            htmlFor="meeting-id"
            style={{
              display: "block",
              fontWeight: 600,
              marginBottom: "8px",
            }}
          >
            Meeting ID
          </label>

          <input
            id="meeting-id"
            type="text"
            value={meetingId}
            onChange={(event) => setMeetingId(event.target.value)}
            placeholder="Enter meeting ID"
            style={{
              width: "100%",
              padding: "12px 14px",
              marginBottom: "20px",
            }}
          />

          <label
            htmlFor="display-name"
            style={{
              display: "block",
              fontWeight: 600,
              marginBottom: "8px",
            }}
          >
            Your name
          </label>

          <input
            id="display-name"
            type="text"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Enter your display name"
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
            type="submit"
            disabled={
              loading ||
              !meetingId.trim() ||
              !displayName.trim()
            }
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
            {loading ? "Joining..." : "Join Meeting"}
          </button>
        </form>
      </section>
    </main>
  );
}