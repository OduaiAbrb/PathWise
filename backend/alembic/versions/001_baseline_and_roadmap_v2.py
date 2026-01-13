"""Baseline + Roadmap v2 tables (preferences, phase state, exams, resources)

Revision ID: 001_baseline_roadmap_v2
Revises: 
Create Date: 2026-01-12

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_baseline_roadmap_v2'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Add preferences column to roadmaps table (JSON)
    op.add_column('roadmaps', sa.Column('preferences', sa.JSON(), nullable=True))
    
    # Create roadmap_phase_states table (track unlock + understanding per phase)
    op.create_table(
        'roadmap_phase_states',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('roadmap_id', sa.String(36), sa.ForeignKey('roadmaps.id', ondelete='CASCADE'), nullable=False),
        sa.Column('phase_id', sa.String(100), nullable=False),
        sa.Column('status', sa.String(50), default='locked'),  # locked, unlocked, in_progress, completed
        sa.Column('understanding_score', sa.Integer(), default=0),
        sa.Column('unlocked_at', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now()),
        sa.UniqueConstraint('roadmap_id', 'phase_id', name='uq_roadmap_phase'),
    )
    op.create_index('ix_phase_states_roadmap', 'roadmap_phase_states', ['roadmap_id'])
    
    # Create checkpoint_attempts table
    op.create_table(
        'checkpoint_attempts',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('roadmap_id', sa.String(36), sa.ForeignKey('roadmaps.id', ondelete='CASCADE'), nullable=False),
        sa.Column('phase_id', sa.String(100), nullable=False),
        sa.Column('checkpoint_id', sa.String(100), nullable=False),
        sa.Column('question_type', sa.String(20), nullable=False),  # mcq, open, code
        sa.Column('user_answer', sa.Text(), nullable=True),
        sa.Column('is_correct', sa.Boolean(), nullable=True),
        sa.Column('score', sa.Integer(), nullable=True),  # 0-100 for open-ended
        sa.Column('feedback', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index('ix_checkpoint_attempts_user', 'checkpoint_attempts', ['user_id'])
    op.create_index('ix_checkpoint_attempts_roadmap', 'checkpoint_attempts', ['roadmap_id'])
    
    # Create phase_exam_attempts table
    op.create_table(
        'phase_exam_attempts',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('roadmap_id', sa.String(36), sa.ForeignKey('roadmaps.id', ondelete='CASCADE'), nullable=False),
        sa.Column('phase_id', sa.String(100), nullable=False),
        sa.Column('answers', sa.JSON(), nullable=False),  # {question_id: answer}
        sa.Column('scores', sa.JSON(), nullable=True),  # {question_id: score}
        sa.Column('total_score', sa.Integer(), nullable=False),
        sa.Column('passed', sa.Boolean(), nullable=False),
        sa.Column('feedback', sa.JSON(), nullable=True),
        sa.Column('attempt_number', sa.Integer(), default=1),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index('ix_exam_attempts_user', 'phase_exam_attempts', ['user_id'])
    op.create_index('ix_exam_attempts_roadmap', 'phase_exam_attempts', ['roadmap_id'])
    
    # Create user_resource_bookmarks table
    op.create_table(
        'user_resource_bookmarks',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('roadmap_id', sa.String(36), sa.ForeignKey('roadmaps.id', ondelete='CASCADE'), nullable=True),
        sa.Column('skill_id', sa.String(100), nullable=True),
        sa.Column('resource_url', sa.String(1000), nullable=False),
        sa.Column('resource_title', sa.String(500), nullable=False),
        sa.Column('resource_type', sa.String(50), nullable=True),  # video, article, docs, etc.
        sa.Column('status', sa.String(50), default='saved'),  # saved, in_progress, completed
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('rating', sa.Integer(), nullable=True),  # 1-5 stars
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('ix_resource_bookmarks_user', 'user_resource_bookmarks', ['user_id'])
    op.create_index('ix_resource_bookmarks_roadmap', 'user_resource_bookmarks', ['roadmap_id'])


def downgrade():
    op.drop_table('user_resource_bookmarks')
    op.drop_table('phase_exam_attempts')
    op.drop_table('checkpoint_attempts')
    op.drop_table('roadmap_phase_states')
    op.drop_column('roadmaps', 'preferences')
