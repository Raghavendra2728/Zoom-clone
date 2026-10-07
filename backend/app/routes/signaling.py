from collections import defaultdict

from fastapi import APIRouter, WebSocket, WebSocketDisconnect


router = APIRouter(prefix="/ws", tags=["WebSocket"])


class ConnectionManager:
    def __init__(self):
        self.rooms: dict[str, dict[WebSocket, str]] = defaultdict(dict)

    async def connect(
        self,
        meeting_id: str,
        websocket: WebSocket,
        display_name: str,
    ):
        await websocket.accept()
        self.rooms[meeting_id][websocket] = display_name

    def disconnect(
        self,
        meeting_id: str,
        websocket: WebSocket,
    ) -> str | None:
        display_name = self.rooms[meeting_id].pop(websocket, None)

        if not self.rooms[meeting_id]:
            del self.rooms[meeting_id]

        return display_name

    async def broadcast(
        self,
        meeting_id: str,
        message: dict,
        sender: WebSocket,
    ):
        for connection in self.rooms.get(meeting_id, {}):
            if connection != sender:
                await connection.send_json(message)


manager = ConnectionManager()


@router.websocket("/meeting/{meeting_id}")
async def meeting_websocket(
    websocket: WebSocket,
    meeting_id: str,
):
    display_name = "Raghav"

    await manager.connect(
        meeting_id,
        websocket,
        display_name,
    )

    try:
        while True:
            message = await websocket.receive_json()

            if message.get("type") == "join":
                display_name = message.get(
                    "displayName",
                    "Guest",
                )

                manager.rooms[meeting_id][websocket] = display_name

            await manager.broadcast(
                meeting_id,
                message,
                websocket,
            )

    except WebSocketDisconnect:
        display_name = manager.disconnect(
            meeting_id,
            websocket,
        )

        if display_name:
            await manager.broadcast(
                meeting_id,
                {
                    "type": "leave",
                    "displayName": display_name,
                },
                websocket,
            )