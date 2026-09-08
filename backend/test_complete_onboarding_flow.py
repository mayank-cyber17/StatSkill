import asyncio
import sys
import httpx
import time

BASE_URL = "http://127.0.0.1:8000/api/v1"

async def test_complete_flow():
    timestamp = int(time.time())
    email = f"new.employee.{timestamp}@statiq.gov.in"
    password = "OfficialPassword123!"
    full_name = f"Rajesh Sharma ({timestamp % 1000})"

    print(f"=== TESTING COMPLETE EMPLOYEE ONBOARDING FLOW ===")
    print(f"Step 1: Registering new employee: {email}")

    async with httpx.AsyncClient(base_url="http://127.0.0.1:8000") as client:
        # 1. Register
        reg_resp = await client.post("/api/v1/auth/register", json={
            "full_name": full_name,
            "email": email,
            "password": password,
            "role": "LEARNER"
        })
        assert reg_resp.status_code == 200, f"Registration failed: {reg_resp.text}"
        auth_data = reg_resp.json()
        token = auth_data["access_token"]
        user = auth_data["user"]
        print(f"  [OK] Registered user ID={user['id']}, role={user['role']}")

        headers = {"Authorization": f"Bearer {token}"}

        # 2. Setup Profile (testing without employee_id to verify auto-generation and root cause fix)
        print(f"Step 2: Submitting official profile setup (without explicit employee_id)...")
        prof_resp = await client.post("/api/v1/profile/setup", json={
            "designation": "Junior Statistical Officer (JSO)",
            "department": "NSSO (Field Operations Division)",
            "organization": "Ministry of Statistics and Programme Implementation (MoSPI)",
            "state": "New Delhi / Central HQ",
            "job_role": "Data Analysis",
            "job_level": "Junior",
            "years_experience": 3,
            "educational_qualification": "Master's in Statistics / Applied Econometrics",
            "prior_trainings": "Basic Statistical Methods, NSSO Survey Training"
        }, headers=headers)
        assert prof_resp.status_code == 200, f"Profile setup failed: {prof_resp.text}"
        profile_data = prof_resp.json()
        print(f"  [OK] Profile created successfully! Auto-generated employee_id: {profile_data.get('employee_id')}")

        # 3. Fetch Onboarding Assessment
        print(f"Step 3: Fetching onboarding competency assessment...")
        onb_resp = await client.get("/api/v1/quizzes/onboarding", headers=headers)
        assert onb_resp.status_code == 200, f"Fetch onboarding quiz failed: {onb_resp.text}"
        quiz_data = onb_resp.json()
        quiz = quiz_data["quiz"]
        questions = quiz_data["questions"]
        print(f"  [OK] Loaded Quiz '{quiz['title']}' with {len(questions)} questions")
        assert len(questions) == 10, f"Expected 10 questions, got {len(questions)}"

        # 4. Submit Assessment with intentional answers to verify real score calculation and gap mapping
        print(f"Step 4: Submitting assessment answers...")
        # Questions 1 to 7 correct ('B', 'B', 'B', 'B', 'B', 'B', 'A'), questions 8 to 10 with other options
        answers = {}
        for q in questions:
            qid = q["id"]
            if qid % 2 == 0:
                answers[str(qid)] = "B"
            else:
                answers[str(qid)] = "A"

        submit_resp = await client.post("/api/v1/quizzes/onboarding/submit", json={
            "answers": answers
        }, headers=headers)
        assert submit_resp.status_code == 200, f"Submit assessment failed: {submit_resp.text}"
        result = submit_resp.json()
        print(f"  [OK] Assessment Evaluated! Score: {result['score']}/{result['total']} ({result['percentage']}%)")
        print(f"  [OK] Identified Strengths: {[s['name'] for s in result.get('strengths', [])]}")
        print(f"  [OK] Identified Skill Gaps: {[g['name'] for g in result.get('skill_gaps', [])]}")

        # 5. Verify Competency Profile
        print(f"Step 5: Verifying competency profile customization...")
        comp_resp = await client.get("/api/v1/profile/competency", headers=headers)
        assert comp_resp.status_code == 200, f"Get competencies failed: {comp_resp.text}"
        comp_data = comp_resp.json()
        assessed_comps = [c for c in comp_data["competencies"] if c["method"] == "ASSESSMENT_EVALUATED"]
        print(f"  [OK] Total competencies: {comp_data['total_competencies']}, Assessed: {len(assessed_comps)}, Average level: {comp_data['average_level']}")
        assert len(assessed_comps) > 0, "No competencies marked as ASSESSMENT_EVALUATED!"

        # 6. Verify Skill Gaps
        print(f"Step 6: Verifying customized skill gaps...")
        gap_resp = await client.get("/api/v1/gap-analysis", headers=headers)
        assert gap_resp.status_code == 200, f"Get gaps failed: {gap_resp.text}"
        gap_data = gap_resp.json()
        print(f"  [OK] Active Skill Gaps count: {gap_data['total_gaps']}, High Priority: {gap_data['high_priority_count']}")
        assert gap_data['total_gaps'] > 0, "Expected active skill gaps to be generated!"

        # 7. Verify Personalized Learning Path
        print(f"Step 7: Verifying personalized learning pathway...")
        path_resp = await client.get("/api/v1/learning-path", headers=headers)
        assert path_resp.status_code == 200, f"Get learning path failed: {path_resp.text}"
        path_data = path_resp.json()
        print(f"  [OK] Learning Path Status: {path_data['status']}, Items Queued: {len(path_data['items'])}")
        print(f"  [OK] Queued Course Modules: {[i['item_title'] for i in path_data['items']]}")
        assert len(path_data['items']) > 0, "Expected personalized items in learning path!"

        # 8. Verify Personal Analytics
        print(f"Step 8: Verifying individual learner analytics...")
        analytics_resp = await client.get("/api/v1/analytics/me", headers=headers)
        assert analytics_resp.status_code == 200, f"Get analytics failed: {analytics_resp.text}"
        analytics_data = analytics_resp.json()
        print(f"  [OK] Quiz stats: {analytics_data['quiz_stats']}, Learning hours: {analytics_data['learning_hours']}")
        assert analytics_data['quiz_stats']['total_taken'] >= 1, "Expected quiz stats to record assessment!"

        print("\n=== COMPLETE ONBOARDING FLOW VERIFIED SUCCESSFULLY! ===")

if __name__ == "__main__":
    asyncio.run(test_complete_flow())
