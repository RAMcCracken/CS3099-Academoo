import React, { Component } from "react";
import { ListGroup, Card, ListGroupItem } from "react-bootstrap";
import { Link } from "react-router-dom";
import { authFetch } from '../../auth';
import CommunitySubscribeButton from "../community/CommunitySubscribeButton";

/* Sidebar Component to display on the main page, alongside the newsfeed */
class Sidebar extends Component {
    state = {
        subscribedCommunities: [],
        isLoading: true,
    }

    componentDidMount() {
        this.fetchUserDetails();
    }

    //fetch the logged-in user's details 
    fetchUserDetails() {
        authFetch("/api/get-user").then(response => response.json())
            .then(data =>
                this.setState({
                    subscribedCommunities: data.subscriptions,
                    isLoading: false
                })
            ).catch(() => { });
    }

    updateSubscriptions() {
        this.setState({ isLoading: true });
        this.fetchUserDetails();
        this.props.fetchSubscribedCommunities();
    }

    /* Render the sidebar component  
    allows users to see the communities they are subscribed to and follow new commmunities */
    render() {
        const { subscribedCommunities, isLoading } = this.state;

        return (
            <Card className="mt-4">
                <Card.Header>
                    <Card.Title>Folloowing:</Card.Title>
                </Card.Header>

                <Card.Body className="p-0">
                    <ListGroup variant="flush">
                        {!isLoading ?
                            subscribedCommunities && subscribedCommunities.length == 0 ?
                                <ListGroupItem>
                                    You haven't subscribed to any communities!
                                </ListGroupItem>
                                :
                                subscribedCommunities.map((subscription) =>
                                    subscription.communityId !== "" &&

                                    <ListGroup.Item key={subscription.communityId} className="d-flex flex-column align-items-left flex-wrap">
                                        <Link to={
                                            "communities/" + (subscription.external !== null ? subscription.external + "/" : "") + subscription.communityId}>
                                            {subscription.communityId}
                                        </Link>
                                        <CommunitySubscribeButton community={subscription.communityId} external={subscription.external} updateParent={this.updateSubscriptions.bind(this)} />
                                    </ListGroup.Item>)

                            : <p>Loading...</p>}

                        <ListGroupItem>
                            <Link to="/communities" className="btn btn-secondary d-flex justify-content-center">
                                <span>Explore Communities</span>
                            </Link>

                        </ListGroupItem>
                    </ListGroup>

                </Card.Body>
            </Card>
        );
    }
}

export default Sidebar;

