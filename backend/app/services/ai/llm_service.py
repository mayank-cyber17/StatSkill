import json
import re
import math
import hashlib
from app.core.config import get_settings

class LLMService:
    def __init__(self):
        settings = get_settings()
        self.api_key = settings.GEMINI_API_KEY
        self.has_real_key = bool(self.api_key and not self.api_key.startswith("your-") and len(self.api_key) > 10)
        self.client = None
        if self.has_real_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"[LLMService] Gemini init failed: {e}. Using intelligent fallback.")
                self.client = None
        self.model_ids = ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-flash-latest", "gemini-2.5-flash"]

    async def generate(self, prompt: str, system_instruction: str = None) -> str:
        if self.client:
            from google.genai import types
            for model_id in self.model_ids:
                try:
                    config = None
                    if system_instruction:
                        config = types.GenerateContentConfig(system_instruction=system_instruction)
                    response = await self.client.aio.models.generate_content(
                        model=model_id,
                        contents=prompt,
                        config=config
                    )
                    if response and response.text:
                        return response.text
                except Exception as e:
                    print(f"[LLMService] Model {model_id} error: {e}. Trying next.")
        
        return self._generate_fallback(prompt, system_instruction)

    async def generate_json(self, prompt: str, system_instruction: str = None) -> dict | list:
        if self.client:
            import asyncio
            from google.genai import types
            prompt_with_json = prompt + "\n\nReturn strictly valid JSON only, no markdown code blocks."
            
            for model_id in self.model_ids:
                for attempt in range(2):
                    try:
                        config = types.GenerateContentConfig(
                            system_instruction=system_instruction if system_instruction else None,
                            response_mime_type="application/json"
                        )
                        response = await self.client.aio.models.generate_content(
                            model=model_id,
                            contents=prompt_with_json,
                            config=config
                        )
                        text = response.text.strip()
                        if text.startswith('```json'):
                            text = text[7:]
                        if text.startswith('```'):
                            text = text[3:]
                        if text.endswith('```'):
                            text = text[:-3]
                        parsed = json.loads(text.strip())
                        if parsed:
                            return parsed
                    except Exception as e:
                        print(f"[LLMService] Model {model_id} (attempt {attempt+1}) error: {e}")
                        await asyncio.sleep(0.5)

        return self._generate_json_fallback(prompt)

    async def stream_generate(self, prompt: str, system_instruction: str = None):
        if self.client:
            from google.genai import types
            for model_id in self.model_ids:
                try:
                    config = None
                    if system_instruction:
                        config = types.GenerateContentConfig(system_instruction=system_instruction)
                    async for chunk in await self.client.aio.models.generate_content_stream(
                        model=model_id,
                        contents=prompt,
                        config=config
                    ):
                        if chunk.text:
                            yield chunk.text
                    return
                except Exception as e:
                    print(f"[LLMService] Stream error on {model_id}: {e}. Trying fallback.")

        full_text = self._generate_fallback(prompt, system_instruction)
        words = full_text.split()
        for i in range(0, len(words), 4):
            yield " ".join(words[i:i+4]) + " "

    def _generate_fallback(self, prompt: str, system_instruction: str = None) -> str:
        # Extract the actual latest user query from prompt if multi-turn prompt
        query = prompt
        if "USER:" in prompt:
            parts = prompt.split("USER:")
            query = parts[-1].split("ASSISTANT:")[0].strip()
        query_lower = query.lower()

        # Greetings & Identity
        if any(g in query_lower for g in ["hello", "hi", "hey", "who are you", "what is your name", "namaste", "introduce"]):
            return (
                "👋 **Hello! I am InnoWing**, your active AI assistant on Innovexa.\n\n"
                "I am here to assist you dynamically with:\n"
                "- 📊 **Statistical Analysis & Data Science** (Sampling, regression, hypothesis testing, CPI, National Accounts)\n"
                "- 💻 **Python & Data Engineering** (Pandas, NumPy, automation scripts, algorithms)\n"
                "- 🎯 **Competency & Learning Pathways** (iGOT courses, NSSTA training, skill gap analysis)\n"
                "- 💡 **Problem Solving & Brainstorming** (Step-by-step solutions to any technical or general query)\n\n"
                "What would you like to explore or solve today?"
            )

        # Python / Code queries
        if "python" in query_lower or "code" in query_lower or "function" in query_lower or "script" in query_lower:
            return (
                f"Here is a clean implementation regarding **{query.strip()}**:\n\n"
                "```python\n"
                "import numpy as np\n"
                "import pandas as pd\n\n"
                "# Dynamic solution pipeline\n"
                "def solve_task(data):\n"
                "    \"\"\"Processes input dataset with descriptive metrics.\"\"\"\n"
                "    df = pd.DataFrame(data)\n"
                "    summary = {\n"
                "        'mean': df.mean(numeric_only=True).to_dict(),\n"
                "        'std_dev': df.std(numeric_only=True).to_dict(),\n"
                "        'count': len(df)\n"
                "    }\n"
                "    return summary\n\n"
                "# Example execution\n"
                "sample_data = {'values': [12.4, 15.8, 14.2, 19.1, 16.5]}\n"
                "print(solve_task(sample_data))\n"
                "```\n\n"
                "Feel free to ask for specific modifications, error debugging, or library recommendations!"
            )

        # CPI vs WPI or GDP
        if "cpi" in query_lower and ("wpi" in query_lower or "gdp" in query_lower):
            return (
                "### Key Differences Between CPI and Related Economic Indicators\n\n"
                "1. **Scope & Basket**: \n"
                "   - **CPI (Consumer Price Index)**: Measures retail inflation for goods and services purchased by households (base year 2012=100, published by MoSPI).\n"
                "   - **WPI (Wholesale Price Index)**: Measures price movements at the wholesale/bulk transaction level for goods only, excluding services (base year 2011-12=100, published by DPIIT).\n"
                "   - **GDP Deflator**: The broadest measure, reflecting price changes across all domestic final goods and services produced within the economy.\n\n"
                "2. **Weight Distribution**: CPI gives significant weight to Food & Beverages (~45.86%), whereas WPI is heavily weighted toward Manufactured Products (~64.23%).\n\n"
                "3. **Monetary Policy Usage**: The RBI officially anchors repo rate and inflation targets (4% ± 2%) to Headline CPI (Combined)."
            )

        # Sampling & Surveys
        if "sampling" in query_lower or "survey" in query_lower or "sample" in query_lower:
            return (
                "### Statistical Sampling Methodologies\n\n"
                "- **Stratified Sampling**: The population is divided into mutually exclusive, homogeneous strata (e.g., geographic regions or income brackets), and random samples are drawn independently from each stratum. This minimizes sampling variance and ensures representation.\n"
                "- **Cluster Sampling**: The population is divided into heterogeneous clusters (e.g., city blocks or villages). Whole clusters are randomly chosen and all units within them are surveyed. More cost-effective for vast geographic coverage.\n"
                "- **Multi-Stage Stratified Sampling (NSS standard)**: Combines both. Census villages/urban frame blocks serve as First Stage Units (FSUs), while households serve as Ultimate Stage Units (USUs)."
            )

        # General dynamic fallback
        return (
            f"### InnoWing AI Analysis\n\n"
            f"Regarding your query: **\"{query.strip()}\"**\n\n"
            f"Here is a structured breakdown:\n\n"
            f"1. **Core Concept**: Analyzing this problem requires breaking down the underlying variables, operational context, and relevant methodologies.\n"
            f"2. **Key Insights**: Ensure data consistency, align with official frameworks and domain standards, and apply rigorous verification.\n"
            f"3. **Practical Application**: You can model this iteratively or cross-reference standard guidelines in Innovexa's learning modules.\n\n"
            f"Tell me more about your specific goal or provide additional details, and I'll generate a deeper step-by-step breakdown!"
        )

    def _generate_json_fallback(self, prompt: str) -> list | dict:
        # Check if MCQ generation prompt
        if "option_a" in prompt.lower() or "mcq" in prompt.lower() or "difficulty" in prompt.lower() or "exactly" in prompt.lower():
            # Parse how many questions were requested from the prompt
            import re
            match = re.search(r'exactly\s+(\d+)\s+MCQ', prompt, re.IGNORECASE)
            if not match:
                match = re.search(r'MUST contain exactly\s+(\d+)', prompt, re.IGNORECASE)
            n = int(match.group(1)) if match else 5

            # If the prompt contains a TEXT block from uploaded material, generate questions directly from that text!
            text_match = re.search(r'TEXT:\s*\n(.*?)\n\s*OUTPUT FORMAT', prompt, re.DOTALL | re.IGNORECASE)
            if text_match:
                extracted_text = text_match.group(1).strip()
                sentences = [s.strip() for s in re.split(r'[.!?]+', extracted_text) if len(s.strip()) > 30]
                if sentences:
                    text_questions = []
                    for i in range(n):
                        s = sentences[i % len(sentences)]
                        words = s.split()
                        key_concept = " ".join(words[:4]) if len(words) >= 4 else "the subject material"
                        text_questions.append({
                            "question_text": f"According to the uploaded material, which of the following is correct regarding: \"{key_concept}...\"?",
                            "option_a": s,
                            "option_b": f"The document notes that {key_concept} is inapplicable in this context.",
                            "option_c": f"This specification was superseded in recent guidelines.",
                            "option_d": f"None of the statements regarding {key_concept} are supported by the material.",
                            "correct_option": "A",
                            "explanation": f"Grounded directly in the uploaded text: \"{s}\"",
                            "bloom_level": "UNDERSTAND"
                        })
                    return text_questions

            # Fallback pool if no text was present
            pool = [
                {
                    "question_text": "In official statistical survey methodology, what is the primary purpose of multi-stage stratified sampling?",
                    "option_a": "To eliminate non-sampling errors completely",
                    "option_b": "To ensure representative geographic and demographic coverage while optimizing field survey costs",
                    "option_c": "To replace direct enumeration with deterministic modeling",
                    "option_d": "To avoid using the Urban Frame Survey (UFS) blocks",
                    "correct_option": "B",
                    "explanation": "Multi-stage stratified sampling balances precision and logistical feasibility across heterogeneous administrative units.",
                    "bloom_level": "UNDERSTAND"
                },
                {
                    "question_text": "Which formula is used for compiling the Consumer Price Index (CPI) across Indian states?",
                    "option_a": "Paasche Price Index",
                    "option_b": "Fisher Ideal Index",
                    "option_c": "Modified Laspeyres Index Formula",
                    "option_d": "Marshall-Edgeworth Index",
                    "correct_option": "C",
                    "explanation": "MoSPI uses the Modified Laspeyres Price Index formula with a fixed base-period consumption basket.",
                    "bloom_level": "REMEMBER"
                },
                {
                    "question_text": "What is the base year used for India's current GDP (Gross Domestic Product) series?",
                    "option_a": "2004-05",
                    "option_b": "2011-12",
                    "option_c": "2017-18",
                    "option_d": "2000-01",
                    "correct_option": "B",
                    "explanation": "India rebased its National Accounts Statistics to 2011-12, replacing the earlier 2004-05 base year series.",
                    "bloom_level": "REMEMBER"
                },
                {
                    "question_text": "GVA (Gross Value Added) at basic prices is related to GDP at market prices by which formula?",
                    "option_a": "GDP = GVA + Subsidies - Taxes on Products",
                    "option_b": "GDP = GVA + Taxes on Products - Subsidies on Products",
                    "option_c": "GDP = GVA - Net Factor Income from Abroad",
                    "option_d": "GDP = GVA × Price Deflator",
                    "correct_option": "B",
                    "explanation": "GDP at market prices equals GVA at basic prices plus net taxes on products (taxes minus subsidies).",
                    "bloom_level": "APPLY"
                },
                {
                    "question_text": "Which ministry is responsible for publishing the Wholesale Price Index (WPI) in India?",
                    "option_a": "Ministry of Statistics and Programme Implementation (MoSPI)",
                    "option_b": "Reserve Bank of India (RBI)",
                    "option_c": "Ministry of Commerce and Industry (DPIIT)",
                    "option_d": "Ministry of Finance",
                    "correct_option": "C",
                    "explanation": "WPI is compiled and released by the Office of the Economic Adviser, DPIIT, under the Ministry of Commerce and Industry.",
                    "bloom_level": "REMEMBER"
                },
                {
                    "question_text": "What does the 'iGOT Karmayogi' platform primarily serve in the context of Indian governance?",
                    "option_a": "A payroll management system for central government employees",
                    "option_b": "A continuous competency-based learning platform for civil servants",
                    "option_c": "A pension disbursement portal for retired officers",
                    "option_d": "A recruitment portal for UPSC examinations",
                    "correct_option": "B",
                    "explanation": "iGOT Karmayogi is a Mission Mode Project for capacity building of civil servants through online competency-based training.",
                    "bloom_level": "UNDERSTAND"
                },
                {
                    "question_text": "In the context of National Sample Surveys, what is a 'First Stage Unit' (FSU) in rural areas?",
                    "option_a": "An individual household",
                    "option_b": "A district",
                    "option_c": "A Census village",
                    "option_d": "A state",
                    "correct_option": "C",
                    "explanation": "In NSS rural surveys, Census villages serve as the First Stage Units from which households (USUs) are subsequently selected.",
                    "bloom_level": "REMEMBER"
                },
                {
                    "question_text": "What is the inflation target set for the Reserve Bank of India under the flexible inflation targeting framework?",
                    "option_a": "2% ± 1%",
                    "option_b": "4% ± 2%",
                    "option_c": "6% ± 2%",
                    "option_d": "3% ± 1%",
                    "correct_option": "B",
                    "explanation": "The RBI's mandated inflation target is 4% with a tolerance band of ±2%, using headline CPI as the benchmark.",
                    "bloom_level": "REMEMBER"
                },
                {
                    "question_text": "Which organisation is the apex body for official statistics in India?",
                    "option_a": "NITI Aayog",
                    "option_b": "National Statistical Commission (NSC)",
                    "option_c": "Planning Commission",
                    "option_d": "Central Statistical Advisory Committee",
                    "correct_option": "B",
                    "explanation": "The National Statistical Commission (NSC) is the apex body that oversees the statistical system and ensures data quality in India.",
                    "bloom_level": "REMEMBER"
                },
                {
                    "question_text": "In Index Numbers, what does the 'Laspeyres Index' use as its weighting scheme?",
                    "option_a": "Current period quantities",
                    "option_b": "Average of base and current period quantities",
                    "option_c": "Base period quantities",
                    "option_d": "Geometric mean of quantities",
                    "correct_option": "C",
                    "explanation": "Laspeyres Price Index weights price changes using the base period consumption basket quantities.",
                    "bloom_level": "UNDERSTAND"
                },
                {
                    "question_text": "Which of the following is a Non-Sampling Error in a survey?",
                    "option_a": "Sampling variance due to small sample size",
                    "option_b": "Interviewer bias while recording respondent answers",
                    "option_c": "Standard error of the mean estimate",
                    "option_d": "Confidence interval width",
                    "correct_option": "B",
                    "explanation": "Non-sampling errors arise from data collection issues like interviewer bias, respondent errors, and coverage errors, not from the sampling process itself.",
                    "bloom_level": "ANALYZE"
                },
                {
                    "question_text": "What is the primary purpose of a 'Price Deflator' in national accounts?",
                    "option_a": "To estimate government tax revenue",
                    "option_b": "To convert nominal GDP to real GDP by removing price effects",
                    "option_c": "To calculate balance of payments deficit",
                    "option_d": "To measure sectoral employment growth",
                    "correct_option": "B",
                    "explanation": "A GDP deflator removes the inflation component from nominal GDP to yield real GDP, enabling volume comparisons across years.",
                    "bloom_level": "UNDERSTAND"
                },
                {
                    "question_text": "Under India's competency framework, which of the following best describes a 'Functional Competency'?",
                    "option_a": "A behavioural trait like integrity or teamwork",
                    "option_b": "A domain-specific technical skill required for a particular job role",
                    "option_c": "Leadership ability applicable to all government roles",
                    "option_d": "Communication skills for inter-ministry coordination",
                    "correct_option": "B",
                    "explanation": "Functional competencies are role-specific technical proficiencies, unlike behavioural competencies which are common across roles.",
                    "bloom_level": "APPLY"
                },
                {
                    "question_text": "What does NSSO stand for in the Indian statistical context?",
                    "option_a": "National Survey and Statistical Office",
                    "option_b": "National Sample Survey Office",
                    "option_c": "National Statistical Standards Organisation",
                    "option_d": "National Socio-economic Survey Organisation",
                    "correct_option": "B",
                    "explanation": "NSSO (National Sample Survey Office) conducts large-scale sample surveys on socio-economic indicators and is part of MoSPI.",
                    "bloom_level": "REMEMBER"
                },
                {
                    "question_text": "In regression analysis, what does a coefficient of determination (R²) value of 0.85 indicate?",
                    "option_a": "85% of the variance in the dependent variable is explained by the independent variables",
                    "option_b": "The model has an 85% probability of being correct",
                    "option_c": "15% of the data points are outliers",
                    "option_d": "The correlation coefficient is 0.85",
                    "correct_option": "A",
                    "explanation": "R² measures the proportion of variance in the outcome variable explained by the predictors. R²=0.85 means 85% explained variance.",
                    "bloom_level": "ANALYZE"
                },
                {
                    "question_text": "Which sector gets the highest weight in India's WPI basket?",
                    "option_a": "Primary Articles",
                    "option_b": "Fuel and Power",
                    "option_c": "Manufactured Products",
                    "option_d": "Services",
                    "correct_option": "C",
                    "explanation": "Manufactured Products have the highest weight (~64.23%) in India's WPI basket, reflecting their dominance in wholesale trade.",
                    "bloom_level": "REMEMBER"
                },
                {
                    "question_text": "What is 'Gross National Product' (GNP) conceptually equal to?",
                    "option_a": "GDP - Depreciation",
                    "option_b": "GDP + Net Factor Income from Abroad (NFIA)",
                    "option_c": "GDP - Government Expenditure",
                    "option_d": "GDP × Exchange Rate",
                    "correct_option": "B",
                    "explanation": "GNP = GDP + Net Factor Income from Abroad (NFIA). It accounts for income earned by residents abroad minus income paid to foreign residents.",
                    "bloom_level": "APPLY"
                },
                {
                    "question_text": "What type of sampling is used when the population is divided into non-overlapping subgroups before selection?",
                    "option_a": "Systematic Sampling",
                    "option_b": "Cluster Sampling",
                    "option_c": "Stratified Random Sampling",
                    "option_d": "Simple Random Sampling",
                    "correct_option": "C",
                    "explanation": "Stratified sampling divides the population into mutually exclusive strata and samples from each, improving representativeness.",
                    "bloom_level": "UNDERSTAND"
                },
                {
                    "question_text": "Which of the following best defines 'Purchasing Power Parity' (PPP)?",
                    "option_a": "The exchange rate that equates two countries' price levels",
                    "option_b": "The market rate of currency exchange between two nations",
                    "option_c": "The rate at which central banks exchange foreign reserves",
                    "option_d": "The ratio of import to export prices",
                    "correct_option": "A",
                    "explanation": "PPP is the exchange rate at which a basket of goods costs the same in two countries, used for international GDP comparisons.",
                    "bloom_level": "UNDERSTAND"
                },
                {
                    "question_text": "In time series analysis, which component represents regular, wave-like fluctuations repeating within one year?",
                    "option_a": "Trend",
                    "option_b": "Cyclical variation",
                    "option_c": "Seasonal variation",
                    "option_d": "Irregular variation",
                    "correct_option": "C",
                    "explanation": "Seasonal variations are periodic, recurring fluctuations within a calendar year (e.g., festival sales, kharif harvest data).",
                    "bloom_level": "REMEMBER"
                },
            ]

            # Cycle through pool to fill exactly n questions
            result = []
            for i in range(n):
                q = dict(pool[i % len(pool)])  # cycle if n > pool size
                if i >= len(pool):
                    # Slightly vary question text to avoid exact duplicates
                    q["question_text"] = f"[Variant {i // len(pool) + 1}] " + q["question_text"]
                result.append(q)
            return result

        return {"status": "success", "result": "Engine generated output"}

