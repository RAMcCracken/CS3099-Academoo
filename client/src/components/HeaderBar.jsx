import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Dropdownbutton from 'react-bootstrap/DropdownButton';
import Image from 'react-bootstrap/Image';

import defaultProfile from '../images/default_profile.png'
import logo from '../images/logo.png'

import { PlusCircle, PersonCircle, Gear, BoxArrowRight } from 'react-bootstrap-icons';

class HeaderBar extends React.Component {
    render() {
        return (
            <Navbar bg="light" variant="light" expand="lg">
                <Navbar.Brand href="#home">
                    <img
                        alt=""
                        src={logo}
                        width="30"
                        height="30"
                        className="d-inline-block align-top"
                    />{' '}
                    Academoo</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                        <Nav.Link href="#home">Hoome</Nav.Link>
                        <Nav.Link href="#link">
                            <PlusCircle className="mb-1" />
                            <span>  New Moo</span>
                        </Nav.Link>
                    </Nav>

                    <Nav>
                        <Dropdownbutton variant="outline-secondary" title={
                            <span><Image className="mr-3" src={defaultProfile} roundedCircle width="25" height="25"></Image>Yoo</span>
                        } id="collasible-nav-dropdown" alignRight className="p0">
                            <NavDropdown.Item href="#action/3.1"><PersonCircle /> Profile</NavDropdown.Item>
                            <NavDropdown.Item href="#action/3.2"><Gear /> Settings</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item href="#action/3.4"><BoxArrowRight /> Log Out </NavDropdown.Item>
                        </Dropdownbutton>
                    </Nav>

                </Navbar.Collapse>
            </Navbar>
        )
    }
}

export default HeaderBar;