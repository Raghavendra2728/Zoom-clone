"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { scheduleMeeting } from "@/lib/api/meetings";

export default function ScheduleMeetingPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [duration, setDuration] = useState("60");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleScheduleMeeting(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const meeting = await scheduleMeeting({
        title: title.trim(),
        description: description.trim() || undefined,
        scheduled_at: scheduledAt,
        duration_minutes: Number(duration),
      });

      router.push(`/meeting/${meeting.meeting_id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to schedule meeting.",
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
          maxWidth: "560px",
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
            Schedule Meeting
          </p>

          <h1
            style={{
              fontSize: "28px",
              marginBottom: "8px",
            }}
          >
            Plan a future meeting
          </h1>

          <p style={{ color: "#667085" }}>
            Choose when the meeting should take place and
            automatically generate an invite link.
          </p>
        </div>

        <form onSubmit={handleScheduleMeeting}>
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
            placeholder="e.g. Project Review"
            required
            style={{
              width: "100%",
              padding: "12px 14px",
              marginBottom: "20px",
            }}
          />

          <label
            htmlFor="meeting-description"
            style={{
              display: "block",
              fontWeight: 600,
              marginBottom: "8px",
            }}
          >
            Description
          </label>

          <textarea
            id="meeting-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Add a short description"
            rows={4}
            style={{
              width: "100%",
              padding: "12px 14px",
              marginBottom: "20px",
            }}
          />

          <label
            htmlFor="scheduled-at"
            style={{
              display: "block",
              fontWeight: 600,
              marginBottom: "8px",
            }}
          >
            Date and time
          </label>

          <input
            id="scheduled-at"
            type="datetime-local"
            value={scheduledAt}
            onChange={(event) => setScheduledAt(event.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px 14px",
              marginBottom: "20px",
            }}
          />

          <label
            htmlFor="duration"
            style={{
              display: "block",
              fontWeight: 600,
              marginBottom: "8px",
            }}
          >
            Duration
          </label>

          <select
            id="duration"
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              marginBottom: "24px",
            }}
          >
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="45">45 minutes</option>
            <option value="60">1 hour</option>
            <option value="90">1 hour 30 minutes</option>
            <option value="120">2 hours</option>
          </select>

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
              !title.trim() ||
              !scheduledAt ||
              !duration
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
            {loading
              ? "Scheduling meeting..."
              : "Schedule Meeting"}
          </button>
        </form>
      </section>
    </main>
  );
}