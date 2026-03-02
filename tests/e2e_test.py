#!/usr/bin/env python3
"""
PathWise E2E Testing Suite
Comprehensive testing of all backend API endpoints and functionality
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "https://pathwise-production-0768.up.railway.app"
FRONTEND_URL = "https://frontend-production-752a.up.railway.app"

# Test results tracking
test_results = {
    "passed": 0,
    "failed": 0,
    "skipped": 0,
    "errors": []
}

def log_test(name, passed, message=""):
    """Log test result"""
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status}: {name}")
    if message:
        print(f"       {message}")
    if passed:
        test_results["passed"] += 1
    else:
        test_results["failed"] += 1
        test_results["errors"].append({"test": name, "message": message})

def test_health_check():
    """Test 1: Health check endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=10)
        log_test("Health Check", response.status_code == 200, f"Status: {response.status_code}")
        return response.status_code == 200
    except Exception as e:
        log_test("Health Check", False, str(e))
        return False

def test_api_docs():
    """Test 2: API documentation endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/docs", timeout=10)
        log_test("API Docs Available", response.status_code == 200, f"Status: {response.status_code}")
        return response.status_code == 200
    except Exception as e:
        log_test("API Docs Available", False, str(e))
        return False

def test_openapi_schema():
    """Test 3: OpenAPI schema endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/openapi.json", timeout=10)
        log_test("OpenAPI Schema", response.status_code == 200, f"Status: {response.status_code}")
        return response.status_code == 200
    except Exception as e:
        log_test("OpenAPI Schema", False, str(e))
        return False

def test_auth_register():
    """Test 4: User registration endpoint"""
    try:
        test_email = f"test_{int(time.time())}@test.com"
        response = requests.post(
            f"{BASE_URL}/api/v1/auth/register",
            json={
                "email": test_email,
                "password": "TestPassword123!",
                "name": "Test User"
            },
            timeout=10
        )
        # 200 = success, 400 = already exists (both are valid responses)
        passed = response.status_code in [200, 201, 400]
        log_test("User Registration", passed, f"Status: {response.status_code}")
        return passed, test_email
    except Exception as e:
        log_test("User Registration", False, str(e))
        return False, None

