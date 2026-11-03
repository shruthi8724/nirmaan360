from datetime import datetime
from typing import List, Dict, Tuple, Any

def calculate_material_delay_days(expected_date_str: str, actual_date_str: str = None) -> int:
    """Calculates delay in days based on expected vs actual or current date."""
    try:
        expected = datetime.strptime(expected_date_str, "%Y-%m-%d")
        if actual_date_str:
            actual = datetime.strptime(actual_date_str, "%Y-%m-%d")
            diff = (actual - expected).days
            return max(0, diff)
        else:
            today = datetime.now()
            if today > expected:
                return (today - expected).days
            return 0
    except Exception:
        return 0

def evaluate_project_risk(project, materials: List[Any], resources: List[Any]) -> Dict[str, Any]:
    """
    Evaluates project risk score (0-100), risk level, factor point breakdown,
    explainable reasons, and Root Cause Analysis (RCA).
    """
    schedule_pts = 0.0
    budget_pts = 0.0
    material_pts = 0.0
    resource_pts = 0.0

    reasons: List[str] = []
    rca_list: List[Dict[str, str]] = []

    # 1. Schedule Variance / Progress Deviation
    planned = project.planned_progress or 0.0
    actual = project.actual_progress or 0.0
    progress_deviation = planned - actual

    if progress_deviation > 20.0:
        schedule_pts = 25.0
        reasons.append(f"Project is severely delayed ({progress_deviation:.1f}% behind schedule)")
        rca_list.append({
            "issue": "Severe Schedule Slippage",
            "cause": f"Actual progress ({actual:.1f}%) significantly lags behind planned target ({planned:.1f}%)",
            "impact": "Milestones missed, delayed project handover, potential contractual penalty clause triggers",
            "suggested_action": "Implement overtime work shifts, fast-track critical path activities, and re-allocate additional site engineers."
        })
    elif progress_deviation > 15.0:
        schedule_pts = 20.0
        reasons.append(f"Project is {progress_deviation:.1f}% behind planned schedule")
        rca_list.append({
            "issue": "Schedule Slippage",
            "cause": f"Execution velocity below requirement by {progress_deviation:.1f}%",
            "impact": "Completion target at risk of slipping into next quarter",
            "suggested_action": "Review site productivity logs, clear operational bottlenecks, and add specialized subcontractor crews."
        })
    elif progress_deviation > 10.0:
        schedule_pts = 12.0
        reasons.append(f"Moderate progress lag ({progress_deviation:.1f}% behind schedule)")
    elif progress_deviation > 5.0:
        schedule_pts = 5.0
        reasons.append(f"Minor progress lag ({progress_deviation:.1f}% behind target)")

    # 2. Budget Overrun & Utilization
    budget = project.budget or 1.0
    current_cost = project.current_cost or 0.0
    budget_utilization = (current_cost / budget) * 100.0 if budget > 0 else 0.0

    if budget_utilization > 105.0:
        budget_pts = 35.0
        reasons.append(f"Critical budget overrun (Consumed {budget_utilization:.1f}% of allocated budget)")
        rca_list.append({
            "issue": "Critical Cost Overrun",
            "cause": f"Project expenditure (₹{current_cost:,.0f}) has exceeded approved budget (₹{budget:,.0f})",
            "impact": "Cash flow deficit, unapproved financial variance, risk of project halt",
            "suggested_action": "Initiate formal financial audit, freeze non-essential procurement, and request variation order authorization."
        })
    elif budget_utilization > 100.0:
        budget_pts = 30.0
        reasons.append(f"Budget exceeded (Consumed {budget_utilization:.1f}% of total budget)")
        rca_list.append({
            "issue": "Budget Overrun",
            "cause": f"Unforeseen material price inflation or scope creep push cost to ₹{current_cost:,.0f}",
            "impact": "Erosion of profit margin and budget contingency exhaustion",
            "suggested_action": "Value engineer remaining project phases and renegotiate bulk supply rates."
        })
    elif budget_utilization > 90.0:
        budget_pts = 20.0
        reasons.append(f"High budget utilization (Consumed {budget_utilization:.1f}% of allocated funds)")
        rca_list.append({
            "issue": "Near Budget Exhaustion",
            "cause": f"Budget consumed ({budget_utilization:.1f}%) is disproportionate to actual progress ({actual:.1f}%)",
            "impact": "Risk of running out of capital before project completion",
            "suggested_action": "Strict daily expenditure cap and tight approval matrix on equipment rental."
        })
    elif budget_utilization > 85.0:
        budget_pts = 10.0
        reasons.append(f"Budget utilization approaching warning threshold ({budget_utilization:.1f}%)")

    # 3. Material Supply Delays
    max_delay = 0
    delayed_materials: List[str] = []
    for mat in materials:
        delay = calculate_material_delay_days(mat.expected_delivery_date, mat.actual_delivery_date)
        if delay > max_delay:
            max_delay = delay
        if delay > 0 or mat.status == "Delayed":
            delayed_materials.append(f"{mat.name} ({mat.supplier}): {delay} days late")

    if max_delay > 10:
        material_pts = 25.0
        reasons.append(f"Severe material delay detected (Up to {max_delay} days late)")
        rca_list.append({
            "issue": "Severe Procurement Delay",
            "cause": f"Primary supplier delivery failure for key materials ({', '.join([m.name for m in materials if calculate_material_delay_days(m.expected_delivery_date, m.actual_delivery_date) > 5][:2])})",
            "impact": "Downstream structural work completely stalled, idle workforce costs mounting",
            "suggested_action": "Activate backup localized vendor contract immediately and request expedited freight dispatch."
        })
    elif max_delay > 5:
        material_pts = 15.0
        reasons.append(f"Material supply delayed by up to {max_delay} days")
        rca_list.append({
            "issue": "Material Supply Delay",
            "cause": f"Supply chain disruption or vendor dispatch backlog",
            "impact": "Site work sequence interrupted, potential sub-contractor delay claims",
            "suggested_action": "Escalate to tier-1 vendor management and request guaranteed revised delivery schedule."
        })
    elif max_delay > 2:
        material_pts = 8.0
        reasons.append(f"Minor material delivery delays ({max_delay} days late)")

    # 4. Resource Allocation & Bottlenecks
    overutilized_resources = [r for r in resources if r.utilization > 100.0]
    maintenance_resources = [r for r in resources if r.status == "Maintenance" or r.availability == "Maintenance"]
    shortage_resources = [r for r in resources if r.availability == "Shortage"]

    if overutilized_resources:
        resource_pts += 15.0
        r_names = ", ".join([r.name for r in overutilized_resources[:2]])
        reasons.append(f"Resource overutilization detected on {r_names}")
        rca_list.append({
            "issue": "Resource Overutilization",
            "cause": f"Resources ({r_names}) operating above 100% rated capacity",
            "impact": "Worker fatigue, safety compliance risk, and accelerated machinery wear and tear",
            "suggested_action": "Deploy additional personnel shifts and rebalance workload across available project clusters."
        })

    if maintenance_resources:
        resource_pts += 15.0
        m_names = ", ".join([r.name for r in maintenance_resources[:2]])
        reasons.append(f"Equipment downtime / maintenance block on {m_names}")
        rca_list.append({
            "issue": "Equipment Downtime",
            "cause": f"Unscheduled breakdown or mandatory servicing of critical equipment ({m_names})",
            "impact": "Heavy earthmoving or concrete lifting operations halted",
            "suggested_action": "Source temporary heavy machinery rental units to prevent work stagnation."
        })

    if shortage_resources:
        resource_pts += 10.0
        reasons.append(f"Resource shortage reported for {len(shortage_resources)} allocation units")

    # Sum total risk score capped at 100
    total_score = min(100.0, schedule_pts + budget_pts + material_pts + resource_pts)

    # Classify Risk Level
    if total_score >= 76.0:
        level = "Critical"
    elif total_score >= 51.0:
        level = "High"
    elif total_score >= 26.0:
        level = "Medium"
    else:
        level = "Low"

    if not reasons:
        reasons.append("Project operating within normal parameters with low overall risk.")

    return {
        "risk_score": round(total_score, 1),
        "risk_level": level,
        "schedule_risk_points": round(schedule_pts, 1),
        "budget_risk_points": round(budget_pts, 1),
        "material_risk_points": round(material_pts, 1),
        "resource_risk_points": round(resource_pts, 1),
        "reasons": reasons,
        "root_cause_analysis": rca_list
    }
