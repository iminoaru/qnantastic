'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import useStore from '../../useStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Playlist {
  playlist_id: string;
  user_id: string;
  name: string;
  description: string;
  total_problems: number;
}

const AllPlaylists: React.FC = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const { userID, session } = useStore();

  useEffect(() => {

    const fetchPlaylists = async () => {
      try {
        const response = await axios.get<Playlist[]>(`${process.env.NEXT_PUBLIC_BACKEND_URL}/playlists`, {
          headers: { 'Authorization': `Bearer ${session}` }
        });
        setPlaylists(response.data);
      } catch (error) {
        console.error('Error fetching playlists:', error);
      }
    };

    fetchPlaylists();
  }, [userID, session]);

  

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {playlists.map((playlist) => (
        <Card key={playlist.playlist_id}>
          <CardHeader>
            <CardTitle>{playlist.name}</CardTitle>
            <CardDescription>{playlist.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Total problems: {playlist.total_problems}</p>
            <p>{playlist.user_id === userID ? 'Created by you' : 'View only'}</p>
            <Link href={`/playlists/${playlist.playlist_id}`}>
              <Button>View Playlist</Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AllPlaylists;