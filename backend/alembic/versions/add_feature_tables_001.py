"""Alembic migration: Add new feature tables.

This migration adds columns and tables for:
- Email verification (users table)
- Push notification subscriptions
- Skill decay tracking
- Referral tracking
- Success stories
- Weekly digest preferences
- Streak tracking
- Daily missions

Revision ID: add_feature_tables_001
"""

from alembic import op
import sqlalchemy as sa
from datetime import datetime


# Revision identifiers
revision = 'add_feature_tables_001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ── Users table: add verification + preferences columns ──
    op.add_column('users', sa.Column('email_verified', sa.Boolean(), default=False, server_default='0'))
    op.add_column('users', sa.Column('email_verified_at', sa.DateTime(), nullable=True))
    op.add_column('users', sa.Column('referral_code', sa.String(20), nullable=True, unique=True))
    op.add_column('users', sa.Column('referred_by', sa.String(20), nullable=True))
    op.add_column('users', sa.Column('locale', sa.String(5), default='en', server_default='en'))

    # ── Push Subscriptions ──
    op.create_table(
        'push_subscriptions',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('endpoint', sa.Text(), nullable=False),
        sa.Column('p256dh_key', sa.Text(), nullable=True),
        sa.Column('auth_key', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), default=datetime.utcnow),
    )
    op.create_index('ix_push_subscriptions_user_id', 'push_subscriptions', ['user_id'])

    # ── Notification Preferences ──
    op.create_table(
        'notification_preferences',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('skill_decay_alerts', sa.Boolean(), default=True, server_default='1'),
        sa.Column('weekly_digest', sa.Boolean(), default=True, server_default='1'),
        sa.Column('streak_reminders', sa.Boolean(), default=True, server_default='1'),
        sa.Column('job_matches', sa.Boolean(), default=True, server_default='1'),
        sa.Column('community_updates', sa.Boolean(), default=False, server_default='0'),
    )

    # ── Skill Decay Tracking ──
    op.create_table(
        'skill_practice_log',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('skill_id', sa.String(36), nullable=False),
        sa.Column('skill_name', sa.String(200), nullable=False),
        sa.Column('last_practiced', sa.DateTime(), nullable=False),
        sa.Column('practice_count', sa.Integer(), default=0),
        sa.Column('created_at', sa.DateTime(), default=datetime.utcnow),
    )
    op.create_index('ix_skill_practice_user', 'skill_practice_log', ['user_id', 'skill_id'])

    # ── Referral Tracking ──
    op.create_table(
        'referrals',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('referrer_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('referred_email', sa.String(320), nullable=False),
        sa.Column('referred_user_id', sa.String(36), nullable=True),
        sa.Column('status', sa.String(20), default='pending'),  # pending, signed_up, active
        sa.Column('reward_given', sa.Boolean(), default=False),
        sa.Column('created_at', sa.DateTime(), default=datetime.utcnow),
    )

    # ── Success Stories ──
    op.create_table(
        'success_stories',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('company', sa.String(100), nullable=True),
        sa.Column('role', sa.String(100), nullable=True),
        sa.Column('story', sa.Text(), nullable=False),
        sa.Column('linkedin_url', sa.String(500), nullable=True),
        sa.Column('salary_range', sa.String(50), nullable=True),
        sa.Column('months_to_hire', sa.Integer(), nullable=True),
        sa.Column('approved', sa.Boolean(), default=False),
        sa.Column('created_at', sa.DateTime(), default=datetime.utcnow),
    )

    # ── Streak Tracking ──
    op.create_table(
        'user_streaks',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('current_streak', sa.Integer(), default=0),
        sa.Column('longest_streak', sa.Integer(), default=0),
        sa.Column('last_active_date', sa.Date(), nullable=True),
        sa.Column('total_active_days', sa.Integer(), default=0),
    )

    # ── Daily Activity Log (for streaks) ──
    op.create_table(
        'daily_activity',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('mission_completed', sa.Boolean(), default=False),
        sa.Column('skills_practiced', sa.Integer(), default=0),
        sa.Column('minutes_spent', sa.Integer(), default=0),
        sa.Column('xp_earned', sa.Integer(), default=0),
    )
    op.create_index('ix_daily_activity_user_date', 'daily_activity', ['user_id', 'date'], unique=True)

    # ── Digest Subscriptions ──
    op.create_table(
        'digest_subscriptions',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('subscribed', sa.Boolean(), default=True, server_default='1'),
        sa.Column('last_sent', sa.DateTime(), nullable=True),
        sa.Column('frequency', sa.String(20), default='weekly', server_default="'weekly'"),
    )


def downgrade():
    op.drop_table('digest_subscriptions')
    op.drop_table('daily_activity')
    op.drop_table('user_streaks')
    op.drop_table('success_stories')
    op.drop_table('referrals')
    op.drop_table('skill_practice_log')
    op.drop_table('notification_preferences')
    op.drop_table('push_subscriptions')

    op.drop_column('users', 'locale')
    op.drop_column('users', 'referred_by')
    op.drop_column('users', 'referral_code')
    op.drop_column('users', 'email_verified_at')
    op.drop_column('users', 'email_verified')
