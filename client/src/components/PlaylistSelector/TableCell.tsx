/**
 * @file TableCell.tsx
 * @description Table cell renderer for PlaylistSelector component
 * @author Caleb Price
 * @version 1.0.0
 * @date 2025-07-22
 */

import React from 'react'
import { HoverDisplay } from '../HoverDisplay'
import { WireframeCheckbox } from '../wireframe'
import { cleanDescription } from './playlistSelectorUtils'
import { TableHeaderConfig } from './tableHeaderUtils'
import type { BaseItem, PlaylistItem, AlbumItem } from 'types/playlist'

interface TableCellProps {
  header: TableHeaderConfig
  item: PlaylistItem | AlbumItem
  isSelected: boolean
  isPlaylist: boolean
  nameNeedsTruncation: boolean
  onSelectionToggle: () => void
}

/**
 * Renders individual table cells based on header configuration
 */
export const TableCell: React.FC<TableCellProps> = ({
  header,
  item,
  isSelected,
  isPlaylist,
  nameNeedsTruncation,
  onSelectionToggle,
}) => {
  const playlistItem = item as PlaylistItem
  const albumItem = item as AlbumItem

  switch (header.key) {
    case 'checkbox':
      return (
        <div className="row-checkbox">
          <WireframeCheckbox checked={isSelected} onChange={onSelectionToggle} />
        </div>
      )

    case 'thumbnail':
      return (
        <div className="row-thumbnail">
          {isPlaylist ? (
            <HoverDisplay
              content={
                playlistItem.description
                  ? cleanDescription(playlistItem.description, 200)
                  : `Playlist: ${playlistItem.name}\nOwner: ${playlistItem.owner.display_name}\nTracks: ${playlistItem.tracks.total}`
              }
              position="right"
              followMouse={true}
            >
              {/* Show first letter for 0-track playlists instead of trying to display full name */}
              {playlistItem.tracks.total === 0 ? (
                <div className="playlist-thumbnail-placeholder">
                  {item.name.charAt(0).toUpperCase()}
                </div>
              ) : (
                <img
                  src={
                    item.id === 'liked-songs'
                      ? 'https://misc.scdn.co/liked-songs/liked-songs-64.png'
                      : item.images[0]?.url || '/placeholder-album.png'
                  }
                  alt={`${item.name} thumbnail`}
                  onError={(e) => {
                    e.currentTarget.src =
                      item.id === 'liked-songs'
                        ? 'https://misc.scdn.co/liked-songs/liked-songs-64.png'
                        : '/placeholder-album.png'
                  }}
                />
              )}
            </HoverDisplay>
          ) : (
            <HoverDisplay
              content={`Album: ${albumItem.name}\nArtist: ${
                albumItem.artists[0]?.name || 'Unknown Artist'
              }\nTracks: ${albumItem.total_tracks}\nRelease Date: ${
                albumItem.release_date || 'Unknown'
              }`}
              position="right"
              followMouse={true}
            >
              <img
                src={item.images[0]?.url || '/placeholder-album.png'}
                alt={`${item.name} thumbnail`}
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-album.png'
                }}
              />
            </HoverDisplay>
          )}
        </div>
      )

    case 'name':
      return (
        <div className="row-name">
          {nameNeedsTruncation ? (
            <HoverDisplay content={item.name} position="top">
              <span className="item-name">{item.name}</span>
            </HoverDisplay>
          ) : (
            <span className="item-name">{item.name}</span>
          )}
        </div>
      )

    case 'owner':
      return (
        <div className="row-metadata">
          {isPlaylist
            ? playlistItem.owner.display_name
            : albumItem.artists[0]?.name || 'Unknown Artist'}
        </div>
      )

    case 'tracks':
      return (
        <div className="row-tracks">
          {isPlaylist ? playlistItem.tracks.total : albumItem.total_tracks}
        </div>
      )

    default:
      return <div />
  }
}