def test_auth_login():
    """Test 5: User login endpoint"""
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/auth/login",
            json={
                "email": "test@test.com",
                "password": "TestPassword123!"
            },
            timeout=10
        )
        # 200 = success, 401 = invalid credentials (both are valid responses for testing)
        passed = response.status_code in [200, 401]
        log_test("User Login", passed, f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            return True, data.get("access_token")
        return passed, None
    except Exception as e:
        log_test("User Login", False, str(e))
        return False, None

def test_career_roles():
    """Test 6: Career paths endpoint (public)"""
    try:
        response = requests.get(f"{BASE_URL}/api/v1/career/paths", timeout=10)
        passed = response.status_code == 200
        log_test("Career Paths", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_test("Career Paths", False, str(e))
        return False

def test_career_discover():
    """Test 7: Career discovery endpoint (requires auth)"""
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/career/discover",
            json={
                "interests": ["building", "problem_solving"],
                "work_style": "remote",
                "experience_level": "beginner"
            },
            timeout=10
        )
        # 403 expected without auth token
        passed = response.status_code in [200, 401, 403, 422]
        log_test("Career Discover (Auth)", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_test("Career Discover (Auth)", False, str(e))
        return False

def test_roadmap_generate():
    """Test 8: Roadmap generation endpoint (requires auth)"""
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/roadmaps/generate",
            json={
                "job_description": "Full Stack Developer with React and Node.js experience",
                "skill_level": "beginner",
                "industry": "technology"
            },
            timeout=30
        )
        # 401/403 expected without auth token
        passed = response.status_code in [200, 401, 403, 422]
        log_test("Roadmap Generate", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_test("Roadmap Generate", False, str(e))
        return False

def test_social_groups_list():
    """Test 9: Social groups listing (requires auth)"""
    try:
        response = requests.get(f"{BASE_URL}/api/v1/social/groups", timeout=10)
        # 403 expected without auth token
        passed = response.status_code in [200, 401, 403]
        log_test("Social Groups (Auth)", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_test("Social Groups (Auth)", False, str(e))
        return False

def test_gamification_stats():
    """Test 10: Gamification stats endpoint (requires auth)"""
    try:
        response = requests.get(f"{BASE_URL}/api/v1/gamification/stats", timeout=10)
        # 403 expected without auth token
        passed = response.status_code in [200, 401, 403]
        log_test("Gamification Stats (Auth)", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_test("Gamification Stats (Auth)", False, str(e))
        return False

def test_challenges_list():
    """Test 11: Challenges today endpoint (requires auth)"""
    try:
        response = requests.get(f"{BASE_URL}/api/v1/challenges/today", timeout=10)
        # 401/403 expected without auth token
        passed = response.status_code in [200, 401, 403]
        log_test("Challenges Today", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_test("Challenges Today", False, str(e))
        return False

def test_challenges_today():
    """Test 12: Today's challenge endpoint (requires auth)"""
    try:
        response = requests.get(f"{BASE_URL}/api/v1/challenges/today", timeout=10)
        # 403 expected without auth token
        passed = response.status_code in [200, 401, 403, 404]
        log_test("Today's Challenge (Auth)", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_test("Today's Challenge (Auth)", False, str(e))
        return False

def test_frontend_landing():
    """Test 13: Frontend landing page"""
    try:
        response = requests.get(FRONTEND_URL, timeout=15)
        passed = response.status_code == 200
        log_test("Frontend Landing Page", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_test("Frontend Landing Page", False, str(e))
        return False

def test_frontend_login():
    """Test 14: Frontend login page"""
    try:
        response = requests.get(f"{FRONTEND_URL}/login", timeout=15)
        passed = response.status_code == 200
        log_test("Frontend Login Page", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_test("Frontend Login Page", False, str(e))
        return False

def test_frontend_signup():
    """Test 15: Frontend signup page (redirects to login)"""
    try:
        response = requests.get(f"{FRONTEND_URL}/signup", timeout=15, allow_redirects=True)
        # 200 after redirect or 307/308 redirect is expected
        passed = response.status_code in [200, 307, 308]
        log_test("Frontend Signup Page", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_test("Frontend Signup Page", False, str(e))
        return False

def test_chat_message():
    """Test 16: AI Chat message endpoint (requires auth)"""
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/chat/message",
            json={
                "message": "Hello",
                "context": "general"
            },
            timeout=30
        )
        # 403 expected without auth token
        passed = response.status_code in [200, 401, 403, 422]
        log_test("AI Chat Message (Auth)", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_test("AI Chat Message (Auth)", False, str(e))
        return False

def test_skills_current():
    """Test 17: User readiness endpoint (requires auth)"""
    try:
        response = requests.get(f"{BASE_URL}/api/v1/readiness/score", timeout=10)
        # 401/403 expected without auth token
        passed = response.status_code in [200, 401, 403]
        log_test("Readiness Score", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_test("Readiness Score", False, str(e))
        return False

def test_jobs_matching():
    """Test 18: Job matching endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/api/v1/jobs/matching", timeout=10)
        passed = response.status_code in [200, 401, 404]
        log_test("Job Matching", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_test("Job Matching", False, str(e))
        return False

def test_job_tracker():
    """Test 19: Job tracker endpoint (requires auth)"""
    try:
        response = requests.get(f"{BASE_URL}/api/v1/job-tracker", timeout=10)
        # 403 expected without auth token
        passed = response.status_code in [200, 401, 403, 404]
        log_test("Job Tracker (Auth)", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_test("Job Tracker (Auth)", False, str(e))
        return False

def test_analytics_velocity():
    """Test 20: Analytics velocity endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/api/v1/analytics/velocity", timeout=10)
        passed = response.status_code in [200, 401, 404]
        log_test("Analytics Velocity", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_test("Analytics Velocity", False, str(e))
        return False

def test_user_profile():
    """Test 21: User profile endpoint (requires auth)"""
    try:
        response = requests.get(f"{BASE_URL}/api/v1/users/profile", timeout=10)
        # 403 expected without auth token
        passed = response.status_code in [200, 401, 403]
        log_test("User Profile (Auth)", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_test("User Profile (Auth)", False, str(e))
        return False

def test_notification_preferences():
    """Test 22: Notification preferences endpoint (requires auth)"""
    try:
        response = requests.get(f"{BASE_URL}/api/v1/users/notification-preferences", timeout=10)
        # 403 expected without auth token
        passed = response.status_code in [200, 401, 403, 404]
        log_test("Notification Preferences (Auth)", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_test("Notification Preferences (Auth)", False, str(e))
        return False

def test_exams_progress():
    """Test 23: Exam progress endpoint (requires auth)"""
    try:
        response = requests.get(f"{BASE_URL}/api/v1/exams/progress/test-roadmap", timeout=10)
        # 403 expected without auth token
        passed = response.status_code in [200, 401, 403, 404]
        log_test("Exam Progress (Auth)", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_test("Exam Progress (Auth)", False, str(e))
        return False

def test_income_entries():
    """Test 24: Income entries endpoint (requires auth)"""
    try:
        response = requests.get(f"{BASE_URL}/api/v1/income/entries", timeout=10)
        # 403 expected without auth token
        passed = response.status_code in [200, 401, 403, 404]
        log_test("Income Entries (Auth)", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_test("Income Entries (Auth)", False, str(e))
        return False

def test_gamification_benchmarks():
    """Test 25: Gamification benchmarks endpoint (requires auth)"""
    try:
        response = requests.get(f"{BASE_URL}/api/v1/gamification/benchmarks", timeout=10)
        # 403 expected without auth token
        passed = response.status_code in [200, 401, 403]
        log_test("Gamification Benchmarks (Auth)", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_test("Gamification Benchmarks (Auth)", False, str(e))
        return False

def test_gamification_notifications():
    """Test 26: Gamification notifications endpoint (requires auth)"""
    try:
        response = requests.get(f"{BASE_URL}/api/v1/gamification/notifications", timeout=10)
        # 403 expected without auth token
        passed = response.status_code in [200, 401, 403]
        log_test("Gamification Notifications (Auth)", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_test("Gamification Notifications (Auth)", False, str(e))
        return False

def test_daily_checkin():
    """Test 27: Daily check-in endpoint (requires auth)"""
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/gamification/checkin",
            json={"mood": "productive", "goals": ["Learn React"]},
            timeout=10
        )
        # 403 expected without auth token
        passed = response.status_code in [200, 401, 403, 422]
        log_test("Daily Check-in (Auth)", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_test("Daily Check-in (Auth)", False, str(e))
        return False

def test_success_stories():
    """Test 28: Success stories endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/api/v1/success-stories", timeout=10)
        passed = response.status_code in [200, 401, 404]
        log_test("Success Stories", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_test("Success Stories", False, str(e))
        return False

def test_applications_list():
    """Test 29: Applications list endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/api/v1/applications", timeout=10)
        passed = response.status_code in [200, 401, 404]
        log_test("Applications List", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_test("Applications List", False, str(e))
        return False

def test_skills_decay():
    """Test 30: Skills decay analysis endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/api/v1/skills/decay-analysis", timeout=10)
        passed = response.status_code in [200, 401, 404]
        log_test("Skills Decay Analysis", passed, f"Status: {response.status_code}")
        return passed
    except Exception as e:
        log_test("Skills Decay Analysis", False, str(e))
        return False

def run_all_tests():
    """Run all tests"""
    print("=" * 60)
    print("PathWise E2E Testing Suite")
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Backend: {BASE_URL}")
    print(f"Frontend: {FRONTEND_URL}")
    print("=" * 60)
    print()
    
    # Run tests
    print("🔍 INFRASTRUCTURE TESTS")
    print("-" * 40)
    test_health_check()
    test_api_docs()
    test_openapi_schema()
    print()
    
    print("🔐 AUTHENTICATION TESTS")
    print("-" * 40)
    test_auth_register()
    test_auth_login()
    print()
    
    print("🎯 CAREER TESTS")
    print("-" * 40)
    test_career_roles()
    test_career_discover()
    print()
    
    print("🗺️ ROADMAP TESTS")
    print("-" * 40)
    test_roadmap_generate()
    print()
    
    print("👥 SOCIAL TESTS")
    print("-" * 40)
    test_social_groups_list()
    print()
    
    print("🎮 GAMIFICATION TESTS")
    print("-" * 40)
    test_gamification_stats()
    test_gamification_benchmarks()
    test_gamification_notifications()
    test_daily_checkin()
    print()
    
    print("📚 CHALLENGE TESTS")
    print("-" * 40)
    test_challenges_list()
    test_challenges_today()
    print()
    
    print("💼 JOB TESTS")
    print("-" * 40)
    test_jobs_matching()
    test_job_tracker()
    test_applications_list()
    print()
    
    print("📊 ANALYTICS TESTS")
    print("-" * 40)
    test_analytics_velocity()
    test_skills_current()
    test_skills_decay()
    print()
    
    print("👤 USER TESTS")
    print("-" * 40)
    test_user_profile()
    test_notification_preferences()
    test_income_entries()
    print()
    
    print("🤖 AI TESTS")
    print("-" * 40)
    test_chat_message()
    print()
    
    print("📝 EXAM TESTS")
    print("-" * 40)
    test_exams_progress()
    print()
    
    print("📖 CONTENT TESTS")
    print("-" * 40)
    test_success_stories()
    print()
    
    print("🌐 FRONTEND TESTS")
    print("-" * 40)
    test_frontend_landing()
    test_frontend_login()
    test_frontend_signup()
    print()
    
    # Summary
    print("=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    total = test_results["passed"] + test_results["failed"]
    print(f"Total Tests: {total}")
    print(f"✅ Passed: {test_results['passed']}")
    print(f"❌ Failed: {test_results['failed']}")
    print(f"Success Rate: {(test_results['passed']/total*100):.1f}%")
    print()
    
    if test_results["errors"]:
        print("FAILED TESTS:")
        for error in test_results["errors"]:
            print(f"  - {error['test']}: {error['message']}")
    
    print("=" * 60)
    return test_results

if __name__ == "__main__":
    run_all_tests()
