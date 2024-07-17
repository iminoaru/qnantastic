from fastapi import APIRouter, HTTPException, Request, Body
from QuantLab_Backend.supabase_client import supabase
from QuantLab_Backend.app.middleware import auth_required
from pydantic import BaseModel
import logging
router = APIRouter()


@router.get("/")
async def get_all_playlists(request: Request):
    
    res = supabase.table("playlists").select("*").execute()
    return res.data


@router.get("/{playlist_id}")
async def get_playlist_by_id(request: Request, playlist_id: str):
    res = supabase.table("playlists").select("*").eq("playlist_id", playlist_id).execute()
    
    if not res.data:
        raise HTTPException(status_code=404, detail="Playlist not found")
    print(res.data[0])
    return res.data[0]


@router.get("/users-playlists")
@auth_required
async def get_users_playlists(request: Request, user_id: str):
    
    res = supabase.table("playlists").select("*").eq("user_id", user_id).execute()
    return res.data


class PlaylistCreate(BaseModel):
    user_id: str
    name: str
    description: str = None
    
@router.post("/create")
@auth_required
async def create_playlist(request: Request, playlist: PlaylistCreate = Body(...)):
    try:
        res = (supabase.table("playlists")
        .insert([{"user_id": playlist.user_id, "name": playlist.name, "description": playlist.description}])
        .execute())
        
        res2 = supabase.table("userplaylists").insert([{"user_id": playlist.user_id, "playlist_id": res.data[0]["playlist_id"]}]).execute()
        return {"playlist": res.data, "userplaylist": res2.data}
    except Exception as e:
        logging.error(f"Error creating playlist: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


class Problem(BaseModel):
    playlist_id: str
    problem_id: str

@router.post("/add-problem")
@auth_required
async def add_problem_to_playlist(request: Request, problem: Problem = Body(...)):
    
    isAlreadyInPlaylist = supabase.table("playlistproblems").select("*").eq("playlist_id", problem.playlist_id).eq("problem_id", problem.problem_id).execute()
    if len(isAlreadyInPlaylist.data) > 0:
        return {"message": "Problem already in playlist" , "status": "duplicate" }
    
    res = (supabase.table("playlistproblems")
    .insert([{"playlist_id": problem.playlist_id, "problem_id": problem.problem_id}])
    .execute())
    
    # supabase.table("playlists").update({"total_problems": supabase.raw("total_problems + 1")}).eq("playlist_id", problem.playlist_id).execute()
    return res.data


@router.get("/get-problems/{playlist_id}")
async def get_problems_in_playlist(request: Request, playlist_id: str):
    res = (supabase.table("playlistproblems")
    .select("problems!inner(problem_id, name, difficulty, category, company, hints, is_paid)")
    .eq("playlist_id", playlist_id)
    .execute())
    
    print(res.data)
    return res.data


@router.delete("/{playlist_id}/problems/{problem_id}")
@auth_required
async def remove_problem_from_playlist(request: Request, playlist_id: str, problem_id: str):
    res = supabase.table("playlistproblems").delete().eq("playlist_id", playlist_id).eq("problem_id", problem_id).execute()
    return res.data