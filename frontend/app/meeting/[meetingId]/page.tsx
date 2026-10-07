"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Users,
  MessageSquare,
  MonitorUp,
  PhoneOff,
} from "lucide-react";

import {
  getMeeting,
  Meeting,
} from "@/lib/api/meetings";

import { getMeetingParticipants, joinMeeting, Participant } from "@/lib/api/participants";

export default function MeetingRoomPage() {
  const router = useRouter();
  const params = useParams();

  const meetingId = params.meetingId as string;
const [displayName] = useState("Raghav");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
 const rtcConfiguration: RTCConfiguration = {
    iceServers: [
      {
        urls: "stun:stun.l.google.com:19302",
      },
    ],
  };
  function addLocalTracks(
  peerConnection: RTCPeerConnection,
  stream: MediaStream,
) {
  stream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, stream);
  });
}
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [screenSharing, setScreenSharing] = useState(false);    
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [participants, setParticipants] = useState<Participant[]>(
    [],
  );

  const [chatMessages, setChatMessages] = useState<
  { name: string; message: string }[]
>([]);
const [socketConnected, setSocketConnected] = useState(false);
const [chatInput, setChatInput] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);

  const [mediaError, setMediaError] = useState("");

  const [showParticipants, setShowParticipants] =
    useState(false);

  const [showChat, setShowChat] = useState(false);

  /*
   * Load meeting details and participants.
   */
  useEffect(() => {
    async function loadMeeting() {
      try {
        setLoading(true);
        setError("");

        const meetingData = await getMeeting(meetingId);

        setMeeting(meetingData);
        await joinMeeting({
        meeting_id: meetingData.id,
        display_name: displayName,
      });
        const participantData =
          await getMeetingParticipants(meetingData.id);

        setParticipants(participantData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load meeting.",
        );
      } finally {
        setLoading(false);
      }
    }

    if (meetingId) {
      loadMeeting();
    }
  }, [meetingId]);

  /*
   * Request camera and microphone access.
   */
  useEffect(() => {
    let active = true;

    async function initializeMedia() {
      try {
        setMediaError("");

        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error(
            "Camera and microphone access is not supported by this browser.",
          );
        }

        const stream =
          await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });

        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        mediaStreamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        if (peerConnectionRef.current) {
  addLocalTracks(peerConnectionRef.current, stream);
}
      } catch (err) {
        console.error(
          "Unable to access camera/microphone:",
          err,
        );

        if (active) {
          setMediaError(
            "Camera or microphone access was denied. You can still join the meeting.",
          );

          setCameraOn(false);
          setMicOn(false);
        }
      }
    }

    initializeMedia();

    return () => {
      active = false;

      mediaStreamRef.current
        ?.getTracks()
        .forEach((track) => track.stop());

      mediaStreamRef.current = null;
    };
  }, []);
  useEffect(() => {
  if (!meetingId) return;

  const wsBaseUrl =
  process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:8000";

const socket = new WebSocket(
  `${wsBaseUrl}/ws/meeting/${meetingId}`,
);
const peerConnection = new RTCPeerConnection(
  rtcConfiguration,
);

peerConnectionRef.current = peerConnection;

const existingStream = mediaStreamRef.current;

if (existingStream) {
  addLocalTracks(peerConnection, existingStream);
}


peerConnection.ontrack = (event) => {
  const [remoteStream] = event.streams;

  if (remoteVideoRef.current && remoteStream) {
    remoteVideoRef.current.srcObject = remoteStream;
  }
};

peerConnection.onicecandidate = (event) => {
  if (event.candidate && socket.readyState === WebSocket.OPEN) {
    socket.send(
      JSON.stringify({
        type: "ice-candidate",
        candidate: event.candidate,
      }),
    );
  }
};

  socket.onopen = async () => {
  console.log("WebSocket connected");
  setSocketConnected(true);

  socket.send(
    JSON.stringify({
      type: "join",
      meetingId,
      displayName,
    }),
  );

  const offer = await peerConnection.createOffer();

  await peerConnection.setLocalDescription(offer);

  socket.send(
    JSON.stringify({
      type: "offer",
      offer,
    }),
  );
};

  socket.onmessage = async (event) => {
  const message = JSON.parse(event.data);

  console.log("WebSocket message:", message);

  if (message.type === "offer") {
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(message.offer),
    );

    const answer = await peerConnection.createAnswer();

    await peerConnection.setLocalDescription(answer);

    socket.send(
      JSON.stringify({
        type: "answer",
        answer,
      }),
    );
  }

  if (message.type === "answer") {
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(message.answer),
    );
  }

  if (message.type === "ice-candidate") {
    await peerConnection.addIceCandidate(
      new RTCIceCandidate(message.candidate),
    );
  }
  if (message.type === "leave") {
  console.log("A participant left the meeting");

  setParticipants((current) =>
    current.filter(
      (participant) => participant.display_name !== message.displayName,
    ),
  );

  await peerConnection.restartIce();
}
};



  socket.onerror = () => {
  console.log("WebSocket connection failed");
  setSocketConnected(false);
};

 socket.onclose = (event) => {
  console.log(
    "WebSocket closed:",
    event.code,
    event.reason || "No reason provided",
  );

  setSocketConnected(false);
};

  return () => {
  socket.close();

  peerConnection.close();
  peerConnectionRef.current = null;
};
}, [meetingId, displayName]);

  /*
   * Turn microphone on/off.
   */
  function toggleMicrophone() {
    const stream = mediaStreamRef.current;

    if (!stream) {
      setMicOn((value) => !value);
      return;
    }

    const nextValue = !micOn;

    stream.getAudioTracks().forEach((track) => {
      track.enabled = nextValue;
    });

    setMicOn(nextValue);
  }

  /*
   * Turn camera on/off.
   */
  function toggleCamera() {
    const stream = mediaStreamRef.current;

    if (!stream) {
      setCameraOn((value) => !value);
      return;
    }

    const nextValue = !cameraOn;

    stream.getVideoTracks().forEach((track) => {
      track.enabled = nextValue;
    });

    setCameraOn(nextValue);
  }
  /*
  *toggleScreenShare
  */
