"""Smart study scheduler service."""
from typing import List, Optional, Dict
from datetime import datetime, timedelta
import json


class SmartScheduler:
    """AI-powered study scheduler."""
    
    @staticmethod
    def find_optimal_study_times(
        calendar_events: List[dict],
        study_duration_minutes: int,
        preferred_times: Optional[List[str]] = None,
        days_ahead: int = 7
    ) -> List[dict]:
        """Find optimal study times based on calendar and preferences."""
        
        optimal_slots = []
        start_date = datetime.now()
        
        for day_offset in range(days_ahead):
            current_day = start_date + timedelta(days=day_offset)
            
            # Define study hours (e.g., 6 AM to 11 PM)
            day_start = current_day.replace(hour=6, minute=0, second=0, microsecond=0)
            day_end = current_day.replace(hour=23, minute=0, second=0, microsecond=0)
            
            # Find free slots
            current_time = day_start
            while current_time + timedelta(minutes=study_duration_minutes) <= day_end:
                slot_end = current_time + timedelta(minutes=study_duration_minutes)
                
                # Check if slot conflicts with calendar events
                is_free = True
                for event in calendar_events:
                    event_start = datetime.fromisoformat(event['start'].replace('Z', '+00:00'))
                    event_end = datetime.fromisoformat(event['end'].replace('Z', '+00:00'))
                    
                    if not (slot_end <= event_start or current_time >= event_end):
                        is_free = False
                        break
                
                if is_free:
                    # Calculate score based on preferences
                    score = SmartScheduler._calculate_time_score(
                        current_time,
                        preferred_times
                    )
                    
                    optimal_slots.append({
                        "start_time": current_time.isoformat(),
                        "end_time": slot_end.isoformat(),
                        "duration_minutes": study_duration_minutes,
                        "score": score,
                        "day_of_week": current_time.strftime("%A"),
                    })
                
                current_time += timedelta(minutes=30)  # Check every 30 minutes
        
        # Sort by score
        optimal_slots.sort(key=lambda x: x['score'], reverse=True)
        
        return optimal_slots[:20]  # Return top 20 slots
    
    @staticmethod
    def _calculate_time_score(time: datetime, preferred_times: Optional[List[str]]) -> float:
        """Calculate a score for a time slot based on preferences."""
        score = 50.0  # Base score
        
        hour = time.hour
        
        # Prefer morning (8-10 AM) and evening (6-8 PM)
        if 8 <= hour <= 10:
            score += 30
        elif 18 <= hour <= 20:
            score += 25
        elif 14 <= hour <= 17:
            score += 15
        elif hour < 7 or hour > 22:
            score -= 30
        
        # Weekend bonus
        if time.weekday() >= 5:  # Saturday or Sunday
            score += 10
        
        # Preferred times bonus
        if preferred_times:
            time_str = time.strftime("%H:%M")
            for pref in preferred_times:
                if pref in time_str:
                    score += 20
        
        return score
    
    @staticmethod
    def generate_study_plan(
        roadmap_data: dict,
        hours_per_week: int,
        start_date: datetime,
        calendar_events: List[dict]
    ) -> dict:
        """Generate a complete study plan with scheduled sessions."""
        
        phases = roadmap_data.get('phases', [])
        total_skills = sum(len(phase.get('skills', [])) for phase in phases)
        
        # Estimate hours per skill
        hours_per_skill = (hours_per_week * 12) / max(total_skills, 1)  # 12 weeks
        
        study_plan = {
            "total_weeks": 12,
            "hours_per_week": hours_per_week,
            "total_hours": hours_per_week * 12,
            "phases": [],
        }
        
        current_date = start_date
        
        for phase in phases:
            phase_plan = {
                "phase_name": phase.get('name', 'Unknown'),
                "skills": [],
                "estimated_weeks": 0,
            }
            
            for skill in phase.get('skills', []):
                skill_hours = hours_per_skill
                skill_sessions = []
                
                # Schedule sessions for this skill
                sessions_needed = int(skill_hours / (hours_per_week / 7))  # Sessions per skill
                
                for _ in range(sessions_needed):
                    # Find next available slot
                    slots = SmartScheduler.find_optimal_study_times(
                        calendar_events,
                        60,  # 1 hour sessions
                        None,
                        7
                    )
                    
                    if slots:
                        best_slot = slots[0]
                        skill_sessions.append(best_slot)
                        current_date = datetime.fromisoformat(best_slot['end_time'])
                
                phase_plan['skills'].append({
                    "name": skill.get('name', 'Unknown'),
                    "estimated_hours": skill_hours,
                    "sessions": skill_sessions,
                })
            
            study_plan['phases'].append(phase_plan)
        
        return study_plan
    
    @staticmethod
    def suggest_pomodoro_schedule(
        total_minutes: int,
        work_interval: int = 25,
        short_break: int = 5,
        long_break: int = 15,
        sessions_before_long_break: int = 4
    ) -> dict:
        """Generate a Pomodoro technique schedule."""
        
        schedule = {
            "total_duration_minutes": total_minutes,
            "intervals": [],
            "total_work_time": 0,
            "total_break_time": 0,
        }
        
        elapsed = 0
        session_count = 0
        
        while elapsed < total_minutes:
            # Work interval
            if elapsed + work_interval <= total_minutes:
                schedule['intervals'].append({
                    "type": "work",
                    "duration_minutes": work_interval,
                    "start_minute": elapsed,
                })
                elapsed += work_interval
                schedule['total_work_time'] += work_interval
                session_count += 1
            else:
                break
            
            # Break interval
            if elapsed < total_minutes:
                if session_count % sessions_before_long_break == 0:
                    break_duration = long_break
                else:
                    break_duration = short_break
                
                if elapsed + break_duration <= total_minutes:
                    schedule['intervals'].append({
                        "type": "break",
                        "duration_minutes": break_duration,
                        "start_minute": elapsed,
                    })
                    elapsed += break_duration
                    schedule['total_break_time'] += break_duration
        
        return schedule
    
    @staticmethod
    def analyze_study_patterns(study_sessions: List[dict]) -> dict:
        """Analyze user's study patterns and provide insights."""
        
        if not study_sessions:
            return {
                "total_sessions": 0,
                "insights": ["No study sessions recorded yet."],
            }
        
        # Calculate statistics
        total_sessions = len(study_sessions)
        total_minutes = sum(s.get('duration_minutes', 0) for s in study_sessions)
        
        # Find most productive time
        hour_counts = {}
        for session in study_sessions:
            start_time = datetime.fromisoformat(session.get('start_time', ''))
            hour = start_time.hour
            hour_counts[hour] = hour_counts.get(hour, 0) + 1
        
        most_productive_hour = max(hour_counts.items(), key=lambda x: x[1])[0] if hour_counts else 9
        
        # Calculate consistency (sessions per week)
        if study_sessions:
            first_session = datetime.fromisoformat(study_sessions[0].get('start_time', ''))
            last_session = datetime.fromisoformat(study_sessions[-1].get('start_time', ''))
            weeks = max((last_session - first_session).days / 7, 1)
            sessions_per_week = total_sessions / weeks
        else:
            sessions_per_week = 0
        
        insights = []
        
        if sessions_per_week >= 5:
            insights.append("🔥 Excellent consistency! You're studying regularly.")
        elif sessions_per_week >= 3:
            insights.append("👍 Good consistency. Try to study a bit more regularly.")
        else:
            insights.append("💡 Try to establish a more consistent study routine.")
        
        if most_productive_hour < 12:
            insights.append(f"🌅 You're most productive in the morning around {most_productive_hour}:00.")
        else:
            insights.append(f"🌙 You're most productive in the evening around {most_productive_hour}:00.")
        
        avg_session_minutes = total_minutes / total_sessions if total_sessions > 0 else 0
        if avg_session_minutes < 30:
            insights.append("⏱️ Consider longer study sessions for better focus (45-60 min).")
        elif avg_session_minutes > 90:
            insights.append("🎯 Great deep work sessions! Remember to take breaks.")
        
        return {
            "total_sessions": total_sessions,
            "total_hours": round(total_minutes / 60, 1),
            "average_session_minutes": round(avg_session_minutes, 1),
            "sessions_per_week": round(sessions_per_week, 1),
            "most_productive_hour": most_productive_hour,
            "insights": insights,
        }
