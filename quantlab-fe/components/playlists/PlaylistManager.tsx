import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useStore from '../../useStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';

interface Playlist {
  playlist_id: string;
  name: string;
  description: string;
  total_problems: number;
  user_id: string;
}

const PlaylistManager: React.FC<{ problemId: string, onClose: () => void }> = ({ problemId, onClose }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
  const [isCreatingPlaylist, setIsCreatingPlaylist] = useState(false);
  const { userID, session } = useStore();

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const response = await axios.get<Playlist[]>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users-playlists`, {
        
        headers: { 'Authorization': `Bearer ${session}` },
        params: {user_id: userID}
      
      });
      
    } catch (error) {
      console.error('Error fetching playlists:', error);
    }
  };

  const createPlaylist = async () => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/playlists/create`, {
        user_id: userID,
        name: newPlaylistName,
        description: newPlaylistDescription
      }, {
        headers: { 'Authorization': `Bearer ${session}` }
      });
      setNewPlaylistName('');
      setNewPlaylistDescription('');
      setIsCreatingPlaylist(false);
      fetchPlaylists();
      console.log('Playlist created successfully:', response.data);
    } catch (error: any) {
      console.error('Error creating playlist:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        // Display error message to user
        alert(`Error creating playlist: ${error.response.data.detail}`);
      } else if (error.request) {
        console.error('Error request:', error.request);
        alert('Network error. Please try again.');
      } else {
        console.error('Error message:', error.message);
        alert('An unexpected error occurred. Please try again.');
      }
    }
  };

  const addToPlaylist = async (playlistId: string) => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/playlists/add-problem`, {
        
        playlist_id: playlistId,
        problem_id: problemId
      }, {
        headers: { 'Authorization': `Bearer ${session}` }
      });
      if(res.data.status === "duplicate"){
        alert("Problem already exists in the playlist")
        return;
      }
      onClose();
    } catch (error) {
      console.error('Error adding problem to playlist:', error);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Playlist</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {playlists.map((playlist) => (
            <Button 
              key={playlist.playlist_id} 
              onClick={() => addToPlaylist(playlist.playlist_id)} 
              className="w-full"
              disabled={playlist.user_id !== userID}
            >
              {playlist.name} ({playlist.total_problems} problems)
              {playlist.user_id !== userID && " (View Only)"}
            </Button>
          ))}
          {isCreatingPlaylist ? (
            <div className="space-y-2">
              <Input
                placeholder="Playlist Name"
                value={newPlaylistName}
                onChange={(e: any) => setNewPlaylistName(e.target.value)}
              />
              <Input
                placeholder="Description (optional)"
                value={newPlaylistDescription}
                onChange={(e: any) => setNewPlaylistDescription(e.target.value)}
              />
              <Button onClick={createPlaylist}>Create Playlist</Button>
            </div>
          ) : (
            <Button onClick={() => setIsCreatingPlaylist(true)}>Create New Playlist</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlaylistManager;