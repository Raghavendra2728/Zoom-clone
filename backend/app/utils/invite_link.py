from app.config import settings


def generate_invite_link(meeting_id: str) -> str:
    """
    Generate the frontend URL used to join a meeting.

    Example:
        http://localhost:3000/meeting/8473926150
    """
    base_url = settings.FRONTEND_URL.rstrip("/")

    return f"{base_url}/meeting/{meeting_id}"