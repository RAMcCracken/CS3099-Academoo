import React, { Component, useContext } from "react";
import Post from "./Post";
import Sidebar from "./Sidebar";
import { Card, Container, Row, Col, Form, FormControl, Button, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { HostContext } from "./HostContext";
import { PlusCircle } from "react-bootstrap-icons";

class CommunityFeed extends Component {
  state = {
    isLoading: true,
    posts: [],
    currentCommunity: null,
    error: null,
    host: null,
    newPostText: ""
  }

  static contextType = HostContext;

  componentDidMount() {
    this.fetchCommunity();
  }

  componentDidUpdate() {
    if (this.context.host !== this.state.host) {
      this.fetchCommunity();
    } else if (this.state.isLoading) {
      this.fetchPosts();
    }
  }

  async fetchCommunity() {
    await fetch('/api/communities' + (this.context.host !== null ? "?external=" + this.context.host : ""))
      .then(response => response.json())
      .then(data =>
        this.setState({
          currentCommunity: data.length > 0 ? data[0] : "?"
        })
      )

    this.fetchPosts();
  }

  fetchPosts() {
    fetch('/api/posts?community=' + this.state.currentCommunity + (this.context.host !== null ? "&external=" + this.context.host : ""))
      .then(response => response.json())
      .then(data =>
        this.setState({
          posts: data,
          isLoading: false,
          host: this.context.host
        })
      )
      .catch(error => this.setState({ error, isLoading: false }));
  }

  handleChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }

  handleSubmit(event) {
    event.preventDefault();
  }

  render() {
    const { isLoading, posts, error, currentCommunity, newPostText } = this.state;

    return currentCommunity && (
      <Container>
        <Card className="mt-4">
          <Card.Body>
            <h3>You haven't yet subscribed to any communities!</h3>
            <p>See what's available:</p>
            <Link to="/explore" className="btn btn-secondary">
            Explore Communities
          </Link>
          </Card.Body>

        </Card>
        {/*
        <Row>
          <Col xs={8}>
            <Card className="mt-4">
              <Card.Header className="pt-4">
                <h2>{currentCommunity}</h2>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={this.handleSubmit.bind(this)}>
                  <Form.Row>
                    <Form.Group as={Col} className="d-none d-sm-flex" sm={6} md={7} lg={9}>
                      <FormControl 
                        type="text" 
                        placeholder="Create your own post: " 
                        name="newPostText" 
                        className="mr-2" 
                        onChange={this.handleChange.bind(this)} />

                    </Form.Group>
                    <Form.Group as={Col} xs={12} sm={6} md={5} lg={3}>
                      <Link to={
                        {
                          pathname: "/create-post",
                          state: {
                            body: newPostText,
                            community: currentCommunity
                          }
                        }
                      }>
                        <Button variant="outline-secondary" className="w-100" > <PlusCircle className="mb-1" /> New Moo</Button>
                      </Link>
                    </Form.Group>
                  </Form.Row>
                </Form>
                {error ? <Alert variant="danger">Error fetching posts: {error.message}</Alert> : null}
                {!isLoading ? (
                  posts.map(data => {
                    const { parent, id } = data;
                    return (
                      parent === currentCommunity ? (
                        <Card key={id} className="mt-4">
                          <Card.Body>
                            <Post postData={data} />
                            <Link
                              to={this.state.host == "local" ? `/comments/${id}` : '/comments/' + this.state.host + `/${id}`}
                              className="btn btn-primary stretched-link"
                            >
                              View Comments ({data.children.length})
                          </Link>
                          </Card.Body>
                        </Card>
                      ) : null);
                  })
                ) : (
                    <h3>Loading Posts...</h3>
                  )}
                {!isLoading && posts.length === 0 ? <h4>There's no posts yet :-(</h4> : null}
              </Card.Body>
            </Card>
          </Col>
          
          <Col>
            <Sidebar currentCommunity={currentCommunity}
              changeCommunity={(community) => this.setState({
                currentCommunity: community,
                isLoading: true
              })} />
          </Col>
            </Row>*/}
      </Container>
    );
  }
}

export default CommunityFeed;