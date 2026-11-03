from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import crud, models, schemas
from database import get_db
from risk_engine import calculate_material_delay_days

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/dashboard-summary", response_model=schemas.DashboardSummary)
def get_dashboard_summary(db: Session = Depends(get_db)):
    projects = crud.get_projects(db)

    total_projects = len(projects)
    active_projects = sum(1 for p in projects if p.status == "In Progress")
    completed_projects = sum(1 for p in projects if p.status == "Completed")

    total_budget = sum(p.budget for p in projects)
    total_cost = sum(p.current_cost for p in projects)
    budget_utilization_pct = (total_cost / total_budget * 100) if total_budget > 0 else 0.0

    avg_progress = (sum(p.actual_progress for p in projects) / total_projects) if total_projects > 0 else 0.0

    at_risk_count = 0
    delayed_count = 0

    for p in projects:
        latest_risk = crud.get_latest_risk_assessment(db, p.id)
        if latest_risk and latest_risk.risk_level in ["High", "Critical"]:
            at_risk_count += 1

        dev = p.planned_progress - p.actual_progress
        mats = db.query(models.Material).filter(models.Material.project_id == p.id).all()
        max_delay = max([calculate_material_delay_days(m.expected_delivery_date, m.actual_delivery_date) for m in mats], default=0)

        if dev > 5.0 or max_delay > 5:
            delayed_count += 1

    return schemas.DashboardSummary(
        total_projects=total_projects,
        active_projects=active_projects,
        completed_projects=completed_projects,
        at_risk_projects=at_risk_count,
        average_progress_pct=round(avg_progress, 1),
        total_budget=round(total_budget, 2),
        budget_utilization_pct=round(budget_utilization_pct, 1),
        delayed_projects=delayed_count
    )

@router.get("/charts")
def get_dashboard_charts(db: Session = Depends(get_db)):
    projects = crud.get_projects(db)

    # 1. Project Progress Chart data
    progress_chart = [
        {
            "name": p.name[:18] + ("..." if len(p.name) > 18 else ""),
            "full_name": p.name,
            "planned": round(p.planned_progress, 1),
            "actual": round(p.actual_progress, 1)
        }
        for p in projects
    ]

    # 2. Risk Distribution Chart data
    risk_counts = {"Low": 0, "Medium": 0, "High": 0, "Critical": 0}
    for p in projects:
        latest = crud.get_latest_risk_assessment(db, p.id)
        level = latest.risk_level if latest else "Low"
        risk_counts[level] = risk_counts.get(level, 0) + 1

    risk_chart = [
        {"level": "Low", "count": risk_counts["Low"], "color": "#10B981"},
        {"level": "Medium", "count": risk_counts["Medium"], "color": "#F59E0B"},
        {"level": "High", "count": risk_counts["High"], "color": "#F97316"},
        {"level": "Critical", "count": risk_counts["Critical"], "color": "#EF4444"}
    ]

    # 3. Budget Utilization Chart data
    budget_chart = [
        {
            "name": p.name[:18] + ("..." if len(p.name) > 18 else ""),
            "full_name": p.name,
            "budget": round(p.budget / 10000000, 2), # in Crores (Cr)
            "current_cost": round(p.current_cost / 10000000, 2), # in Crores (Cr)
            "utilization_pct": round((p.current_cost / p.budget * 100) if p.budget > 0 else 0, 1)
        }
        for p in projects
    ]

    # 4. Monthly Project Performance Chart
    monthly_chart = [
        {"month": "May 2026", "planned": 20.0, "actual": 18.5, "cost_spent": 12.5},
        {"month": "Jun 2026", "planned": 38.0, "actual": 34.0, "cost_spent": 28.0},
        {"month": "Jul 2026", "planned": 55.0, "actual": 48.0, "cost_spent": 46.5},
        {"month": "Aug 2026", "planned": 72.0, "actual": 61.5, "cost_spent": 65.0},
        {"month": "Sep 2026", "planned": 85.0, "actual": 71.0, "cost_spent": 82.0},
        {"month": "Oct 2026", "planned": 95.0, "actual": 79.5, "cost_spent": 94.5}
    ]

    return {
        "progress_chart": progress_chart,
        "risk_chart": risk_chart,
        "budget_chart": budget_chart,
        "monthly_chart": monthly_chart
    }

