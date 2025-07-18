import React, { useState, useEffect } from 'react'
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if we're on mobile using user agent and screen size
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/.test(userAgent)
      const isSmallScreen = window.innerWidth <= 768
      
      // Consider it mobile if either user agent indicates mobile OR screen is small
      setIsMobile(isMobileUA || isSmallScreen)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close mobile menu when page changes
  useEffect(() => {
    if (isMobile) {
      setIsMobileMenuOpen(false)
    }
  }, [currentPage, isMobile])
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

  const handleNavigate = (pageId: string) => {
    if (pageId === 'logout') {
      onLogout()
    } else {
      onNavigate(pageId)
    }
    // Mobile menu will close automatically via useEffect
  }

  if (isMobile) {
    return (
      <>
        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-button"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open navigation menu"
        >
          ☰ menu
        </button>

        {/* Mobile Fullscreen Menu */}
        {isMobileMenuOpen && (
          <div className="mobile-menu-overlay">
            <div className="mobile-menu">
              <div className="mobile-menu-header">
                <h2>navigation</h2>
                <button 
                  className="mobile-menu-close"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Close navigation menu"
                >
                  ✕
                </button>
              </div>
              
              <div className="mobile-nav-items">
                {navigationItems.map((item) => (
                  <div
                    key={item.id}
                    className={`mobile-nav-item ${currentPage === item.id ? 'active' : ''}`}
                    onClick={() => handleNavigate(item.id)}
                  >
                    {item.label}
                  </div>
                ))}
              </div>

              <div className="mobile-navbar-controls">
                <div className="mobile-font-controls">
                  <span>font size:</span>
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
            </div>
          </div>
        )}
      </>
    )
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
              onClick={() => handleNavigate(item.id)}
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
