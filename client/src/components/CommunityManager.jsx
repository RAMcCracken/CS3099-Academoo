import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { authFetch } from '../auth';
import { Redirect } from "react-router-dom";
class CommunityManager extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            isAdmin: null,
            currentCommunity: this.props.match.params.id,
        };
    }

    componentDidMount() {
        this.fetchUserDetails();
      }
    
      fetchUserDetails() {
        authFetch("/api/get-user").then(response => response.json())
          .then(data =>
            this.setState({
              isAdmin: data.adminOf.includes(this.state.currentCommunity),
            })
          )
      }

    render() {
        console.log(this.state)
        return (
            this.state.isAdmin == null ? <h3> Loading... </h3> : 
             !this.state.isAdmin ? <Redirect to='/forbidden' /> :
            <Card className="mt-4">
                <Card.Header className="pt-4">
                    <Card.Title>Manage your community</Card.Title>
                </Card.Header>

                <Card.Body>
                    To be continued...
                </Card.Body>
            </Card>
        )
    }
}

export default CommunityManager;