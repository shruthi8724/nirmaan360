from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime

# --- Root Cause Analysis ---
class RootCauseItem(BaseModel):
    issue: str
    cause: str
    impact: str
    suggested_action: str

# --- Risk Assessment ---
class RiskAssessmentBase(BaseModel):
    risk_score: float
    risk_level: str
    schedule_risk_points: float
    budget_risk_points: float
    material_risk_points: float
    resource_risk_points: float
    reasons: List[str]
    root_cause_analysis: List[RootCauseItem]

class RiskAssessmentResponse(RiskAssessmentBase):
    id: int
    project_id: int
    assessed_at: datetime

    class Config:
        from_attributes = True

# --- Alert Schemas ---
class AlertBase(BaseModel):
    project_id: Optional[int] = None
    title: str
    message: str
    category: str
    severity: str
    is_read: bool = False

class AlertCreate(AlertBase):
    pass

class AlertResponse(AlertBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- Progress History ---
class ProgressHistoryBase(BaseModel):
    recorded_date: str
    planned_progress: float
    actual_progress: float
    notes: Optional[str] = None

class ProgressHistoryResponse(ProgressHistoryBase):
    id: int
    project_id: int

    class Config:
        from_attributes = True

# --- Cost History ---
class CostHistoryBase(BaseModel):
    recorded_date: str
    budget: float
    actual_cost: float
    notes: Optional[str] = None

class CostHistoryResponse(CostHistoryBase):
    id: int
    project_id: int

    class Config:
        from_attributes = True

# --- Material Schemas ---
class MaterialBase(BaseModel):
    name: str
    category: str
    required_quantity: float
    ordered_quantity: float = 0.0
    delivered_quantity: float = 0.0
    unit: str = "Units"
    supplier: str
    expected_delivery_date: str
    actual_delivery_date: Optional[str] = None
    cost: float = 0.0
    status: str = "Pending"

class MaterialCreate(MaterialBase):
    project_id: int

class MaterialUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    required_quantity: Optional[float] = None
    ordered_quantity: Optional[float] = None
    delivered_quantity: Optional[float] = None
    unit: Optional[str] = None
    supplier: Optional[str] = None
    expected_delivery_date: Optional[str] = None
    actual_delivery_date: Optional[str] = None
    cost: Optional[float] = None
    status: Optional[str] = None
    project_id: Optional[int] = None

class MaterialResponse(MaterialBase):
    id: int
    project_id: int
    created_at: datetime
    # Calculated properties
    pending_quantity: float = 0.0
    delivery_completion_pct: float = 0.0
    material_delay_days: int = 0
    material_risk: str = "Low"

    class Config:
        from_attributes = True

# --- Resource Schemas ---
class ResourceBase(BaseModel):
    name: str
    type: str
    availability: str = "Available"
    utilization: float = 0.0
    cost_per_day: float = 0.0
    status: str = "Normal"
    notes: Optional[str] = None

class ResourceCreate(ResourceBase):
    project_id: Optional[int] = None

class ResourceUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    availability: Optional[str] = None
    utilization: Optional[float] = None
    cost_per_day: Optional[float] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    project_id: Optional[int] = None

class ResourceResponse(ResourceBase):
    id: int
    project_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- Project Schemas ---
class ProjectBase(BaseModel):
    name: str
    client_name: str
    location: str
    start_date: str
    end_date: str
    budget: float
    current_cost: float = 0.0
    planned_progress: float = 0.0
    actual_progress: float = 0.0
    status: str = "Planning"
    manager: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    client_name: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    budget: Optional[float] = None
    current_cost: Optional[float] = None
    planned_progress: Optional[float] = None
    actual_progress: Optional[float] = None
    status: Optional[str] = None
    manager: Optional[str] = None
    description: Optional[str] = None

class ProjectResponse(ProjectBase):
    id: int
    created_at: datetime
    updated_at: datetime
    # Dynamically calculated risk info
    risk_score: float = 0.0
    risk_level: str = "Low"
    budget_utilization_pct: float = 0.0
    delay_days: int = 0
    latest_assessment: Optional[RiskAssessmentResponse] = None

    class Config:
        from_attributes = True

class ProjectDetailResponse(ProjectResponse):
    materials: List[MaterialResponse] = []
    resources: List[ResourceResponse] = []
    progress_history: List[ProgressHistoryResponse] = []
    cost_history: List[CostHistoryResponse] = []
    alerts: List[AlertResponse] = []

# --- Dashboard & Analytics Responses ---
class DashboardSummary(BaseModel):
    total_projects: int
    active_projects: int
    completed_projects: int
    at_risk_projects: int
    average_progress_pct: float
    total_budget: float
    budget_utilization_pct: float
    delayed_projects: int

class RiskDistributionItem(BaseModel):
    level: str
    count: int
    color: str

class MonthlyPerformanceItem(BaseModel):
    month: str
    planned: float
    actual: float
    cost_spent: float

class AnalyticsOverview(BaseModel):
    top_risky_projects: List[ProjectResponse]
    budget_overruns: List[Dict[str, Any]]
    project_progress_ranking: List[Dict[str, Any]]
    material_delay_trends: List[Dict[str, Any]]
    resource_utilization_trends: List[Dict[str, Any]]
    monthly_performance: List[MonthlyPerformanceItem]
    schedule_variance_metrics: Dict[str, Any]
    cost_variance_metrics: Dict[str, Any]
