from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class DocumentUploadResponse(BaseModel):
    id: int
    filename: str
    message: str

class DocumentResponse(BaseModel):
    id: int
    filename: str
    original_name: str
    file_size: int
    processing_status: str
    error_message: Optional[str] = None
    created_at: datetime
    model_config = {"from_attributes": True}

class QuizCreateRequest(BaseModel):
    document_id: int
    title: str
    total_questions: int = Field(5, ge=1, le=50)
    difficulty_level: str
    description: Optional[str] = None
    target_role: Optional[str] = None

class MCQQuestionResponse(BaseModel):
    id: int
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    bloom_level: str
    model_config = {"from_attributes": True}
    # correct_option and explanation are intentionally hidden in standard response

class MCQQuestionUpdate(BaseModel):
    question_text: Optional[str] = None
    option_a: Optional[str] = None
    option_b: Optional[str] = None
    option_c: Optional[str] = None
    option_d: Optional[str] = None
    correct_option: Optional[str] = None
    explanation: Optional[str] = None
    bloom_level: Optional[str] = None

class QuizResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    total_questions: int
    difficulty_level: str
    status: str
    questions: List[MCQQuestionResponse]
    model_config = {"from_attributes": True}

class QuizAttemptResponse(BaseModel):
    id: int
    quiz_id: int
    started_at: datetime
    completed_at: Optional[datetime] = None
    score: Optional[float] = None
    percentage: Optional[float] = None
    status: str
    model_config = {"from_attributes": True}

class QuestionSubmission(BaseModel):
    question_id: int
    selected_option: str

class QuizSubmitRequest(BaseModel):
    responses: List[QuestionSubmission]

class QuizResultResponse(BaseModel):
    attempt_id: int
    score: float
    percentage: float
    feedback: List[dict] # {question_id, is_correct, correct_option, explanation}

class AssistantMessageRequest(BaseModel):
    content: str
    conversation_id: Optional[int] = None

class AssistantMessageResponse(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime
    model_config = {"from_attributes": True}

class AssistantConversationResponse(BaseModel):
    id: int
    title: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    messages: List[AssistantMessageResponse]
    model_config = {"from_attributes": True}
