import { apiRequest } from "./client";

export interface Participant {
  id: number;
  meeting_id: number;
  display_name: string;
  joined_at: string;
  left_at: string | null;
}

export interface JoinMeetingRequest {
  meeting_id: number;
  display_name: string;
}

export async function joinMeeting(
  data: JoinMeetingRequest,
): Promise<Participant> {
  return apiRequest<Participant>("/participants/join", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getMeetingParticipants(
  meetingId: number,
): Promise<Participant[]> {
  return apiRequest<Participant[]>(
    `/participants/meeting/${meetingId}`,
  );
}

export async function removeParticipant(
  participantId: number,
): Promise<void> {
  return apiRequest<void>(`/participants/${participantId}`, {
    method: "DELETE",
  });
}