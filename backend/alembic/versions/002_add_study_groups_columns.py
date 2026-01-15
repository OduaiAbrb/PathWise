"""Add missing columns to study_groups table

Revision ID: 002_add_study_groups_columns
Revises: 001_baseline_roadmap_v2
Create Date: 2026-01-15

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '002_add_study_groups_columns'
down_revision = '001_baseline_roadmap_v2'
branch_labels = None
depends_on = None


def upgrade():
    # Add missing columns to study_groups table
    op.add_column('study_groups', sa.Column('topic', sa.String(255), nullable=True))
    op.add_column('study_groups', sa.Column('member_count', sa.Integer(), server_default='0', nullable=True))
    op.add_column('study_groups', sa.Column('is_private', sa.Boolean(), server_default='false', nullable=True))
    op.add_column('study_groups', sa.Column('is_active', sa.Boolean(), server_default='true', nullable=True))


def downgrade():
    op.drop_column('study_groups', 'is_active')
    op.drop_column('study_groups', 'is_private')
    op.drop_column('study_groups', 'member_count')
    op.drop_column('study_groups', 'topic')
