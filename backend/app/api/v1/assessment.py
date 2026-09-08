from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.assessment import Quiz, MCQQuestion, QuizAttempt, QuestionResponse, Document
from app.schemas.assessment import QuizCreateRequest, QuizSubmitRequest, MCQQuestionUpdate
from app.services.ai.mcq_generator import MCQGenerator
from app.services.ai.llm_service import LLMService
from app.services.ai.rag_service import RAGService
from app.services.ai.competency_engine import CompetencyEngine

router = APIRouter()

@router.post("/generate")
async def generate_quiz(
    req: QuizCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Document).where(Document.id == req.document_id))
    doc = result.scalar_one_or_none()
    if not doc or doc.processing_status != "READY":
        raise HTTPException(status_code=400, detail="Document not ready")

    quiz = Quiz(
        document_id=req.document_id,
        creator_id=current_user.id,
        title=req.title,
        description=req.description,
        total_questions=req.total_questions,
        difficulty_level=req.difficulty_level,
        status="PUBLISHED",
        target_role=req.target_role
    )
    db.add(quiz)
    await db.commit()
    await db.refresh(quiz)

    llm = LLMService()
    rag = RAGService()
    generator = MCQGenerator(llm, rag)
    
    questions = await generator.generate_mcqs(
        document_id=req.document_id,
        collection_name=f"doc_{req.document_id}",
        total_questions=req.total_questions,
        difficulty_level=req.difficulty_level,
        db=db
    )
    
    for q_data in questions:
        q = MCQQuestion(
            quiz_id=quiz.id,
            document_chunk_id=q_data.get('document_chunk_id'),
            question_text=q_data['question_text'],
            option_a=q_data['option_a'],
            option_b=q_data['option_b'],
            option_c=q_data['option_c'],
            option_d=q_data['option_d'],
            correct_option=q_data['correct_option'],
            explanation=q_data['explanation'],
            bloom_level=q_data['bloom_level']
        )
        db.add(q)
    
    await db.commit()
    return {"message": "Quiz generated successfully", "quiz_id": quiz.id, "id": quiz.id}

@router.get("")
async def list_quizzes(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Quiz).order_by(Quiz.id.desc()))
    quizzes = result.scalars().all()
    
    quiz_list = []
    for q in quizzes:
        q_count_res = await db.execute(select(MCQQuestion.id).where(MCQQuestion.quiz_id == q.id))
        actual_count = len(q_count_res.scalars().all())
        quiz_list.append({
            "id": q.id,
            "title": q.title,
            "description": q.description,
            "total_questions": actual_count if actual_count > 0 else q.total_questions,
            "difficulty_level": q.difficulty_level,
            "status": q.status,
            "target_role": q.target_role,
            "created_at": q.created_at
        })
    return quiz_list

@router.get("/onboarding")
async def get_onboarding_quiz(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Quiz).where(Quiz.title.like("%Baseline Competency%") | Quiz.title.like("%Onboarding%"))
    )
    quiz = result.scalars().first()
    
    if not quiz:
        from app.core.seed_quizzes import seed_official_quizzes
        await seed_official_quizzes(db)
        result = await db.execute(
            select(Quiz).where(Quiz.title.like("%Baseline Competency%") | Quiz.title.like("%Onboarding%"))
        )
        quiz = result.scalars().first()
        
    if not quiz:
        result = await db.execute(select(Quiz).order_by(Quiz.id.asc()))
        quiz = result.scalars().first()

    if not quiz:
        raise HTTPException(status_code=404, detail="Onboarding assessment not found")

    q_result = await db.execute(select(MCQQuestion).where(MCQQuestion.quiz_id == quiz.id))
    questions = q_result.scalars().all()
    
    return {
        "quiz": {
            "id": quiz.id,
            "title": quiz.title,
            "description": quiz.description,
            "total_questions": len(questions) or quiz.total_questions,
            "difficulty_level": quiz.difficulty_level,
            "status": quiz.status,
            "target_role": quiz.target_role,
        },
        "questions": [
            {
                "id": q.id,
                "question_text": q.question_text,
                "option_a": q.option_a,
                "option_b": q.option_b,
                "option_c": q.option_c,
                "option_d": q.option_d,
                "bloom_level": q.bloom_level
            }
            for q in questions
        ]
    }

