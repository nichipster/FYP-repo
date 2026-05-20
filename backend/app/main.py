from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import auth, public
from app.routers.admin import dashboard, faqs, meals, me, plans, settings as admin_settings, team, testimonials

app = FastAPI(title="NutriTrack Website API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.admin_cors_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(public.router)
app.include_router(me.router)
app.include_router(dashboard.router)
app.include_router(faqs.router)
app.include_router(plans.router)
app.include_router(testimonials.router)
app.include_router(team.router)
app.include_router(meals.router)
app.include_router(admin_settings.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
