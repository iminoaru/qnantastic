'use client'

import PlaylistProblemTable from '@/components/playlists/PlaylistProblemTable';
import { useParams} from 'next/navigation';

export default function Page() {

    const { id: playlist_id } = useParams(); 

    return (
        <PlaylistProblemTable playlistId={playlist_id.toString()} />
    )
}