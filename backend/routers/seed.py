from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import models, crud
from database import get_db, engine, Base
import datetime

router = APIRouter(prefix="/api/seed", tags=["Seed"])

@router.post("")
def seed_database(db: Session = Depends(get_db)):
    """Wipes and seeds the database with realistic Indian construction projects and risk data."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    # 1. Mumbai Metro Line 4 Extension
    p1 = models.Project(
        name="Mumbai Metro Line 4 Extension",
        client_name="MMRDA (Mumbai Metropolitan Region Development Authority)",
        location="Wadala to Thane, Mumbai",
        start_date="2024-01-15",
        end_date="2026-12-31",
        budget=7500000000.0, # ₹750 Cr
        current_cost=6900000000.0, # ₹690 Cr (92% spent)
        planned_progress=78.0,
        actual_progress=59.5, # 18.5% lag
        status="In Progress",
        manager="Rajesh Sharma",
        description="Construction of elevated metro corridor spanning 32km with 30 stations including viaducts, depot foundation, and traction sub-stations."
    )

    # 2. Bengaluru Tech Park Commercial Tower
    p2 = models.Project(
        name="Bengaluru Tech Park Commercial Tower",
        client_name="Prestige Estates Projects Ltd",
        location="Outer Ring Road, Bengaluru",
        start_date="2024-06-01",
        end_date="2026-08-30",
        budget=1200000000.0, # ₹120 Cr
        current_cost=1140000000.0, # ₹114 Cr (95% spent)
        planned_progress=82.0,
        actual_progress=76.0, # 6% lag
        status="In Progress",
        manager="Priya Nair",
        description="Grade-A commercial office space comprising 24 floors with LEED Platinum certification, composite steel structure, and automated HVAC systems."
    )

    # 3. Delhi-Gurugram Expressway Flyover
    p3 = models.Project(
        name="Delhi-Gurugram Expressway Flyover",
        client_name="NHAI (National Highways Authority of India)",
        location="NH-48 Corridor, Gurugram",
        start_date="2023-11-10",
        end_date="2025-10-30",
        budget=4500000000.0, # ₹450 Cr
        current_cost=3800000000.0, # ₹380 Cr (84% spent)
        planned_progress=90.0,
        actual_progress=92.0, # Ahead of schedule
        status="In Progress",
        manager="Vikram Singh",
        description="6-lane elevated highway flyover with pre-stressed concrete girders, noise barriers, and integrated intelligent traffic control systems."
    )

    # 4. Hyderabad High-Rise Residential Complex
    p4 = models.Project(
        name="Hyderabad High-Rise Residential Complex",
        client_name="My Home Constructions",
        location="Gachibowli, Hyderabad",
        start_date="2024-03-15",
        end_date="2027-02-28",
        budget=850000000.0, # ₹85 Cr
        current_cost=790000000.0, # ₹79 Cr (93% spent)
        planned_progress=65.0,
        actual_progress=44.0, # 21% lag
        status="In Progress",
        manager="Anil Kumar",
        description="Premium residential towers comprising 4 blocks of 32 stories each, underground parking structure, and sports clubhouse facilities."
    )

    # 5. Gujarat Renewable Energy Industrial Plant
    p5 = models.Project(
        name="Gujarat Renewable Energy Industrial Plant",
        client_name="Adani Green Energy Ltd",
        location="Khavda, Kutch, Gujarat",
        start_date="2024-02-01",
        end_date="2026-06-30",
        budget=2100000000.0, # ₹210 Cr
        current_cost=1450000000.0, # ₹145 Cr (69% spent)
        planned_progress=70.0,
        actual_progress=72.5, # Ahead of schedule
        status="In Progress",
        manager="Suresh Patel",
        description="Utility-scale solar module manufacturing facility and sub-station switchyard infrastructure."
    )

    db.add_all([p1, p2, p3, p4, p5])
    db.commit()

    for p in [p1, p2, p3, p4, p5]:
        db.refresh(p)

    # --- Seed Materials ---
    materials = [
        # Mumbai Metro
        models.Material(
            project_id=p1.id,
            name="Fe-550D TMT Reinforcement Steel",
            category="Steel",
            required_quantity=12000.0,
            ordered_quantity=12000.0,
            delivered_quantity=8500.0,
            unit="Tons",
            supplier="Tata Steel Infrastructure",
            expected_delivery_date="2026-09-15",
            actual_delivery_date=None,
            cost=68000000.0, # ₹6.8 Cr
            status="Delayed"
        ),
        models.Material(
            project_id=p1.id,
            name="OPC 53 Grade Cement",
            category="Cement",
            required_quantity=45000.0,
            ordered_quantity=45000.0,
            delivered_quantity=40000.0,
            unit="Bags",
            supplier="UltraTech Cement Ltd",
            expected_delivery_date="2026-09-28",
            actual_delivery_date="2026-09-30",
            cost=18000000.0,
            status="Delivered"
        ),
        models.Material(
            project_id=p1.id,
            name="Pre-stressed Concrete Viaduct Girders",
            category="Precast",
            required_quantity=480.0,
            ordered_quantity=480.0,
            delivered_quantity=310.0,
            unit="Units",
            supplier="L&T Heavy Engineering",
            expected_delivery_date="2026-09-10",
            actual_delivery_date=None,
            cost=140000000.0,
            status="Delayed"
        ),

        # Bengaluru Tech Park
        models.Material(
            project_id=p2.id,
            name="Structural Steel Beams (ISMB 600)",
            category="Steel",
            required_quantity=3500.0,
            ordered_quantity=3500.0,
            delivered_quantity=3200.0,
            unit="Tons",
            supplier="JSW Steel Co",
            expected_delivery_date="2026-09-20",
            actual_delivery_date="2026-09-22",
            cost=24500000.0,
            status="Delivered"
        ),
        models.Material(
            project_id=p2.id,
            name="Double-Glazed Curtain Wall Glass Panels",
            category="Finishing",
            required_quantity=8500.0,
            ordered_quantity=8500.0,
            delivered_quantity=5100.0,
            unit="Meters",
            supplier="Saint-Gobain India",
            expected_delivery_date="2026-09-05",
            actual_delivery_date=None,
            cost=32000000.0,
            status="Delayed"
        ),

        # Delhi Flyover
        models.Material(
            project_id=p3.id,
            name="Bituminous Concrete Asphalt",
            category="Aggregates",
            required_quantity=28000.0,
            ordered_quantity=28000.0,
            delivered_quantity=26500.0,
            unit="Tons",
            supplier="IRC Highway Infra",
            expected_delivery_date="2026-10-01",
            actual_delivery_date="2026-10-01",
            cost=42000000.0,
            status="Delivered"
        ),

        # Hyderabad Residential
        models.Material(
            project_id=p4.id,
            name="Ready-Mix Concrete M40 Grade",
            category="Cement",
            required_quantity=18000.0,
            ordered_quantity=18000.0,
            delivered_quantity=11000.0,
            unit="Cu.m",
            supplier="Aparna RMC Infra",
            expected_delivery_date="2026-09-12",
            actual_delivery_date=None,
            cost=54000000.0,
            status="Delayed"
        )
    ]

    db.add_all(materials)
    db.commit()

    # --- Seed Resources ---
    resources = [
        models.Resource(
            project_id=p1.id,
            name="Viaduct Pier Erection Gang A",
            type="Labour",
            availability="Assigned",
            utilization=115.0, # Overutilized
            cost_per_day=45000.0,
            status="Overutilized",
            notes="Working double shifts to make up for viaduct girder delivery delays."
        ),
        models.Resource(
            project_id=p1.id,
            name="150-Ton Crawler Crane #04",
            type="Machines",
            availability="Maintenance",
            utilization=0.0,
            cost_per_day=120000.0,
            status="Maintenance",
            notes="Hydraulic boom pump failure. Under servicing."
        ),
        models.Resource(
            project_id=p1.id,
            name="Senior Structural Bridge Engineer",
            type="Engineers",
            availability="Assigned",
            utilization=90.0,
            cost_per_day=15000.0,
            status="Normal",
            notes="Overseeing pier load testing."
        ),

        # Bengaluru Tech Park
        models.Resource(
            project_id=p2.id,
            name="High-Rise Tower Crane #01",
            type="Equipment",
            availability="Assigned",
            utilization=98.0,
            cost_per_day=85000.0,
            status="Normal",
            notes="Operating at optimum lift capacity."
        ),
        models.Resource(
            project_id=p2.id,
            name="MEP Installation Specialists",
            type="Labour",
            availability="Shortage",
            utilization=105.0,
            cost_per_day=38000.0,
            status="Overutilized",
            notes="Shortage of certified HVAC duct technicians."
        ),

        # Hyderabad Residential
        models.Resource(
            project_id=p4.id,
            name="Concrete Boom Placer Unit #02",
            type="Machines",
            availability="Maintenance",
            utilization=0.0,
            cost_per_day=95000.0,
            status="Maintenance",
            notes="Piston valve breakdown halting upper floor pouring."
        ),
        models.Resource(
            project_id=p4.id,
            name="Site Safety Officers",
            type="Supervisors",
            availability="Assigned",
            utilization=85.0,
            cost_per_day=12000.0,
            status="Normal",
            notes="Conducting daily scaffolding risk checks."
        )
    ]

    db.add_all(resources)
    db.commit()

    # Trigger risk calculations for all projects
    for p in [p1, p2, p3, p4, p5]:
        crud.recalculate_and_save_project_risk(db, p)

    return {"message": "Database successfully seeded with realistic Indian construction data!", "project_count": 5}