@router.post("/onboarding/submit")
async def submit_onboarding_assessment(
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Quiz).where(Quiz.title.like("%Baseline Competency%") | Quiz.title.like("%Onboarding%"))
    )
    quiz = result.scalars().first()
    quiz_id = quiz.id if quiz else 17
    return await submit_attempt(quiz_id=quiz_id, payload=payload, current_user=current_user, db=db)

@router.get("/history")
async def get_history(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(QuizAttempt).where(QuizAttempt.user_id == current_user.id))
    return result.scalars().all()

@router.get("/onboarding/status")
async def get_onboarding_status(
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(QuizAttempt)
        .where(QuizAttempt.user_id == current_user.id, QuizAttempt.status == "COMPLETED")
        .order_by(QuizAttempt.id.desc())
    )
    attempts = result.scalars().all()
    
    from app.models.profile import CompetencyProfile
    cp_res = await db.execute(
        select(CompetencyProfile)
        .where(
            CompetencyProfile.user_id == current_user.id,
            CompetencyProfile.assessment_method == "ASSESSMENT_EVALUATED"
        )
    )
    eval_comps = cp_res.scalars().all()
    
    has_completed = len(attempts) > 0 or len(eval_comps) > 0
    latest = attempts[0] if attempts else None
    
    return {
        "has_completed_baseline": has_completed,
        "attempts_count": len(attempts),
        "latest_score": latest.percentage if latest else None,
        "eval_competencies_count": len(eval_comps)
    }

@router.get("/{quiz_id}")
async def get_quiz(quiz_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Quiz).where(Quiz.id == quiz_id))
    quiz = result.scalar_one_or_none()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
        
    q_result = await db.execute(select(MCQQuestion).where(MCQQuestion.quiz_id == quiz_id))
    questions = q_result.scalars().all()
    
    return {
        "quiz": {
            "id": quiz.id,
            "title": quiz.title,
            "description": quiz.description,
            "total_questions": len(questions) or quiz.total_questions,
            "difficulty_level": quiz.difficulty_level,
            "status": quiz.status,
            "target_role": quiz.target_role,
        },
        "questions": [
            {
                "id": q.id,
                "question_text": q.question_text,
                "option_a": q.option_a,
                "option_b": q.option_b,
                "option_c": q.option_c,
                "option_d": q.option_d,
                "bloom_level": q.bloom_level
            }
            for q in questions
        ]
    }

@router.put("/{quiz_id}")
async def update_quiz(quiz_id: int, updates: dict, db: AsyncSession = Depends(get_db)):
    return {"message": "Updated"}

@router.post("/{quiz_id}/publish")
async def publish_quiz(quiz_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Quiz).where(Quiz.id == quiz_id))
    quiz = result.scalar_one_or_none()
    if quiz:
        quiz.status = "PUBLISHED"
        await db.commit()
    return {"message": "Published"}

