# Export all models for alembic or Base.metadata.create_all
from app.models.user import User
from app.models.profile import OfficialProfile, CompetencyDomain, Competency, JobRoleCompetencyMap, CompetencyProfile, SkillGap
from app.models.learning import LearningPath, LearningPathItem, IGOTCourse, IGOTEnrollment, NSSTAProgram, NSSTANomination
from app.models.assessment import Document, DocumentChunk, Quiz, MCQQuestion, QuizAttempt, QuestionResponse, AssistantConversation, AssistantMessage
from app.models.analytics import LearningEvent