async function toggleScreenShare() {
  try {
    if (screenSharing) {
      const stream = mediaStreamRef.current;

      if (stream) {
        const cameraTrack = stream.getVideoTracks()[0];

        if (cameraTrack) {
          cameraTrack.enabled = cameraOn;
        }
      }

      setScreenSharing(false);
      return;
    }

    if (!navigator.mediaDevices?.getDisplayMedia) {
      setMediaError("Screen sharing is not supported by this browser.");
      return;
    }

    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });

    const screenTrack = screenStream.getVideoTracks()[0];

    screenTrack.onended = () => {
      setScreenSharing(false);

      const cameraTrack = mediaStreamRef.current?.getVideoTracks()[0];

      if (cameraTrack) {
        cameraTrack.enabled = cameraOn;
      }
    };

    if (videoRef.current) {
      videoRef.current.srcObject = screenStream;
    }

    setScreenSharing(true);
  } catch (err) {
    console.error("Screen sharing failed:", err);
    setMediaError("Screen sharing was cancelled or unavailable.");
  }
}
function sendChatMessage() {
  const message = chatInput.trim();

  if (!message) {
    return;
  }

  setChatMessages((current) => [
    ...current,
    {
      name: displayName,
      message,
    },
  ]);

  setChatInput("");
}
  /*
   * Leave meeting.
   */
  function leaveMeeting() {
  mediaStreamRef.current
    ?.getTracks()
    .forEach((track) => track.stop());

  mediaStreamRef.current = null;

  peerConnectionRef.current?.close();
  peerConnectionRef.current = null;

  router.push("/dashboard");
}

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#18191b",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p>Loading meeting...</p>
      </main>
    );
  }

  if (error || !meeting) {
    return (
      <main
        style={{
          minHeight: "100vh",
          background: "#18191b",
          color: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div
          style={{
            textAlign: "center",
            maxWidth: "420px",
          }}
        >
          <h1
            style={{
              marginBottom: "12px",
            }}
          >
            Meeting Not Found
          </h1>

          <p
            style={{
              color: "#aeb4bc",
              marginBottom: "24px",
            }}
          >
            {error || "This meeting does not exist."}
          </p>

          <button
            onClick={() => router.push("/dashboard")}
            style={{
              border: "none",
              borderRadius: "8px",
              padding: "11px 20px",
              background: "#2d8cff",
              color: "#ffffff",
              fontWeight: 600,
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#18191b",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top bar */}
      <header
        style={{
          height: "64px",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          borderBottom: "1px solid #303236",
          background: "#202124",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "17px",
              marginBottom: "3px",
            }}
          >
            {meeting.title}
          </h1>

          <p
            style={{
              color: "#aeb4bc",
              fontSize: "13px",
            }}
          >
            Meeting ID: {meeting.meeting_id}
          </p>
        </div>

        <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#aeb4bc",
    fontSize: "14px",
  }}
>
  <span
    style={{
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      background: socketConnected ? "#22c55e" : "#f59e0b",
    }}
  />

  {socketConnected ? "Connected" : "Connecting..."}
</div>
      </header>

      {/* Main meeting area */}
      <section
  style={{
    flex: 1,
    minHeight: 0,
    display: "flex",
    padding: "24px",
    gap: "16px",
    overflow: "hidden",
    flexWrap: "wrap",
  }}
>
        {/* Video area */}
        <div
  style={{
    flex: 1,
    minWidth: 0,
    display: "grid",
    gridTemplateColumns:
      participants.length > 1
        ? "repeat(auto-fit, minmax(280px, 1fr))"
        : "1fr",
    gap: "16px",
    alignContent: "center",
    overflowY: "auto",
    paddingRight: "4px",
  }}
>
          {/* Local video */}
          <div
            style={{
              minHeight: "280px",
              background: "#25272b",
              borderRadius: "12px",
              position: "relative",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {cameraOn && !mediaError ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                style={{
                  width: "100%",
                  height: "100%",
                  minHeight: "280px",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            ) : (
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: "#2d8cff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "30px",
                  fontWeight: 600,
                }}
              >
                R
              </div>
            )}

            <span
              style={{
                position: "absolute",
                bottom: "14px",
                left: "16px",
                color: "#ffffff",
                background: "rgba(0, 0, 0, 0.55)",
                padding: "5px 9px",
                borderRadius: "6px",
                fontSize: "13px",
              }}
            >
              You
            </span>

            {!micOn && (
              <span
                style={{
                  position: "absolute",
                  bottom: "14px",
                  right: "16px",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "#3a3b3f",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MicOff size={16} />
              </span>
            )}
          </div>

          {/* Remote participants */}
          {participants
            .filter(
              (participant) =>
                participant.display_name !== "Raghav",
            )
            .map((participant) => (
              <div
                key={participant.id}
                style={{
                  minHeight: "280px",
                  background: "#25272b",
                  borderRadius: "12px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: "#475467",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "30px",
                    fontWeight: 600,
                  }}
                >
                  {participant.display_name
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <p
                  style={{
                    marginTop: "16px",
                    fontWeight: 600,
                  }}
                >
                  {participant.display_name}
                </p>
              </div>
            ))}
        </div>

        {/* Participants panel */}
        {showParticipants && (
          <aside
            style={{
              width: "min(280px, 100%)",
              flexShrink: 0,
              background: "#202124",
              borderRadius: "12px",
              padding: "20px",
              overflowY: "auto",
            }}
          >
            <h2
              style={{
                fontSize: "17px",
                marginBottom: "20px",
              }}
            >
              Participants ({participants.length})
            </h2>

            {participants.length === 0 ? (
              <p
                style={{
                  color: "#aeb4bc",
                  fontSize: "14px",
                }}
              >
                No participants yet.
              </p>
            ) : (
              participants.map((participant) => (
                <div
                  key={participant.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 0",
                    borderBottom: "1px solid #303236",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      flexShrink: 0,
                      borderRadius: "50%",
                      background: "#475467",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "13px",
                    }}
                  >
                    {participant.display_name
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {participant.display_name}
                  </span>
                </div>
              ))
            )}
          </aside>
        )}

        {/* Chat panel */}
        {showChat && (
  <aside
    style={{
      width: "min(300px, 100%)",
      flexShrink: 0,
      background: "#202124",
      borderRadius: "12px",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        padding: "20px",
        borderBottom: "1px solid #303236",
      }}
    >
      <h2 style={{ fontSize: "17px" }}>
        Meeting Chat
      </h2>
    </div>

    <div
      style={{
        flex: 1,
        minHeight: "250px",
        padding: "16px",
        overflowY: "auto",
      }}
    >
      {chatMessages.length === 0 ? (
        <p
          style={{
            color: "#aeb4bc",
            fontSize: "14px",
            textAlign: "center",
            marginTop: "40px",
          }}
        >
          No messages yet.
        </p>
      ) : (
        chatMessages.map((chat, index) => (
          <div
            key={index}
            style={{
              marginBottom: "14px",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                color: "#aeb4bc",
                marginBottom: "4px",
              }}
            >
              {chat.name}
            </p>

            <div
              style={{
                background: "#303236",
                borderRadius: "8px",
                padding: "8px 10px",
                fontSize: "14px",
                wordBreak: "break-word",
              }}
            >
              {chat.message}
            </div>
          </div>
        ))
      )}
    </div>

    <div
      style={{
        padding: "12px",
        borderTop: "1px solid #303236",
        display: "flex",
        gap: "8px",
      }}
    >
      <input
        value={chatInput}
        onChange={(event) => setChatInput(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            sendChatMessage();
          }
        }}
        placeholder="Type a message..."
        style={{
          flex: 1,
          minWidth: 0,
          background: "#303236",
          color: "#ffffff",
          border: "1px solid #45474c",
          borderRadius: "8px",
          padding: "10px",
        }}
      />

      <button
        onClick={sendChatMessage}
        style={{
          border: "none",
          borderRadius: "8px",
          padding: "0 14px",
          background: "#2d8cff",
          color: "#ffffff",
          fontWeight: 600,
        }}
      >
        Send
      </button>
    </div>
  </aside>
)}
      </section>

      {/* Media permission message */}
      {mediaError && (
        <div
          style={{
            position: "fixed",
            left: "50%",
            bottom: "104px",
            transform: "translateX(-50%)",
            zIndex: 20,
            background: "#3a3b3f",
            color: "#ffffff",
            padding: "10px 16px",
            borderRadius: "8px",
            fontSize: "13px",
            maxWidth: "90%",
            textAlign: "center",
          }}
        >
          {mediaError}
        </div>
      )}

      {/* Bottom controls */}
      <footer
        style={{
          minHeight: "88px",
          flexShrink: 0,
          background: "#202124",
          borderTop: "1px solid #303236",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          padding: "16px 24px",
        }}
      >
        {/* Microphone */}
        <button
          onClick={toggleMicrophone}
          title={
            micOn
              ? "Mute microphone"
              : "Unmute microphone"
          }
          style={{
            width: "48px",
            height: "48px",
            border: "none",
            borderRadius: "50%",
            background: micOn ? "#3a3b3f" : "#d92d20",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {micOn ? (
            <Mic size={21} />
          ) : (
            <MicOff size={21} />
          )}
        </button>

        {/* Camera */}
        <button
          onClick={toggleCamera}
          title={
            cameraOn
              ? "Turn off camera"
              : "Turn on camera"
          }
          style={{
            width: "48px",
            height: "48px",
            border: "none",
            borderRadius: "50%",
            background: cameraOn ? "#3a3b3f" : "#d92d20",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {cameraOn ? (
            <Video size={21} />
          ) : (
            <VideoOff size={21} />
          )}
        </button>

        {/* Participants */}
        <button
          onClick={() =>
            setShowParticipants((value) => !value)
          }
          title="Participants"
          style={{
            width: "48px",
            height: "48px",
            border: "none",
            borderRadius: "50%",
            background: showParticipants
              ? "#2d8cff"
              : "#3a3b3f",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Users size={21} />
        </button>

        {/* Chat */}
        <button
          onClick={() => setShowChat((value) => !value)}
          title="Chat"
          style={{
            width: "48px",
            height: "48px",
            border: "none",
            borderRadius: "50%",
            background: showChat
              ? "#2d8cff"
              : "#3a3b3f",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MessageSquare size={21} />
        </button>

        {/* Screen share placeholder */}
        <button
          onClick={toggleScreenShare}
          title={screenSharing ? "Stop sharing" : "Share screen"}
          style={{
            width: "48px",
            height: "48px",
            border: "none",
            borderRadius: "50%",
            background: screenSharing ? "#2d8cff" : "#3a3b3f",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MonitorUp size={21} />
        </button>
        {/* Leave */}
        <button
          onClick={leaveMeeting}
          title="Leave meeting"
          style={{
            marginLeft: "12px",
            height: "48px",
            padding: "0 20px",
            border: "none",
            borderRadius: "8px",
            background: "#d92d20",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: 600,
          }}
        >
          <PhoneOff size={19} />
          Leave
        </button>
      </footer>
    </main>
  );
}