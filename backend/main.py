import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, SessionLocal
import models
from routers import projects, materials, resources, risk, analytics, alerts, seed
from routers.seed import seed_database

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Nirman360 - Construction Risk Intelligence API",
    description="Backend API powering construction risk assessment, procurement analytics, and resource management.",
    version="1.0.0"
)

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for dev environment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(projects.router)
app.include_router(materials.router)
app.include_router(resources.router)
app.include_router(risk.router)
app.include_router(analytics.router)
app.include_router(alerts.router)
app.include_router(seed.router)

@app.on_event("startup")
def startup_event():
    """Seed database on first startup if empty."""
    db = SessionLocal()
    try:
        count = db.query(models.Project).count()
        if count == 0:
            seed_database(db)
    except Exception as e:
        print(f"Startup seed error: {e}")
    finally:
        db.close()

@app.get("/")
def read_root():
    return {
        "status": "online",
        "system": "Nirman360 Construction Risk Intelligence Platform API",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "nirman360-backend"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
