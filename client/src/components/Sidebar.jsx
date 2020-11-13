import React, { Component } from "react";
import {Dropdown, DropdownButton, Card} from "react-bootstrap";
import { HostContext } from "./HostContext";

class Sidebar extends Component {
    state = {
        data: null,
        currentCommunity: null,
        communities: [],
        host: null
    }

    static contextType = HostContext;

    componentDidMount() {
        this.fetchCommunities();
        this.fetchCommunityDetails();
    }

    componentDidUpdate() {
        if(this.context.host !== this.state.host) {
            this.fetchCommunities();
            // this.fetchCommunityDetails();
        }

        if(this.props.currentCommunity !== this.state.currentCommunity) {
            this.fetchCommunityDetails();
        }
    }

    fetchCommunities() {
        fetch('/api/communities' + (this.context.host !== null ? "?external=" + this.context.host : ""))
            .then(response => response.json())
            .then(data =>
                this.setState({ 
                    communities: data,
                    host: this.context.host
                })
            )
    }

    fetchCommunityDetails() {
        fetch('/api/communities/' + this.props.currentCommunity + (this.context.host !== null ? "?external=" + this.context.host : ""))
            .then(response => response.json())
            .then(data =>
                this.setState({ 
                    data: data,
                    currentCommunity: this.props.currentCommunity
                })
            )
    }

    render() {
        const {data, communities} = this.state;
        
        return data && communities && (
            <Card className="mt-4">
                <Card.Header>
                    <h3>{ data.title }</h3>

                    <DropdownButton variant="secondary" size="md" title={ data.id } 
                        onSelect={(community) => this.props.changeCommunity(community)}>

                        {communities.map(function(name, index) {
                            return <Dropdown.Item key={ index } eventKey={ name }>{ name }</Dropdown.Item>
                        })}
                        
                    </DropdownButton>
                </Card.Header>

                <Card.Body>
                    { data.description }
                </Card.Body>
            </Card>
        );
    }
}

export default Sidebar;
