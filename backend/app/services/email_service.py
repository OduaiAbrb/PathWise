"""Email service using Resend API."""
import resend
import os
from typing import Optional, List

# Initialize Resend API
resend.api_key = os.getenv("RESEND_API_KEY", "re_63Yzf4Nu_PzSvbrkeYY39TBieyBWvFZoy")

FROM_EMAIL = "PathWise <onboarding@resend.dev>"


async def send_email(
    to: str | List[str],
    subject: str,
    html: str,
    from_email: str = FROM_EMAIL,
) -> dict:
    """Send an email using Resend."""
    try:
        params = {
            "from": from_email,
            "to": to if isinstance(to, list) else [to],
            "subject": subject,
            "html": html,
        }
        
        response = resend.Emails.send(params)
        return {"success": True, "id": response.get("id")}
    except Exception as e:
        return {"success": False, "error": str(e)}


async def send_welcome_email(email: str, name: str) -> dict:
    """Send welcome email to new users."""
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #171717; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 40px 20px; }}
            .header {{ text-align: center; margin-bottom: 32px; }}
            .logo {{ font-size: 24px; font-weight: bold; color: #171717; }}
            h1 {{ font-size: 28px; margin-bottom: 16px; }}
            .cta {{ display: inline-block; background: #171717; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 24px 0; }}
            .footer {{ margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5; font-size: 14px; color: #737373; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">PathWise</div>
            </div>
            
            <h1>Welcome to PathWise, {name}! 🎉</h1>
            
            <p>You've taken the first step toward transforming your career. We're excited to help you on your journey.</p>
            
            <p><strong>Here's what you can do next:</strong></p>
            <ul>
                <li>📋 Paste a job description to generate your personalized roadmap</li>
                <li>🎯 Track your progress with our Job-Readiness Score</li>
                <li>🤖 Chat with your AI Study Buddy for personalized guidance</li>
                <li>👥 Join study groups to learn with peers</li>
            </ul>
            
            <a href="https://frontend-production-752a.up.railway.app/dashboard" class="cta">Go to Dashboard</a>
            
            <p>If you have any questions, just reply to this email. We're here to help!</p>
            
            <div class="footer">
                <p>© 2026 PathWise. All rights reserved.</p>
                <p>You're receiving this because you signed up for PathWise.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return await send_email(
        to=email,
        subject="Welcome to PathWise - Your Career Journey Starts Now! 🚀",
        html=html,
    )


async def send_weekly_progress_email(
    email: str,
    name: str,
    readiness_score: int,
    skills_completed: int,
    skills_remaining: int,
    next_action: str,
) -> dict:
    """Send weekly progress report email."""
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #171717; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 40px 20px; }}
            .header {{ text-align: center; margin-bottom: 32px; }}
            .logo {{ font-size: 24px; font-weight: bold; color: #171717; }}
            .score-card {{ background: #f5f5f5; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }}
            .score {{ font-size: 48px; font-weight: bold; color: #171717; }}
            .stats {{ display: flex; justify-content: space-around; margin: 24px 0; }}
            .stat {{ text-align: center; }}
            .stat-value {{ font-size: 24px; font-weight: bold; color: #171717; }}
            .stat-label {{ font-size: 14px; color: #737373; }}
            .next-action {{ background: #171717; color: white; padding: 16px; border-radius: 8px; margin: 24px 0; }}
            .cta {{ display: inline-block; background: #171717; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 24px 0; }}
            .footer {{ margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5; font-size: 14px; color: #737373; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">PathWise</div>
            </div>
            
            <h1>Your Weekly Progress Report 📊</h1>
            
            <p>Hey {name}, here's how you're doing this week:</p>
            
            <div class="score-card">
                <div class="score">{readiness_score}%</div>
                <div>Job Readiness Score</div>
            </div>
            
            <div class="stats">
                <div class="stat">
                    <div class="stat-value">{skills_completed}</div>
                    <div class="stat-label">Skills Completed</div>
                </div>
                <div class="stat">
                    <div class="stat-value">{skills_remaining}</div>
                    <div class="stat-label">Skills Remaining</div>
                </div>
            </div>
            
            <div class="next-action">
                <strong>🎯 Next Best Action:</strong><br>
                {next_action}
            </div>
            
            <a href="https://frontend-production-752a.up.railway.app/dashboard" class="cta">Continue Learning</a>
            
            <div class="footer">
                <p>© 2026 PathWise. All rights reserved.</p>
                <p>You're receiving this because you signed up for PathWise weekly reports.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return await send_email(
        to=email,
        subject=f"Your PathWise Weekly Report - {readiness_score}% Ready! 📈",
        html=html,
    )


async def send_password_reset_email(email: str, reset_token: str) -> dict:
    """Send password reset email."""
    reset_link = f"https://frontend-production-752a.up.railway.app/reset-password?token={reset_token}"
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #171717; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 40px 20px; }}
            .header {{ text-align: center; margin-bottom: 32px; }}
            .logo {{ font-size: 24px; font-weight: bold; color: #171717; }}
            .cta {{ display: inline-block; background: #171717; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 24px 0; }}
            .footer {{ margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5; font-size: 14px; color: #737373; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">PathWise</div>
            </div>
            
            <h1>Reset Your Password</h1>
            
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            
            <a href="{reset_link}" class="cta">Reset Password</a>
            
            <p>This link will expire in 1 hour.</p>
            
            <p>If you didn't request this, you can safely ignore this email.</p>
            
            <div class="footer">
                <p>© 2026 PathWise. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return await send_email(
        to=email,
        subject="Reset Your PathWise Password",
        html=html,
    )


async def send_roadmap_complete_email(
    email: str,
    name: str,
    roadmap_title: str,
    skills_learned: List[str],
) -> dict:
    """Send congratulations email when roadmap is completed."""
    skills_html = "".join([f"<li>{skill}</li>" for skill in skills_learned[:10]])
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #171717; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 40px 20px; }}
            .header {{ text-align: center; margin-bottom: 32px; }}
            .logo {{ font-size: 24px; font-weight: bold; color: #171717; }}
            .celebration {{ font-size: 64px; text-align: center; margin: 24px 0; }}
            .cta {{ display: inline-block; background: #171717; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 24px 0; }}
            .footer {{ margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e5e5; font-size: 14px; color: #737373; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">PathWise</div>
            </div>
            
            <div class="celebration">🎉</div>
            
            <h1>Congratulations, {name}!</h1>
            
            <p>You've completed your <strong>{roadmap_title}</strong> roadmap! This is a huge achievement.</p>
            
            <p><strong>Skills you've mastered:</strong></p>
            <ul>
                {skills_html}
            </ul>
            
            <p><strong>What's next?</strong></p>
            <ul>
                <li>📝 Update your resume with your new skills</li>
                <li>💼 Start applying to jobs</li>
                <li>🎯 Create a new roadmap for your next goal</li>
            </ul>
            
            <a href="https://frontend-production-752a.up.railway.app/projects" class="cta">Build Portfolio Projects</a>
            
            <div class="footer">
                <p>© 2026 PathWise. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return await send_email(
        to=email,
        subject=f"🎉 You Did It! {roadmap_title} Roadmap Complete!",
        html=html,
    )
