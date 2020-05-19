import React, { Component } from "react";
import config from "../config-dev";

class ContactForm extends Component {
  constructor(props) {
    super(props);
    this.contactform = null;

    this.setFormRef = (element) => {
      this.contactform = element;
    };

    this.state = {
      name: "",
      email: "",
      message: "",
      response: "",
    };
  }
  sendContactForm = (evt) => {
    evt.preventDefault();

    fetch(config.submitContactFormURL, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(this.state),
    })
      .then((response) => response.json())
      .then((response) => {
        console.log(response);
        this.setState({ response: response.message });
      })
      .catch((error) => console.error("Error: ", error));
    console.log(this.state);
    if (this.contactform) {
      this.contactform.reset();
      this.setState({ name: "", email: "", message: "" });
    }
  };

  onFieldsChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    return (
      <form ref={this.setFormRef}>
        <h1>Contact Us</h1>
        <hr />
        <fieldset>
          <div className="form-group">
            <label htmlFor="exampleInputEmail1">Your Name</label>
            <input
              name="name"
              type="text"
              className="form-control"
              placeholder="Enter Name"
              required
              onChange={this.onFieldsChange}
            />
            <br />
            <label htmlFor="exampleInputEmail1">Your Email address</label>
            <input
              name="email"
              type="email"
              className="form-control"
              placeholder="Enter email"
              onChange={this.onFieldsChange}
              required
            />
            <small id="emailHelp" className="form-text text-muted">
              We'll never share your email with anyone else.
            </small>
          </div>
          <br />
          <div className="form-group">
            <label htmlFor="exampleTextarea">Your Message</label>
            <textarea
              name="message"
              className="form-control"
              rows="5"
              cols="40"
              required
              onChange={this.onFieldsChange}
            ></textarea>
          </div>

          <button className="btn btn-primary" onClick={this.sendContactForm}>
            Send Message
          </button>

          <br />
          <br />
          <div>{this.state.response}</div>
        </fieldset>
      </form>
    );
  }
}
export default ContactForm;
