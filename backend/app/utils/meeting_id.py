import secrets


def generate_meeting_id() -> str:
    """
    Generate a unique 10-digit meeting ID.

    Example:
        8473926150
    """
    return str(secrets.randbelow(9_000_000_000) + 1_000_000_000)