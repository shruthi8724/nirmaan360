import datetime
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    client_name = Column(String(255), nullable=False)
    location = Column(String(255), nullable=False)
    start_date = Column(String(50), nullable=False)
    end_date = Column(String(50), nullable=False)
    budget = Column(Float, nullable=False)  # in ₹
    current_cost = Column(Float, nullable=False, default=0.0)  # in ₹
    planned_progress = Column(Float, nullable=False, default=0.0)  # %
    actual_progress = Column(Float, nullable=False, default=0.0)  # %
    status = Column(String(50), nullable=False, default="Planning") # Planning, In Progress, On Hold, Completed
    manager = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    materials = relationship("Material", back_populates="project", cascade="all, delete-orphan")
    resources = relationship("Resource", back_populates="project")
    risk_assessments = relationship("RiskAssessment", back_populates="project", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="project", cascade="all, delete-orphan")
    progress_history = relationship("ProgressHistory", back_populates="project", cascade="all, delete-orphan")
    cost_history = relationship("CostHistory", back_populates="project", cascade="all, delete-orphan")


class Material(Base):
    __tablename__ = "materials"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False) # Steel, Cement, Aggregates, Precast, Electrical, Plumbing, Finishing
    required_quantity = Column(Float, nullable=False)
    ordered_quantity = Column(Float, nullable=False, default=0.0)
    delivered_quantity = Column(Float, nullable=False, default=0.0)
    unit = Column(String(50), nullable=False, default="Units") # Tons, Bags, Cu.m, Meters, Units
    supplier = Column(String(255), nullable=False)
    expected_delivery_date = Column(String(50), nullable=False)
    actual_delivery_date = Column(String(50), nullable=True)
    cost = Column(Float, nullable=False, default=0.0) # in ₹
    status = Column(String(50), nullable=False, default="Pending") # Pending, Ordered, Partially Delivered, Delivered, Delayed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="materials")


class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    name = Column(String(255), nullable=False)
    type = Column(String(100), nullable=False) # Labour, Engineers, Supervisors, Vehicles, Machines, Equipment
    availability = Column(String(50), nullable=False, default="Available") # Available, Assigned, Maintenance, Shortage
    utilization = Column(Float, nullable=False, default=0.0) # %
    cost_per_day = Column(Float, nullable=False, default=0.0) # in ₹
    status = Column(String(50), nullable=False, default="Normal") # Normal, Overutilized, Underutilized, Maintenance
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="resources")


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    risk_score = Column(Float, nullable=False, default=0.0) # 0 to 100
    risk_level = Column(String(50), nullable=False, default="Low") # Low, Medium, High, Critical
    schedule_risk_points = Column(Float, nullable=False, default=0.0)
    budget_risk_points = Column(Float, nullable=False, default=0.0)
    material_risk_points = Column(Float, nullable=False, default=0.0)
    resource_risk_points = Column(Float, nullable=False, default=0.0)
    reasons = Column(JSON, nullable=False, default=list) # List[str]
    root_cause_analysis = Column(JSON, nullable=False, default=list) # List[Dict] {issue, cause, impact, suggested_action}
    assessed_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="risk_assessments")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    category = Column(String(100), nullable=False) # Budget Overrun, Project Delay, Material Shortage, Resource Shortage, Equipment Downtime
    severity = Column(String(50), nullable=False, default="Medium") # Low, Medium, High, Critical
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="alerts")


class ProgressHistory(Base):
    __tablename__ = "progress_history"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    recorded_date = Column(String(50), nullable=False)
    planned_progress = Column(Float, nullable=False)
    actual_progress = Column(Float, nullable=False)
    notes = Column(String(255), nullable=True)

    project = relationship("Project", back_populates="progress_history")


class CostHistory(Base):
    __tablename__ = "cost_history"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    recorded_date = Column(String(50), nullable=False)
    budget = Column(Float, nullable=False)
    actual_cost = Column(Float, nullable=False)
    notes = Column(String(255), nullable=True)

    project = relationship("Project", back_populates="cost_history")
