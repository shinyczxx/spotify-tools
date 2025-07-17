import React from 'react'
import './Navbar.css'
import NavbarItem from './NavbarItem'

interface NavbarProps {
  currentPage: string
  onNavigate: (pageId: string) => void
  fontSize: number
  onFontSizeChange: (size: number) => void
  onLogout: () => void
}

const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  fontSize,
  onFontSizeChange,
  onLogout,
}) => {
  const navigationItems = [
    { id: 'userinfo', label: 'user info' },
    { id: 'playlist-tools', label: 'playlist tools' },
    { id: 'getTrackInfo', label: 'track info' },
    { id: 'settings', label: 'settings' },
    { id: 'logout', label: 'logout' },
  ]

  const handleFontSizeChange = (change: number) => {
    const newSize = Math.max(10, Math.min(32, fontSize + change))
    onFontSizeChange(newSize)
  }

  return (
    <nav className="navbar">
      <div className="nav-items">
        {navigationItems.map((item) => (
          <div
            key={item.id}
            className={`nav-item-wrapper ${currentPage === item.id ? 'active' : ''}`}
          >
            <NavbarItem
              label={item.label}
              active={currentPage === item.id}
              onClick={() => (item.id === 'logout' ? onLogout() : onNavigate(item.id))}
            />
          </div>
        ))}
      </div>
      <div className="navbar-controls">
        {/* Font Controls */}
        <div className="font-controls">
          <button
            className="font-btn"
            onClick={() => handleFontSizeChange(-2)}
            title="decrease font size"
          >
            a-
          </button>
          <span className="font-size-display">{fontSize}px</span>
          <button
            className="font-btn"
            onClick={() => handleFontSizeChange(2)}
            title="increase font size"
          >
            a+
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
