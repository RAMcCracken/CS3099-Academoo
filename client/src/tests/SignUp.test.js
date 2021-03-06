import React from "react";
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
configure({ adapter: new Adapter() });
import { shallow, mount } from "enzyme";
import App from "../App";
import { Router, Route, Switch } from "react-router-dom";
import { createMemoryHistory } from 'history';
import SignUp from "../components/authentication/SignUp";
import Login from "../components/authentication/Login";
import each from 'jest-each';
import { authFetchMock } from "./fetchMocks";

let wrapper;
let usernameField;
let emailField;
let passwordField;
let passwordConfirmField;
let submitButton;
let signUpForm;
const history = createMemoryHistory();
jest.mock('../auth', () => {
    const { authFetchMock } = require('./fetchMocks');
    return ({
        useAuth: () => [false],
        authFetch: authFetchMock
    })
}
);

function setFormDataAndSubmit(email, username, password, passwordConfirm) {
    emailField.simulate('change', { target: { name: "email", value: email } })
    usernameField.simulate('change', { target: { name: "username", value: username } })
    passwordField.simulate('change', { target: { name: "password", value: password } })
    passwordConfirmField.simulate('change', { target: { name: "passwordConfirm", value: passwordConfirm } })
    submitButton.simulate('submit');
}


beforeEach(() => {
    global.fetch =
        jest.fn().mockImplementation(() => {
            return Promise.resolve({
                ok: true,
            });
        });


    history.push('/sign-up')
    wrapper = mount(
        <Router history={history}>
            <SignUp />
        </Router>
    );


    usernameField = wrapper.find('[name="username"]').hostNodes();
    emailField = wrapper.find('[name="email"]').hostNodes();
    passwordField = wrapper.find('[name="password"]').hostNodes();
    passwordConfirmField = wrapper.find('[name="passwordConfirm"]').hostNodes();
    submitButton = wrapper.find('[type="submit"]').hostNodes();
    signUpForm = wrapper.find(SignUp);
});

describe('SignUp form is valid', () => {
    it.each`
    username        | email                 | password
    ${"banana"}     | ${"banana@gmail.com"} | ${"Test!123"}
    ${"userMcUser"} | ${"user@outlook.com"} | ${"aaaaaA1$"}
    ${"cheese"}     | ${"cheese@yahoo.com"} | ${"2BAAAAAa??"}
    ${"aaa"}          | ${"m@fb.com"} | ${"12345sS&"}
  `('for input [$username, $email, $password]', ({ username, email, password }) => {
        setFormDataAndSubmit(email, username, password, password);
        expect(signUpForm.state().errors).toHaveLength(0)
    });
});

describe('SignUp form is invalid (username too short)', () => {
    it.each`
    username        | email                 | password
    ${"a"}     | ${"banana@gmail.com"} | ${"Test!123"}
    ${"1"} | ${"user@outlook.com"} | ${"aaaaaA1$"}
    ${"aa"}     | ${"cheese@yahoo.com"} | ${"2BAAAAAa??"}
    ${"a1"}          | ${"m@fb.com"} | ${"12345sS&"}
  `('for input [$username, $email, $password]', ({ username, email, password }) => {
        setFormDataAndSubmit(email, username, password, password);
        expect(signUpForm.state().errors).toContain("Username must be at least 3 characters.")
    });
});

describe('SignUp form is invalid (blank fields)', () => {
    it.each`
    username        | email                 | password
    ${""}     | ${"banana@gmail.com"} | ${"Test!123"}
    ${"userMcUser"} | ${""} | ${"aaaaaA1$"}
    ${"cheese"}     | ${"cheese@yahoo.com"} | ${""}
    ${""}          | ${""} | ${"12345sS&"}
  `('for input [$username, $email, $password]', ({ username, email, password }) => {
        setFormDataAndSubmit(email, username, password, password);
        expect(signUpForm.state().errors).toContain("Required fields have been left blank.")
    });
});

describe('SignUp form is invalid (passwords do not match)', () => {
    it.each`
    username        | email                 | password      | passwordConfirm
    ${"banana"}     | ${"banana@gmail.com"} | ${"Test!123"} | ${"Test!12"}
    ${"userMcUser"} | ${"user@outlook.com"} | ${"aaaaaA1$"} | ${"aaaaaaA1$"}
    ${"cheese"}     | ${"cheese@yahoo.com"} | ${"2BAAAAAa??"}| ${"2BAAAAAa$"}
    ${"aaa"}          | ${"m@fb.com"} | ${"12345sS&"} | ${"Test!123"}
  `('for input [$username, $email, $password]', ({ username, email, password, passwordConfirm }) => {
        setFormDataAndSubmit(email, username, password, passwordConfirm);
        expect(signUpForm.state().errors).toContain("Passwords do not match.")
    });
});

describe('SignUp form is invalid (email missing @ symbol)', () => {
    it.each`
    username        | email                 | password
    ${"banana"}     | ${"bananagmail.com"} | ${"Test!123"}
    ${"userMcUser"} | ${"user%outlook.com"} | ${"aaaaaA1$"}
    ${"cheese"}     | ${"cheese+yahoo.com"} | ${"2BAAAAAa??"}
    ${"aaa"}          | ${"m.fb.com"} | ${"12345sS&"}
  `('for input [$username, $email, $password]', ({ username, email, password }) => {
        setFormDataAndSubmit(email, username, password, password);
        expect(signUpForm.state().errors).toContain("Email should contain the @ symbol.")
    });
});

describe('SignUp form is invalid (password insecure)', () => {
    it.each`
    username        | email                 | password
    ${"banana"}     | ${"banana@gmail.com"} | ${"Test1234"}
    ${"banana"}     | ${"banana@gmail.com"} | ${"Password123"}
    ${"userMcUser"} | ${"user@outlook.com"} | ${"aaaaaA$"}
    ${"cheese"}     | ${"cheese@yahoo.com"} | ${"2BAAAAA??"}
    ${"aaa"}          | ${"m@fb.com"} | ${"1sS&"}
  `('for input [$username, $email, $password]', ({ username, email, password }) => {
        setFormDataAndSubmit(email, username, password, password);
        expect(signUpForm.state().errors).toHaveLength(1)
    });
});