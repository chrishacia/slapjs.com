import React from 'react';
import {Container} from 'react-bootstrap';

const Header: React.FC = () => {
    const toggleSidebar = () => {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.toggle('show');
        }
    };

    return (
        <Container fluid className="g-0">

                    <nav className="navbar navbar-expand-md navbar-dark bg-dark ">
                        <div className="container-fluid">
                            <button
                                className="navbar-toggler"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target="#navbarCollapse"
                                aria-controls="navbarCollapse"
                                aria-expanded="false"
                                aria-label="Toggle navigation"
                                onClick={toggleSidebar}
                            >
                                <span className="navbar-toggler-icon"></span>
                            </button>
                            <a className="navbar-brand" href="#none">
                                <span className="gradient-text">SlapJS</span>
                            </a>
                        </div>
                    </nav>

        </Container>
    );
};

export default Header;
