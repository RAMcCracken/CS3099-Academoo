import React, { Component } from "react";
import PostViewer from "../posts/PostsViewer";
import { Card,  Alert } from "react-bootstrap";
import { authFetch } from '../../auth';

/**
 * component which shows all of the search results in a given query
 */
class SearchFeed extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoadingPosts: true,
      posts: [],
      error: null,
    }
  }

  componentDidMount() {
    this.fetchPosts();
  }

  /**
   * fetch the posts from a given community
   */
  async fetchPosts() {
    await authFetch('/api/search?query=' + this.props.match.params.query)
      .then((response) => response.json())
      .then(data => {
        this.setState({
          posts: data,
          isLoadingPosts: false
        })
      })
      .catch(error => {
        this.setState({ error: error.message, isLoadingPosts: false })
      });
  }

  /**
   * method which renders a community, its relevant info and the posts on this community
   */
  render() {
    const { isLoadingPosts, posts, error } = this.state;

    return (
      <Card className="mt-4 mb-10">
        <Card.Header className="pt-4 pr-4">
          <div className="d-flex justify-content-between">
            <Card.Title >
                <h3>Search Results 🐮</h3>
            </Card.Title>
          </div>
        </Card.Header>

        <Card.Body>
          {error ? <Alert variant="warning">Error fetching posts: {error}</Alert> : null}
          {!isLoadingPosts ? (
            <PostViewer posts={posts} parentCallback={this.parentCallback} />
          ) : (
              <h3>Loading Posts...</h3>
            )}
          {!isLoadingPosts && posts.length === 0 ? <h4>There's no posts yet :-(</h4> : null}
        </Card.Body>
      </Card >
    );
  }
}

export default SearchFeed;