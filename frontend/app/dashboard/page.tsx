"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getUpcomingMeetings,
  Meeting,
} from "@/lib/api/meetings";

export default function DashboardPage() {
  const router = useRouter();

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMeetings() {
      try {
        const data = await getUpcomingMeetings();
        setMeetings(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load meetings.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadMeetings();
  }, []);

  return (
    <main
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "32px 24px",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "40px",
        }}
      >
        <div>
          <p
            style={{
              color: "#2d8cff",
              fontWeight: 600,
              marginBottom: "6px",
            }}
          >
            Zoom Clone
          </p>

          <h1 style={{ fontSize: "32px" }}>
            Welcome back
          </h1>
        </div>

        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "50%",
            background: "#e8f1ff",
            color: "#2d8cff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
          }}
        >
          R
        </div>
      </header>

      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
          marginBottom: "40px",
        }}
      >
        <button
          onClick={() => router.push("/meeting/new")}
          style={{
            padding: "24px",
            border: "none",
            borderRadius: "12px",
            background: "#2d8cff",
            color: "#ffffff",
            fontWeight: 600,
            textAlign: "left",
          }}
        >
          <div style={{ fontSize: "18px", marginBottom: "8px" }}>
            New Meeting
          </div>
          <div style={{ fontSize: "14px", opacity: 0.9 }}>
            Start an instant meeting
          </div>
        </button>

        <button
          onClick={() => router.push("/meeting/join")}
          style={{
            padding: "24px",
            border: "1px solid #d0d5dd",
            borderRadius: "12px",
            background: "#ffffff",
            color: "#1f2328",
            fontWeight: 600,
            textAlign: "left",
          }}
        >
          <div style={{ fontSize: "18px", marginBottom: "8px" }}>
            Join Meeting
          </div>
          <div style={{ fontSize: "14px", color: "#667085" }}>
            Enter a meeting ID
          </div>
        </button>

        <button
          onClick={() => router.push("/meeting/schedule")}
          style={{
            padding: "24px",
            border: "1px solid #d0d5dd",
            borderRadius: "12px",
            background: "#ffffff",
            color: "#1f2328",
            fontWeight: 600,
            textAlign: "left",
          }}
        >
          <div style={{ fontSize: "18px", marginBottom: "8px" }}>
            Schedule Meeting
          </div>
          <div style={{ fontSize: "14px", color: "#667085" }}>
            Plan a future meeting
          </div>
        </button>
      </section>

      <section>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ fontSize: "22px" }}>
            Upcoming Meetings
          </h2>

          <button
            onClick={() => router.push("/meeting/schedule")}
            style={{
              border: "none",
              background: "transparent",
              color: "#2d8cff",
              fontWeight: 600,
            }}
          >
            Schedule
          </button>
        </div>

        {loading && <p>Loading meetings...</p>}

        {error && (
          <p style={{ color: "#d92d20" }}>
            {error}
          </p>
        )}

        {!loading && !error && meetings.length === 0 && (
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #eaecf0",
              borderRadius: "12px",
              padding: "32px",
              textAlign: "center",
            }}
          >
            <p>No upcoming meetings.</p>
          </div>
        )}

        {!loading && !error && meetings.length > 0 && (
          <div
            style={{
              display: "grid",
              gap: "12px",
            }}
          >
            {meetings.map((meeting) => (
              <article
                key={meeting.id}
                style={{
                  background: "#ffffff",
                  border: "1px solid #eaecf0",
                  borderRadius: "12px",
                  padding: "20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "20px",
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: "17px",
                      marginBottom: "8px",
                    }}
                  >
                    {meeting.title}
                  </h3>

                  {meeting.description && (
                    <p
                      style={{
                        color: "#667085",
                        marginBottom: "8px",
                      }}
                    >
                      {meeting.description}
                    </p>
                  )}

                  <p
                    style={{
                      color: "#667085",
                      fontSize: "14px",
                    }}
                  >
                    {meeting.scheduled_at
                      ? new Date(
                          meeting.scheduled_at,
                        ).toLocaleString()
                      : "Instant meeting"}
                    {" · "}
                    {meeting.duration_minutes
                      ? `${meeting.duration_minutes} min`
                      : "No duration"}
                  </p>
                </div>

                <button
                  onClick={() =>
                    router.push(
                      `/meeting/${meeting.meeting_id}`,
                    )
                  }
                  style={{
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px 18px",
                    background: "#2d8cff",
                    color: "#ffffff",
                    fontWeight: 600,
                  }}
                >
                  Join
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}