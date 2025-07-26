/**
 * @file AuthDebug.tsx
 * @description Debug component to show authentication and playlist loading state
 */

import React from 'react'
import { useSpotifyAuth } from '@hooks/auth/useSpotifyAuth'
import { usePlaylistTools } from '@hooks/data/usePlaylistTools'
import { SpotifyApi } from 'spotify-api-lib'
import { WireframePanel } from '@components/wireframe'

export const AuthDebug: React.FC = () => {
  const { accessToken, user, loading: authLoading, error: authError } = useSpotifyAuth()
  
  const spotifyApi = React.useMemo(() => {
    return accessToken ? new SpotifyApi(accessToken) : null
  }, [accessToken])

  const { 
    playlists, 
    loading: playlistLoading, 
    loadError: playlistError 
  } = usePlaylistTools(spotifyApi, user)

  return (
    <WireframePanel title="Auth & Playlist Debug" className="auth-debug">
      <div style={{ fontFamily: 'monospace', fontSize: '12px', lineHeight: '1.4' }}>
        <div><strong>Auth State:</strong></div>
        <div>• Access Token: {accessToken ? `${accessToken.substring(0, 20)}...` : 'null'}</div>
        <div>• User: {user ? user.display_name || user.id : 'null'}</div>
        <div>• Auth Loading: {authLoading ? 'true' : 'false'}</div>
        <div>• Auth Error: {authError || 'none'}</div>
        
        <div style={{ marginTop: '10px' }}><strong>Spotify API:</strong></div>
        <div>• API Instance: {spotifyApi ? 'initialized' : 'null'}</div>
        
        <div style={{ marginTop: '10px' }}><strong>Playlist State:</strong></div>
        <div>• Playlists Count: {playlists?.length || 0}</div>
        <div>• Playlist Loading: {playlistLoading ? 'true' : 'false'}</div>
        <div>• Playlist Error: {playlistError || 'none'}</div>
        
        {playlists && playlists.length > 0 && (
          <div style={{ marginTop: '10px' }}>
            <strong>First 3 Playlists:</strong>
            {playlists.slice(0, 3).map((playlist, i) => (
              <div key={i}>• {playlist.name} ({playlist.tracks.total} tracks)</div>
            ))}
          </div>
        )}
      </div>
    </WireframePanel>
  )
}