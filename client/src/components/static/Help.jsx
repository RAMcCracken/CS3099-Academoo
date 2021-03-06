import React from "react";
import Card from "react-bootstrap/Card";

class Help extends React.Component {
  /* 
  Component which is used to display help information to the user about how to use Academoo
  */
  render() {
    return (
      <Card className="mt-4">
        <Card.Body>
          <h1>Need some help?</h1>
          <p>Here are some common questions we recieve at Academoo! </p>
          <Card className="mt-4">
            <Card.Body>
              <h5><i>How do I change my password?</i></h5>
              <p>Reset your password! Just navigate from Yoo->Settings and change your password there.</p>
            </Card.Body>
          </Card>
          <Card className="mt-4">
            <Card.Body>
              <h5><i>What is a Commoonity?</i></h5>
              <p>A commoonity is a place of a given topic or group of people. You can create your own, by pressing 'New Commoonity' at the top bar.</p>
            </Card.Body>
          </Card>
          <Card className="mt-4">
            <Card.Body>
              <h5><i>What if I don't want people seeing my email on my profile?</i></h5>
              <p>You can change your privacy settings! Go to Yoo->Settings and scroll down and tick 'Private account'</p>
            </Card.Body>
          </Card>
          <Card className="mt-4">
            <Card.Body>
              <h5><i>What are the different types of roles people can have?</i></h5>
              <p>Admin: All functionality of contributer + able to close a community, delete posts/comments by any user</p>
              <p>Contributer: All functionality of general member + can post</p>
              <p>General Member: All functionality of guest + able to comment, edit and delete their own comments</p>
              <p>Guest: View and like posts and comments and report a user</p>
            </Card.Body>
          </Card>
          <Card className="mt-4">
            <Card.Body>
              <h5><i>How do I update my bio?</i></h5>
              <p>Just navigate from Yoo->Settings and change your bio there.</p>
            </Card.Body>
          </Card>
          <Card className="mt-4">
            <Card.Body>
              <h5><i>How do I change my profile picture?</i></h5>
              <p>To set your profile picture you must create an account on Gravatar with the email associated with your Academoo account and set a picture. </p>
            </Card.Body>
          </Card>
        </Card.Body>
      </Card>

    );
  }
}

export default Help;
