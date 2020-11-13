import React from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Dropdown from "react-bootstrap/Dropdown";
import Image from "react-bootstrap/Image";
import {logout, useAuth} from "../auth";
import defaultProfile from "../images/default_profile.png";
import logo from "../images/logo.svg";
// import logo from "../images/logo.png";
import {HostContext} from './HostContext';
import { useState, useEffect } from "react";

import {
  PlusCircle,
  PersonCircle,
  Gear,
  BoxArrowRight,
} from "react-bootstrap-icons";

import { Link } from "react-router-dom";

function HeaderBar() {
  const [logged] = useAuth();
  const [instances, setInstances] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/get-instances");
      res.json().then(res => setInstances(["local", ...res]));
    }

    fetchData();
  }, []);

  return (
    <Navbar bg="primary" variant="dark" expand="lg" {...(!logged ? {className: 'justify-content-center'} : {})}>
      <Navbar.Brand as={Link} to="/">
        <img
          alt=""
          src={logo}
          width="70"
          height="70"
          className="d-inline-block align-center"
        />{" "}
        Academoo
      </Navbar.Brand>

      {logged && (instances !== null) && (
        <React.Fragment>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              <Nav.Link as={Link} to="/moosfeed">
                Moosfeed
              </Nav.Link>
              <Nav.Link as={Link} to="/create-post">
                <PlusCircle className="mb-1" />
                <span> New Moo</span>
              </Nav.Link>
              <Nav.Link as={Link} to="/create-community">
                <PlusCircle className="mb-1" />
                <span> New Commoonity</span>
              </Nav.Link>
            </Nav>

            <Nav>
              <HostContext.Consumer>
                {({host, setHost}) => (
                  <DropdownButton title={"Current Instance: " + (host ? host : "local")} className="mr-5">
                  {
                    instances.map(name => {
                      return <Dropdown.Item as="button" key={name} onClick={() => setHost(name)}>{name}</Dropdown.Item>
                    })
                  }
                  </DropdownButton>
                )}
              </HostContext.Consumer>
              

              <DropdownButton
                // as={Link}
                // to="/user-profile"
                variant="outline-light"
                title={
                  <span>
                    <Image
                      className="mr-3"
                      src={defaultProfile}
                      roundedCircle
                      width="25"
                      height="25"
                    ></Image>
                    Yoo
                  </span>
                }
                id="collasible-nav-dropdown"
                alignRight
                className="p0"
              >
                <NavDropdown.Item as={Link} to="/user-profile">
                  <PersonCircle /> Profile
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/user-settings">
                  <Gear /> Settings
                </NavDropdown.Item>

                <NavDropdown.Divider />
                <NavDropdown.Item onClick={logout}>
                  <BoxArrowRight /> Log Out{" "}
                </NavDropdown.Item>
              </DropdownButton>
            </Nav>
          </Navbar.Collapse>
        </React.Fragment>
      )}

    </Navbar>
  );
}

export default HeaderBar;
