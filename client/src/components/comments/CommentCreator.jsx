import React from '../../../node_modules/react';
import Form from '../../../node_modules/react-bootstrap/Form';
import Button from '../../../node_modules/react-bootstrap/Button';
import Modal from '../../../node_modules/react-bootstrap/Modal';
import Alert from '../../../node_modules/react-bootstrap/Alert';
import { authFetch } from '../../auth';

/**
 * Component which holds the stucture for when a comment has been made
 */
class CommentCreator extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: "",
            email: "",
            userHost: "",
            body: "",
            error: null,
            parentPost: this.props.parentPost
        };
    }


    /**
     * method to fetch the user details of who has created the comment
     */
    fetchUserDetails() {
        authFetch("/api/get-user").then(response => response.json())
            .then(data =>
                this.setState({
                    user_id: data.id,
                    email: data.email,
                    userHost: data.host
                })
            ).catch(() => {})
    }

    /**
     * Method to fetch the number of votes that a post has had
     */
    fetchVotes(postId) {
        authFetch('/api/get-vote/' + postId)
          .then(response => {
            if (!response.ok || response.status != 200) {
              throw new Error();
            }
            return response.json()
          }
          ).then(data =>
            this.setState({ voteStatus: { ...this.state.voteStatus, [postId]: data.vote } })
          ).catch((err) => {
          });
      }

      /**
       * set values
       */
    handleChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        this.setState({
            [name]: value
        });
    }

    /**
     * Method to handle the submission of a comment
     * 
     */
    async handleSubmit(event) {
        event.preventDefault();
        //send the information to the backend
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-ID': this.state.user_id,
                'Client-Host': window.location.hostname
            },
            body: {
                community: this.state.parentPost.community,
                parentPost: this.state.parentPost.id,
                title: this.state.title,
                content: [
                    {
                        text: {
                            text: this.state.body
                        }
                    }
                ],
                author: {
                    id: this.state.user_id,
                    host: this.state.userHost
                }
            }
        };


        if (this.props.host !== "local") {
            requestOptions.body.external = this.props.host
        }

        //stringify the body to JSON
        requestOptions.body = JSON.stringify(requestOptions.body);

        await authFetch('/api/posts', requestOptions)
            .then((response) => {
                if (response.status >= 400 && response.status < 600) {
                    return response.json().then((error) => {
                        let err = error.title + ": " + error.message
                        throw new Error(err);
                    })
                } else {
                    return response;
                }
            })
            .then(response => this.setState({ email: "", host: "", title: "", body: "" }))
            .catch(error => {
                this.setState({ error: error.message })
            })
        if (this.state.error == null) {
            this.props.onSubmit();
        }
    }

    componentDidMount() {
        this.fetchUserDetails();
    }

    /**
     * method to create the comment create box which a modal which pops up
     */
    render() {
        return (
            <React.Fragment >
                <Modal.Body>
                    {this.state.error ? <Alert variant="danger">{this.state.error}</Alert> : null}
                    <Form onSubmit={this.handleSubmit.bind(this)}>

                        <Form.Group controlId="createPostText">
                            <Form.Control as="textarea"
                                placeholder="Write a comment..."
                                name="body"
                                onChange={this.handleChange.bind(this)}
                                value={this.state.body} />
                        </Form.Group>

                        <Button variant="primary" type="submit">
                            Post
                        </Button>
                    </Form>
                </Modal.Body>
            </React.Fragment>
        )
    }
}

export default CommentCreator;