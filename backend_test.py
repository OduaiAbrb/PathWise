#!/usr/bin/env python3
"""
PathWise Backend API Testing Suite
Tests all critical API endpoints for the PathWise platform
"""

import requests
import sys
import json
from datetime import datetime
import time

class PathWiseAPITester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_result(self, test_name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name} - PASSED")
        else:
            print(f"❌ {test_name} - FAILED: {details}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/v1/{endpoint}" if not endpoint.startswith('http') else endpoint
        
        # Default headers
        test_headers = {'Content-Type': 'application/json'}
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            test_headers.update(headers)

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            
            if success:
                try:
                    response_data = response.json()
                    self.log_result(name, True)
                    return True, response_data
                except:
                    self.log_result(name, True, "No JSON response")
                    return True, {}
            else:
                try:
                    error_data = response.json()
                    self.log_result(name, False, f"Status {response.status_code}: {error_data}")
                except:
                    self.log_result(name, False, f"Status {response.status_code}: {response.text[:200]}")
                return False, {}

        except requests.exceptions.RequestException as e:
            self.log_result(name, False, f"Request error: {str(e)}")
            return False, {}
        except Exception as e:
            self.log_result(name, False, f"Unexpected error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test basic health endpoints"""
        print("\n" + "="*50)
        print("TESTING BASIC HEALTH ENDPOINTS")
        print("="*50)
        
        # Test root endpoint
        success, _ = self.run_test(
            "Root Endpoint",
            "GET",
            f"{self.base_url}/",
            200
        )
        
        # Test health endpoint
        success, _ = self.run_test(
            "Health Check",
            "GET",
            f"{self.base_url}/health",
            200
        )
        
        return success

    def test_authentication(self):
        """Test authentication endpoints"""
        print("\n" + "="*50)
        print("TESTING AUTHENTICATION")
        print("="*50)
        
        # Test user registration
        timestamp = int(time.time())
        test_email = f"test_{timestamp}@pathwise.com"
        test_password = "TestPassword123!"
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data={
                "email": test_email,
                "name": "Test User",
                "password": test_password
            }
        )
        
        if success and response.get('success'):
            self.token = response['data']['token']
            self.user_id = response['data']['user']['id']
            print(f"   ✅ Token obtained: {self.token[:20]}...")
        
        # Test login with the same credentials
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data={
                "email": test_email,
                "password": test_password
            }
        )
        
        if success and response.get('success'):
            self.token = response['data']['token']
            print(f"   ✅ Login successful, token updated")
        
        # Test get current user
        if self.token:
            success, _ = self.run_test(
                "Get Current User",
                "GET",
                "auth/me",
                200
            )
            
            # Test token verification
            success, _ = self.run_test(
                "Verify Token",
                "GET",
                "auth/verify-token",
                200
            )
        
        return self.token is not None

    def test_career_discovery(self):
        """Test career discovery endpoints"""
        print("\n" + "="*50)
        print("TESTING CAREER DISCOVERY")
        print("="*50)
        
        if not self.token:
            print("❌ Skipping career tests - no authentication token")
            return False
        
        # Test career discovery
        success, _ = self.run_test(
            "Career Discovery",
            "POST",
            "career/discover",
            200,
            data={
                "preferences": {
                    "enjoy": "problem_solving",
                    "preference": "backend",
                    "priority": "salary"
                }
            }
        )
        
        return success

    def test_roadmap_endpoints(self):
        """Test roadmap creation and management"""
        print("\n" + "="*50)
        print("TESTING ROADMAP ENDPOINTS")
        print("="*50)
        
        if not self.token:
            print("❌ Skipping roadmap tests - no authentication token")
            return False
        
        # Test roadmap creation
        success, response = self.run_test(
            "Create Roadmap",
            "POST",
            "roadmaps/generate",
            200,
            data={
                "target_role": "Backend Engineer",
                "experience_level": "intermediate",
                "timeline_months": 6
            }
        )
        
        roadmap_id = None
        if success and response.get('success'):
            roadmap_id = response.get('data', {}).get('id')
        
        # Test get user roadmaps
        success, _ = self.run_test(
            "Get User Roadmaps",
            "GET",
            "roadmaps/",
            200
        )
        
        # Test get specific roadmap if we have an ID
        if roadmap_id:
            success, _ = self.run_test(
                "Get Specific Roadmap",
                "GET",
                f"roadmaps/{roadmap_id}",
                200
            )
        
        return success

    def test_study_buddy(self):
        """Test AI Study Buddy endpoints"""
        print("\n" + "="*50)
        print("TESTING AI STUDY BUDDY")
        print("="*50)
        
        if not self.token:
            print("❌ Skipping study buddy tests - no authentication token")
            return False
        
        # Test chat with study buddy
        success, _ = self.run_test(
            "Study Buddy Chat",
            "POST",
            "study-buddy/chat",
            200,
            data={
                "message": "Explain what is REST API",
                "mode": "explain"
            }
        )
        
        return success

    def test_projects_endpoints(self):
        """Test projects endpoints"""
        print("\n" + "="*50)
        print("TESTING PROJECTS")
        print("="*50)
        
        if not self.token:
            print("❌ Skipping projects tests - no authentication token")
            return False
        
        # Test get projects
        success, _ = self.run_test(
            "Get Projects",
            "GET",
            "projects/",
            200
        )
        
        # Test generate project
        success, _ = self.run_test(
            "Generate Project",
            "POST",
            "projects/generate",
            200,
            data={
                "skill": "Python",
                "difficulty": "intermediate"
            }
        )
        
        return success

    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting PathWise API Testing Suite")
        print(f"📍 Testing against: {self.base_url}")
        print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Run test suites
        health_ok = self.test_health_check()
        auth_ok = self.test_authentication()
        
        # Only run authenticated tests if auth works
        if auth_ok:
            self.test_career_discovery()
            self.test_roadmap_endpoints()
            self.test_study_buddy()
            self.test_projects_endpoints()
        else:
            print("\n❌ Authentication failed - skipping authenticated endpoints")
        
        # Print summary
        self.print_summary()
        
        return self.tests_passed == self.tests_run

    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("TEST SUMMARY")
        print("="*60)
        
        print(f"📊 Total Tests: {self.tests_run}")
        print(f"✅ Passed: {self.tests_passed}")
        print(f"❌ Failed: {self.tests_run - self.tests_passed}")
        print(f"📈 Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        # Show failed tests
        failed_tests = [r for r in self.test_results if not r['success']]
        if failed_tests:
            print(f"\n❌ FAILED TESTS ({len(failed_tests)}):")
            for test in failed_tests:
                print(f"   • {test['test']}: {test['details']}")
        
        print(f"\n⏰ Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")


def main():
    """Main test runner"""
    # Use the public endpoint from environment
    base_url = "http://localhost:8001"  # This should be the public URL
    
    tester = PathWiseAPITester(base_url)
    success = tester.run_all_tests()
    
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())