import React from 'react';
import './NavbarItem.css';

interface NavbarItemProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

const NavbarItem: React.FC<NavbarItemProps> = ({ label, active, onClick }) => (
  <div
    className={`nav-item${active ? ' active' : ''}`}
    onClick={onClick}
  >
    {label}
  </div>
);

export default NavbarItem;
