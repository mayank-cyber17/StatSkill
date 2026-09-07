from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.services.ai.llm_service import LLMService
from app.services.ai.rag_service import RAGService
from app.models.assessment import DocumentChunk

class MCQGenerator:
    def __init__(self, llm_service: LLMService, rag_service: RAGService):
        self.llm = llm_service
        self.rag = rag_service
    
    async def generate_mcqs(
        self,
        document_id: int,
        collection_name: str,
        total_questions: int,
        difficulty_level: str,
        db: AsyncSession
    ) -> list[dict]:
        result = await db.execute(select(DocumentChunk).where(DocumentChunk.document_id == document_id))
        chunks = result.scalars().all()
        if not chunks:
            return []

        import random, math

        # Shuffle chunks for variety
        shuffled = list(chunks)
        random.shuffle(shuffled)

        n_chunks = len(shuffled)
        questions = []

        # How many questions to ask per chunk (spread evenly, cycle if needed)
        # e.g. 10 questions, 3 chunks → ask 4, 3, 3 from each chunk
        base_per_chunk = math.ceil(total_questions / n_chunks)

        for i, chunk in enumerate(shuffled):
            if len(questions) >= total_questions:
                break

            remaining = total_questions - len(questions)
            ask_count = min(base_per_chunk, remaining)

            prompt = self._build_mcq_prompt(chunk.content, ask_count, difficulty_level)
            try:
                raw_mcqs = await self.llm.generate_json(prompt)
                mcq_list = self._extract_mcq_list(raw_mcqs)
                for raw in mcq_list:
                    normalized = self._normalize_mcq(raw)
                    if normalized and len(questions) < total_questions:
                        normalized['document_chunk_id'] = chunk.id
                        questions.append(normalized)
            except Exception as e:
                print(f"Error generating MCQ from chunk {chunk.id}: {e}")

        # If we still don't have enough (AI generated fewer), retry on random chunks
        retries = 0
        while len(questions) < total_questions and retries < 4:
            retries += 1
            chunk = random.choice(shuffled)
            remaining = total_questions - len(questions)
            prompt = self._build_mcq_prompt(chunk.content, remaining, difficulty_level)
            try:
                raw_mcqs = await self.llm.generate_json(prompt)
                mcq_list = self._extract_mcq_list(raw_mcqs)
                for raw in mcq_list:
                    normalized = self._normalize_mcq(raw)
                    if normalized and len(questions) < total_questions:
                        normalized['document_chunk_id'] = chunk.id
                        questions.append(normalized)
            except Exception as e:
                print(f"Retry {retries} failed: {e}")

        # If still short (e.g. offline/fallback), construct grounded questions directly from chunk sentences
        if len(questions) < total_questions and shuffled:
            fallback_needed = total_questions - len(questions)
            fallback_qs = self._generate_grounded_fallback(shuffled, fallback_needed)
            questions.extend(fallback_qs)

        return questions[:total_questions]
    
    def _extract_mcq_list(self, raw: any) -> list:
        if isinstance(raw, list):
            return raw
        if isinstance(raw, dict):
            for k in ['questions', 'mcqs', 'quiz', 'items', 'data', 'result']:
                if k in raw and isinstance(raw[k], list):
                    return raw[k]
            for v in raw.values():
                if isinstance(v, list):
                    return v
        return []

    def _normalize_mcq(self, mcq: dict) -> dict | None:
        if not isinstance(mcq, dict):
            return None
            
        q_text = mcq.get('question_text') or mcq.get('question') or mcq.get('text')
        if not q_text or len(str(q_text).strip()) < 8:
            return None

        opt_a = mcq.get('option_a') or mcq.get('A') or mcq.get('optionA')
        opt_b = mcq.get('option_b') or mcq.get('B') or mcq.get('optionB')
        opt_c = mcq.get('option_c') or mcq.get('C') or mcq.get('optionC')
        opt_d = mcq.get('option_d') or mcq.get('D') or mcq.get('optionD')

        # Check options array if individual keys not present
        if not (opt_a and opt_b and opt_c and opt_d) and 'options' in mcq and isinstance(mcq['options'], list):
            opts = mcq['options']
            if len(opts) >= 4:
                opt_a, opt_b, opt_c, opt_d = opts[0], opts[1], opts[2], opts[3]

        if not (opt_a and opt_b and opt_c and opt_d):
            return None

        # Clean correct option
        corr = str(mcq.get('correct_option') or mcq.get('correct_answer') or mcq.get('answer') or 'A').strip().upper()
        if 'A' in corr and len(corr) > 1 and not corr.startswith('OPTION A'):
            corr = 'A'
        elif 'B' in corr and len(corr) > 1 and not corr.startswith('OPTION B'):
            corr = 'B'
        elif 'C' in corr and len(corr) > 1 and not corr.startswith('OPTION C'):
            corr = 'C'
        elif 'D' in corr and len(corr) > 1 and not corr.startswith('OPTION D'):
            corr = 'D'
        else:
            corr = corr[:1]
            
        if corr not in ['A', 'B', 'C', 'D']:
            corr = 'A'

        expl = mcq.get('explanation') or f"Correct answer is {corr} as stated directly in the uploaded text."
        bloom = mcq.get('bloom_level') or 'UNDERSTAND'

        return {
            'question_text': str(q_text).strip(),
            'option_a': str(opt_a).strip(),
            'option_b': str(opt_b).strip(),
            'option_c': str(opt_c).strip(),
            'option_d': str(opt_d).strip(),
            'correct_option': corr,
            'explanation': str(expl).strip(),
            'bloom_level': str(bloom).strip().upper()
        }

    def _generate_grounded_fallback(self, chunks: list, count: int) -> list:
        """Constructs grounded questions directly from chunk sentences when LLM is offline."""
        import re
        qs = []
        for chunk in chunks:
            if len(qs) >= count:
                break
            # Split chunk into sentences
            sentences = [s.strip() for s in re.split(r'[.!?]+', chunk.content) if len(s.strip()) > 35]
            for s in sentences:
                if len(qs) >= count:
                    break
                words = s.split()
                if len(words) >= 6:
                    key_phrase = " ".join(words[:4])
                    qs.append({
                        "document_chunk_id": chunk.id,
                        "question_text": f"According to the uploaded material, which of the following statements is correct regarding: \"{key_phrase}...\"?",
                        "option_a": s,
                        "option_b": f"The material specifies that {key_phrase} is never applicable under standard methodology.",
                        "option_c": f"This principle was permanently repealed in previous revisions.",
                        "option_d": f"None of the statements regarding {key_phrase} are supported by the document.",
                        "correct_option": "A",
                        "explanation": f"Grounded directly in the uploaded document: \"{s}\"",
                        "bloom_level": "REMEMBER"
                    })
        return qs

    def _build_mcq_prompt(self, chunk_content: str, n_questions: int, difficulty: str) -> str:
        return f"""You are an expert educational assessor creating a quiz from a study document.

RULES (strictly follow all):
1. Generate EXACTLY {n_questions} MCQ questions — no more, no fewer.
2. Base questions ONLY on the TEXT below. Do not use outside knowledge.
3. Each question must have 4 unique options (A, B, C, D) with exactly one correct answer.
4. Vary the question style: definition, application, comparison, calculation where applicable.
5. Return ONLY a raw JSON array. No markdown, no code blocks, no extra text.

DIFFICULTY: {difficulty}

TEXT:
{chunk_content}

OUTPUT FORMAT (return exactly this structure for each of the {n_questions} questions):
[
  {{
    "question_text": "...",
    "option_a": "...",
    "option_b": "...",
    "option_c": "...",
    "option_d": "...",
    "correct_option": "A",
    "explanation": "...",
    "bloom_level": "REMEMBER"
  }}
]

Remember: The array MUST contain exactly {n_questions} objects."""
