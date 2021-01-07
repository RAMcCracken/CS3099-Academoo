import React from "react";
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
configure({ adapter: new Adapter() });
import { shallow, mount } from "enzyme";
import App from "../App";
import Welcome from "../components/Welcome";
import PostsViewer from "../components/PostsViewer";
import CommentsViewer from "../components/CommentsViewer";
import PostCreator from "../components/PostCreator";
import UserSettings from "../components/UserSettings";
import UserProfile from "../components/UserProfile";
import Login from "../components/Login";
import SignUp from "../components/SignUp";
import { MemoryRouter as Router, Route } from "react-router-dom";
import { JustifyLeft } from "react-bootstrap-icons";



// const App = require('../App').default;
const auth = require('../auth');

jest.mock('../auth', () => ({
  useAuth: () => [true],
  }));

it("Routes to default page", () => {
  auth.useAuth.mockReturnValue([true]);
  const wrapper = mount(
    <Router initialEntries={["/"]}>
      <App />
    </Router>
  );
  expect(wrapper.find(Login)).toHaveLength(1);
});

it("Routes to login page", () => {
  const wrapper = mount(
    <Router initialEntries={["/login"]}>
      <App />
    </Router>
  );
  expect(wrapper.find(Login)).toHaveLength(1);
});

it("Routes to sign-up page", () => {
  const wrapper = mount(
    <Router initialEntries={["/sign-up"]}>
      <App />
    </Router>
  );
  expect(wrapper.find(SignUp)).toHaveLength(1);
});


it("Routes to welcome page", () => {
  const wrapper = mount(
    <Router initialEntries={["/home"]}>
      <App />
    </Router>
  );
  expect(wrapper.find(Login)).toHaveLength(1);
});

it("Routes to Moosfeed page", () => {
  const wrapper = mount(
    <Router initialEntries={["/moosfeed"]}>
      <App />
    </Router>
  );
  expect(wrapper.find(Login)).toHaveLength(1);
});

it("Routes to Create-Post page", () => {
  const wrapper = mount(
    <Router initialEntries={["/create-post"]}>
      <App />
    </Router>
  );
  expect(wrapper.find(Login)).toHaveLength(1);
});

it("Routes to Comments page for parent post id", () => {
  const wrapper = mount(
    <Router initialEntries={["/moosfeed/comments/post1"]}>
      <App />
    </Router>
  );
  expect(wrapper.find(Login)).toHaveLength(1);
});

it("Routes to User-Profile page", () => {
  const wrapper = mount(
    <Router initialEntries={["/user-profile"]}>
      <App />
    </Router>
  );
  expect(wrapper.find(Login)).toHaveLength(1);
});

it("Routes to User-Settings page", () => {
  const wrapper = mount(
    <Router initialEntries={["/user-settings"]}>
      <App />
    </Router>
  );
  expect(wrapper.find(Login)).toHaveLength(1);
});

it("Routes to User-Settings page", () => {
  const wrapper = mount(
    <Router initialEntries={["/user-settings"]}>
      <App />
    </Router>
  );
  expect(wrapper.find(Login)).toHaveLength(1);
});





