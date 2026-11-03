export interface RootCauseItem {
  issue: string;
  cause: string;
  impact: string;
  suggested_action: string;
}

export interface RiskAssessment {
  id: number;
  project_id: number;
  risk_score: number;
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  schedule_risk_points: number;
  budget_risk_points: number;
  material_risk_points: number;
  resource_risk_points: number;
  reasons: string[];
  root_cause_analysis: RootCauseItem[];
  assessed_at: string;
}

export interface Alert {
  id: number;
  project_id?: number;
  title: string;
  message: string;
  category: 'Budget Overrun' | 'Project Delay' | 'Material Shortage' | 'Resource Shortage' | 'Equipment Downtime';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  is_read: boolean;
  created_at: string;
}

export interface Material {
  id: number;
  project_id: number;
  name: string;
  category: string;
  required_quantity: number;
  ordered_quantity: number;
  delivered_quantity: number;
  pending_quantity: number;
  delivery_completion_pct: number;
  unit: string;
  supplier: string;
  expected_delivery_date: string;
  actual_delivery_date?: string | null;
  cost: number;
  status: 'Pending' | 'Ordered' | 'Partially Delivered' | 'Delivered' | 'Delayed';
  material_delay_days: number;
  material_risk: 'Low' | 'Medium' | 'High' | 'Critical';
  created_at: string;
}

export interface Resource {
  id: number;
  project_id?: number | null;
  name: string;
  type: 'Labour' | 'Engineers' | 'Supervisors' | 'Vehicles' | 'Machines' | 'Equipment';
  availability: 'Available' | 'Assigned' | 'Maintenance' | 'Shortage';
  utilization: number;
  cost_per_day: number;
  status: 'Normal' | 'Overutilized' | 'Underutilized' | 'Maintenance';
  notes?: string | null;
  created_at: string;
}

export interface ProgressHistory {
  id: number;
  project_id: number;
  recorded_date: string;
  planned_progress: number;
  actual_progress: number;
  notes?: string | null;
}

export interface CostHistory {
  id: number;
  project_id: number;
  recorded_date: string;
  budget: number;
  actual_cost: number;
  notes?: string | null;
}

export interface Project {
  id: number;
  name: string;
  client_name: string;
  location: string;
  start_date: string;
  end_date: string;
  budget: number;
  current_cost: number;
  planned_progress: number;
  actual_progress: number;
  status: 'Planning' | 'In Progress' | 'On Hold' | 'Completed';
  manager: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
  risk_score: number;
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  budget_utilization_pct: number;
  delay_days: number;
  latest_assessment?: RiskAssessment | null;
}

export interface ProjectDetail extends Project {
  materials: Material[];
  resources: Resource[];
  progress_history: ProgressHistory[];
  cost_history: CostHistory[];
  alerts: Alert[];
}

export interface DashboardSummary {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  at_risk_projects: number;
  average_progress_pct: number;
  total_budget: number;
  budget_utilization_pct: number;
  delayed_projects: number;
}

export interface ChartData {
  progress_chart: Array<{ name: string; full_name: string; planned: number; actual: number }>;
  risk_chart: Array<{ level: string; count: number; color: string }>;
  budget_chart: Array<{ name: string; full_name: string; budget: number; current_cost: number; utilization_pct: number }>;
  monthly_chart: Array<{ month: string; planned: number; actual: number; cost_spent: number }>;
}

export interface AnalyticsOverview {
  top_risky_projects: Project[];
  budget_overruns: Array<{ id: number; name: string; budget: number; current_cost: number; variance: number; utilization_pct: number }>;
  project_progress_ranking: Array<{ id: number; name: string; planned_progress: number; actual_progress: number; slippage: number }>;
  material_delay_trends: Array<{ supplier: string; avg_delay_days: number; max_delay_days: number; total_items: number }>;
  resource_utilization_trends: Array<{ id: number; name: string; type: string; utilization: number; status: string; cost_per_day: number }>;
  schedule_variance_metrics: { spi: number; status: string; earned_value: number; planned_value: number };
  cost_variance_metrics: { cpi: number; status: string; actual_cost: number; cost_variance: number };
}
