import React, { Component } from "react";
import PostViewer from "../posts/PostsViewer";
import { Card, Button, Alert, OverlayTrigger, Popover, Row, Col, Spinner } from "react-bootstrap";
import { Link, Redirect } from "react-router-dom";
import { BookmarkPlus } from "react-bootstrap-icons";
import { authFetch } from '../../auth';
import MiniPostCreator from "../posts/MiniPostCreator";
import Post from "../posts/Post";
import Sidebar from "../layout/Sidebar";
import logo from "../../images/logo.svg";
import CommunitySubscribeButton from "./CommunitySubscribeButton";

class CommunityFeed extends Component {
  state = {
    isLoadingCommunity: true,
    isLoadingPosts: true,
    posts: [],
    currentCommunity: this.props.match.params.id,
    error: null,
    host: this.props.match.params.instance ? this.props.match.params.instance : "local",
    newPostText: "",
    isAdmin: false,
    isSiteAdmin: false,
    communityData: null,
    isSubscribed: false,
    userID: null,
    notFound: false
  }

  componentDidMount() {
    this.fetchUserDetails();
  }

  fetchUserDetails() {
    authFetch("/api/get-user").then(response => response.json())
      .then(data => {
        this.setState({
          userID: data.id,
          isAdmin: data.adminOf.includes(this.state.currentCommunity),
          isSubscribed: data.subscriptions.includes(this.state.currentCommunity),
          isSiteAdmin: data.site_roles.split(",").includes("site-admin")
        })
        console.log(this.state.userID)
        this.fetchPosts()
      }).catch(() => {})

  }

  async fetchPosts() {
    await authFetch('/api/posts?community=' + this.state.currentCommunity + '&includeSubChildrenPosts=false' + (this.state.host !== "local" ? "&external=" + this.state.host : ""),
      {
        headers: {
          'User-ID': this.state.userID,
          'Client-Host': window.location.protocol + "//" + window.location.hostname
        }
      })
      .then((response) => {
        if (response.status >= 400 && response.status < 600) {
          return response.json().then((error) => {
            let err = error.title + ": " + error.message
            throw new Error(err);
          })
        } else {
          return response.json();
        }
      })
      .then(data => {
        this.setState({
          posts: data,
          host: this.state.host,
          isLoadingPosts: false
        })
      })
      .catch(error => {
        this.setState({ error: error.message, isLoadingPosts: false })
      });
    this.fetchCommunityDetails();
  }

  handleChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }

  fetchCommunityDetails() {
    authFetch('/api/communities/' + this.state.currentCommunity + (this.state.host !== "local" ? "?external=" + this.state.host : ""),
      {
        headers: {
          'Client-Host': window.location.protocol + "//" + window.location.hostname
        }
      })
      .then(response => {
        if (response.status !== 200) {
          throw new Error();
        }
        return response.json()
      })
      .then(data =>
        this.setState({
          communityData: data,
          isLoadingCommunity: false,
        })
      ).catch((error) => {this.setState({notFound: true})})
  }

  handleSubmit(event) {
    event.preventDefault();
  }

  render() {
    console.log(this.state)
    const { isLoadingPosts, isLoadingCommunity, posts, error, currentCommunity, newPostText, host, communityData, isAdmin, isSiteAdmin } = this.state;
    const popover = (
      <Popover id="popover-basic">
        <Popover.Title as="h3">Community description</Popover.Title>
        <Popover.Content>
          {!isLoadingCommunity && communityData.description}
        </Popover.Content>
      </Popover>
    );
    return this.state.notFound ? <Redirect to='/404' /> : (
      <Card className="mt-4 mb-10">
        <Card.Header className="pt-4 pr-4">
          <div className="d-flex justify-content-between">
            {!isLoadingCommunity ?
              <Card.Title >
                <OverlayTrigger trigger={['hover', 'focus']} placement="right" overlay={popover}>
                  <Link to="#" className="px-0 py-0" variant="none" style={{ color: "black", fontSize: "36px" }}>{communityData.title}
                  </Link></OverlayTrigger>
              </Card.Title>

              : <h2>
                <Spinner animation="border" role="status" variant="light"><img src={logo} width="40"
                  height="40"></img></Spinner>
                <span>Loading... </span></h2>}

            <CommunitySubscribeButton community={this.state.currentCommunity} external={this.state.instance === "local" ? null : this.state.instance}/>
          </div>

          <Card.Subtitle className="text-muted"><h6>{host + "/" + currentCommunity}</h6></Card.Subtitle>


        </Card.Header>
        <Card.Body>
          {(isAdmin || isSiteAdmin) &&
            <Alert className="d-flex justify-content-between align-itemsp-center" variant="primary">You are an admin!
            <Link to={"/communities/" + currentCommunity + "/manage"}>
                Manage Community
              </Link>
            </Alert>}
          <MiniPostCreator currentCommunity={currentCommunity} host={host} />
          {error ? <Alert variant="warning">Error fetching posts: {error}</Alert> : null}
          {!isLoadingPosts ? (
            <PostViewer posts={posts} />
          ) : (
              <h3>Loading Posts...</h3>
            )}
          {!isLoadingPosts && posts.length === 0 ? <h4>There's no posts yet :-(</h4> : null}
        </Card.Body>
      </Card >
    );
  }
}

export default CommunityFeed;