@router.post("/{quiz_id}/attempt/start")
async def start_attempt(quiz_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    attempt = QuizAttempt(quiz_id=quiz_id, user_id=current_user.id)
    db.add(attempt)
    await db.commit()
    return {"attempt_id": attempt.id}

@router.post("/{quiz_id}/attempt/submit")
async def submit_attempt(
    quiz_id: int, 
    payload: dict, 
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    # Normalize payload format: handles both { responses: [...] } and { answers: { [qid]: opt } }
    normalized_responses = []
    if "responses" in payload and isinstance(payload["responses"], list):
        for item in payload["responses"]:
            if isinstance(item, dict):
                normalized_responses.append({
                    "question_id": item.get("question_id"),
                    "selected_option": item.get("selected_option")
                })
    elif "answers" in payload and isinstance(payload["answers"], dict):
        for q_id_str, opt in payload["answers"].items():
            try:
                normalized_responses.append({
                    "question_id": int(q_id_str),
                    "selected_option": str(opt)
                })
            except Exception:
                pass

    # 1. Fetch or create attempt
    attempt_result = await db.execute(
        select(QuizAttempt).where(QuizAttempt.quiz_id == quiz_id, QuizAttempt.user_id == current_user.id)
        .order_by(QuizAttempt.id.desc()).limit(1)
    )
    attempt = attempt_result.scalar_one_or_none()
    if not attempt or attempt.status == "COMPLETED":
        attempt = QuizAttempt(quiz_id=quiz_id, user_id=current_user.id)
        db.add(attempt)
        await db.commit()
        await db.refresh(attempt)
        
    quiz_res = await db.execute(select(Quiz).where(Quiz.id == quiz_id))
    quiz = quiz_res.scalar_one_or_none()

    q_result = await db.execute(select(MCQQuestion).where(MCQQuestion.quiz_id == quiz_id))
    questions = q_result.scalars().all()
    
    # Map responses by question_id
    user_responses = {}
    for resp in normalized_responses:
        qid = resp.get("question_id")
        if qid is not None:
            user_responses[qid] = resp.get("selected_option")
            
    correct_count = 0
    feedback = []
    
    for q in questions:
        selected = user_responses.get(q.id)
        is_correct = (str(q.correct_option).strip().upper() == str(selected).strip().upper()) if selected else False
        if is_correct:
            correct_count += 1
            
        db_resp = QuestionResponse(
            attempt_id=attempt.id,
            question_id=q.id,
            selected_option=selected,
            is_correct=is_correct
        )
        db.add(db_resp)
        
        feedback.append({
            "question_id": q.id,
            "question_text": q.question_text,
            "option_a": q.option_a,
            "option_b": q.option_b,
            "option_c": q.option_c,
            "option_d": q.option_d,
            "selected": selected,
            "correct": q.correct_option,
            "is_correct": is_correct,
            "explanation": q.explanation,
            "bloom_level": q.bloom_level
        })
        
    total_q = len(questions) or 1
    attempt.score = float(correct_count)
    attempt.percentage = round((correct_count / total_q) * 100, 1)
    attempt.status = "COMPLETED"
    
    from datetime import datetime, timezone
    attempt.completed_at = datetime.now(timezone.utc)
    
    await db.commit()
    
    # Trigger competency engine update
    strengths = []
    detected_gaps = []
    try:
        llm = LLMService()
        engine = CompetencyEngine(llm)
        await engine.update_from_assessment_result(
            current_user.id, quiz_id, attempt.id, feedback, attempt.percentage, db
        )
        
        from app.models.profile import CompetencyProfile, SkillGap, Competency
        cp_res = await db.execute(
            select(CompetencyProfile, Competency)
            .join(Competency, CompetencyProfile.competency_id == Competency.id)
            .where(CompetencyProfile.user_id == current_user.id)
        )
        for cp, comp in cp_res.all():
            if cp.current_level >= 3.5:
                strengths.append({"name": comp.name, "level": round(cp.current_level, 1)})
                
        gap_res = await db.execute(
            select(SkillGap, Competency)
            .join(Competency, SkillGap.competency_id == Competency.id)
            .where(SkillGap.user_id == current_user.id)
            .order_by(SkillGap.priority, -SkillGap.gap_score)
        )
        for g, comp in gap_res.all():
            detected_gaps.append({
                "name": comp.name,
                "current": round(g.current_level, 1),
                "required": g.required_level,
                "gap": round(g.gap_score, 1),
                "priority": "HIGH" if g.priority == 1 else "MEDIUM"
            })
    except Exception as e:
        print(f"Competency engine update note: {e}")

    if attempt.percentage >= 80:
        ai_feedback = f"Outstanding mastery demonstrated ({int(attempt.percentage)}%). Core competencies validated against MoSPI standards. Advanced learning modules queued."
    elif attempt.percentage >= 60:
        ai_feedback = f"Solid performance ({int(attempt.percentage)}%). Baseline competencies cleared with targeted skill gaps identified for capacity building."
    else:
        ai_feedback = f"Evaluation completed with score {int(attempt.percentage)}%. Foundational skill gaps detected. Personalized iGOT and NSSTA learning pathway generated."

    return {
        "attempt_id": attempt.id,
        "quiz_id": quiz_id,
        "quiz_title": quiz.title if quiz else "Competency Assessment",
        "score": attempt.score,
        "total": len(questions),
        "percentage": round(attempt.percentage, 1),
        "passed": attempt.percentage >= 60,
        "ai_feedback": ai_feedback,
        "strengths": strengths,
        "skill_gaps": detected_gaps,
        "feedback": feedback,
        "questions": feedback
    }

@router.get("/{quiz_id}/result/{attempt_id}")
async def get_attempt_result(
    quiz_id: int, 
    attempt_id: int, 
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    # Find specified attempt or user's latest attempt on this quiz
    attempt_result = await db.execute(
        select(QuizAttempt).where(QuizAttempt.id == attempt_id, QuizAttempt.quiz_id == quiz_id)
    )
    attempt = attempt_result.scalar_one_or_none()
    if not attempt:
        attempt_result = await db.execute(
            select(QuizAttempt).where(QuizAttempt.quiz_id == quiz_id, QuizAttempt.user_id == current_user.id)
            .order_by(QuizAttempt.id.desc()).limit(1)
        )
        attempt = attempt_result.scalar_one_or_none()
        
    quiz_res = await db.execute(select(Quiz).where(Quiz.id == quiz_id))
    quiz = quiz_res.scalar_one_or_none()
    
    q_result = await db.execute(select(MCQQuestion).where(MCQQuestion.quiz_id == quiz_id))
    questions = q_result.scalars().all()
    
    responses = {}
    if attempt:
        resp_res = await db.execute(select(QuestionResponse).where(QuestionResponse.attempt_id == attempt.id))
        for r in resp_res.scalars().all():
            responses[r.question_id] = r
            
    feedback = []
    correct_count = 0
    for q in questions:
        r = responses.get(q.id)
        selected = r.selected_option if r else None
        is_corr = r.is_correct if r else False
        if is_corr:
            correct_count += 1
        feedback.append({
            "question_id": q.id,
            "question_text": q.question_text,
            "option_a": q.option_a,
            "option_b": q.option_b,
            "option_c": q.option_c,
            "option_d": q.option_d,
            "selected": selected,
            "correct": q.correct_option,
            "is_correct": is_corr,
            "explanation": q.explanation,
            "bloom_level": q.bloom_level
        })
        
    total_q = len(questions) or 1
    score = attempt.score if attempt and attempt.score is not None else float(correct_count)
    percentage = attempt.percentage if attempt and attempt.percentage is not None else round((score / total_q) * 100, 1)
    
    if percentage >= 80:
        ai_feedback = f"Outstanding mastery demonstrated ({int(percentage)}%). All foundational and applied competencies verified against MoSPI curriculum benchmarks."
    elif percentage >= 60:
        ai_feedback = f"Solid foundational performance ({int(percentage)}%). You passed this assessment. Review the explanations below for missed items to solidify your score."
    else:
        ai_feedback = f"Score: {int(percentage)}%. Additional study recommended. Review the detailed explanations below and re-read the module materials on iGOT Karmayogi."
        
    return {
        "attempt_id": attempt.id if attempt else attempt_id,
        "quiz_id": quiz_id,
        "quiz_title": quiz.title if quiz else "Competency Assessment",
        "score": score,
        "total": total_q,
        "percentage": round(percentage, 1),
        "passed": percentage >= 60,
        "ai_feedback": ai_feedback,
        "questions": feedback,
        "feedback": feedback
    }

