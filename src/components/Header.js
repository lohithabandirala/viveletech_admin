import React from 'react';

function Header({ toggleSidebar, userEmail, title }) {
    return (
        <header className="app-header">
            <div className="header-left">
                <button className="header-menu-btn" onClick={toggleSidebar}>
                    ☰
                </button>
                <h1 className="header-title">{title}</h1>
            </div>

            <div className="header-right">
                <div className="user-profile">
                    <div className="user-avatar">
                        {userEmail ? userEmail[0].toUpperCase() : 'U'}
                    </div>
                    <span className="user-email">{userEmail}</span>
                </div>
            </div>
        </header>
    );
}

export default Header;
