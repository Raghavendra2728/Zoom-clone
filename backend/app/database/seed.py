from app.database.database import Base, engine
from app.models import Meeting, Participant, MeetingHistory


def initialize_database() -> None:
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    initialize_database()