@router.get("/overview")
def get_analytics_overview(db: Session = Depends(get_db)):
    projects = crud.get_projects(db)
    materials = crud.get_materials(db)
    resources = crud.get_resources(db)

    # Top risky projects
    proj_responses = []
    for p in projects:
        latest = crud.get_latest_risk_assessment(db, p.id)
        resp = schemas.ProjectResponse.model_validate(p)
        resp.risk_score = latest.risk_score if latest else 0.0
        resp.risk_level = latest.risk_level if latest else "Low"
        resp.budget_utilization_pct = round((p.current_cost / p.budget * 100) if p.budget > 0 else 0, 1)
        resp.latest_assessment = latest
        proj_responses.append(resp)

    top_risky = sorted(proj_responses, key=lambda x: x.risk_score, reverse=True)[:5]

    # Budget overruns analysis
    budget_overruns = [
        {
            "id": p.id,
            "name": p.name,
            "budget": p.budget,
            "current_cost": p.current_cost,
            "variance": p.current_cost - p.budget,
            "utilization_pct": round((p.current_cost / p.budget * 100) if p.budget > 0 else 0, 1)
        }
        for p in projects
        if (p.current_cost / p.budget * 100 if p.budget > 0 else 0) > 85.0
    ]

    # Progress ranking
    progress_ranking = [
        {
            "id": p.id,
            "name": p.name,
            "planned_progress": p.planned_progress,
            "actual_progress": p.actual_progress,
            "slippage": round(p.planned_progress - p.actual_progress, 1)
        }
        for p in sorted(projects, key=lambda x: (x.planned_progress - x.actual_progress), reverse=True)
    ]

    # Material delay trends
    supplier_delays: Dict[str, List[int]] = {}
    for m in materials:
        delay = calculate_material_delay_days(m.expected_delivery_date, m.actual_delivery_date)
        if m.supplier not in supplier_delays:
            supplier_delays[m.supplier] = []
        supplier_delays[m.supplier].append(delay)

    material_delay_trends = [
        {
            "supplier": supp,
            "avg_delay_days": round(sum(delays) / len(delays), 1),
            "max_delay_days": max(delays),
            "total_items": len(delays)
        }
        for supp, delays in supplier_delays.items()
    ]

    # Resource utilization trends
    resource_utilization_trends = [
        {
            "id": r.id,
            "name": r.name,
            "type": r.type,
            "utilization": r.utilization,
            "status": r.status,
            "cost_per_day": r.cost_per_day
        }
        for r in resources
    ]

    # EVM Variance calculations (CPI and SPI)
    total_ev = sum((p.actual_progress / 100.0) * p.budget for p in projects)
    total_pv = sum((p.planned_progress / 100.0) * p.budget for p in projects)
    total_ac = sum(p.current_cost for p in projects)

    spi = round(total_ev / total_pv, 2) if total_pv > 0 else 1.0
    cpi = round(total_ev / total_ac, 2) if total_ac > 0 else 1.0

    return {
        "top_risky_projects": top_risky,
        "budget_overruns": budget_overruns,
        "project_progress_ranking": progress_ranking,
        "material_delay_trends": material_delay_trends,
        "resource_utilization_trends": resource_utilization_trends,
        "schedule_variance_metrics": {
            "spi": spi,
            "status": "Favorable" if spi >= 1.0 else "Behind Schedule",
            "earned_value": round(total_ev, 2),
            "planned_value": round(total_pv, 2)
        },
        "cost_variance_metrics": {
            "cpi": cpi,
            "status": "Under Budget" if cpi >= 1.0 else "Over Budget",
            "actual_cost": round(total_ac, 2),
            "cost_variance": round(total_ev - total_ac, 2)
        }
    }
