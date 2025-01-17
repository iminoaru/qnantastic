from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from QuantLab_Backend.app.routers import user
from QuantLab_Backend.app.routers import problem
from QuantLab_Backend.app.routers import userproblems
from QuantLab_Backend.app.routers import playlist

from QuantLab_Backend.supabase_client import supabase
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user.router, prefix="/users", tags=["users"])
app.include_router(problem.router, prefix="/problems", tags=["problems"])
app.include_router(userproblems.router, prefix="/userproblems", tags=["userproblems"])
app.include_router(playlist.router, prefix="/playlists", tags=["playlists"])

@app.get("/")
def read_root():
    response = supabase.table("problems").select("*").execute()
    return response.data
