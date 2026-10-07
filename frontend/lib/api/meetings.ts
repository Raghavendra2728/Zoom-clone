import { apiRequest } from "./client";

export interface Meeting {
  id: number;
  meeting_id: string;
  title: string;
  description: string | null;
  scheduled_at: string | null;
  duration_minutes: number | null;
  invite_link: string;
  created_at: string;
}

export interface CreateMeetingRequest {
  title?: string;
}

export async function createInstantMeeting(
  data: CreateMeetingRequest = {},
): Promise<Meeting> {
  return apiRequest<Meeting>("/meetings/instant", {
    method: "POST",
    body: JSON.stringify({
      title: data.title || "Instant Meeting",
    }),
  });
}

export interface ScheduleMeetingRequest {
  title: string;
  description?: string;
  scheduled_at: string;
  duration_minutes: number;
}

export async function scheduleMeeting(
  data: ScheduleMeetingRequest,
): Promise<Meeting> {
  return apiRequest<Meeting>("/meetings/schedule", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getMeeting(meetingId: string): Promise<Meeting> {
  return apiRequest<Meeting>(`/meetings/${meetingId}`);
}

export async function getUpcomingMeetings(): Promise<Meeting[]> {
  return apiRequest<Meeting[]>("/meetings/");
}