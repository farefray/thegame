import React, { Component } from 'react';
import { Schema, Form, Button, FormGroup, ControlLabel, ButtonToolbar, FormControl } from 'rsuite';
import { SocketConnector } from '../../socketConnector';

const { StringType } = Schema.Types;

const model = Schema.Model({
  email: StringType()
    .isEmail('Please enter a valid email address.')
    .isRequired('This field is required.'),
  password: StringType().isRequired('This field is required.')
});

class LoginForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      formValue: {
        email: '',
        password: ''
      },
      loginError: null
    };

    this.handleSignIn = this.handleSignIn.bind(this);
  }

  handleSignIn() {
    this.setState({
      loginError: null
    });

    const { formValue:customerData } = this.state;
    // TODO: some loader for form
    const isFormValid = this.form.check();
    if (isFormValid) {
      SocketConnector.login(customerData).then((result) => {
        if (!result) {
          this.setState({
            loginError: 'Sorry, your login or password is incorrect.'
          })
        }
      });
    }
  }

  render() {
    const { formValue, loginError } = this.state;

    return (
      <Form
        fluid
        ref={ref => (this.form = ref)}
        onChange={formValue => {
          this.setState({ formValue });
        }}
        formValue={formValue}
        model={model}
      >
        <div className="test"></div>
        <FormGroup className="ic_user">
          <ControlLabel>Email</ControlLabel>
          <FormControl name="email" errorPlacement="topStart"/>
        </FormGroup>
        <FormGroup className="ic_pw">
          <ControlLabel>Password</ControlLabel>
          <FormControl name="password" type="password" errorPlacement="bottomStart" errorMessage={loginError}/>
        </FormGroup>
        <FormGroup>
          <ButtonToolbar>
            <Button appearance="primary" onClick={this.handleSignIn}>
              Sign in
            </Button>
            <Button appearance="link">Forgot password?</Button>
          </ButtonToolbar>
        </FormGroup>
      </Form>
    );
  }
}

export default LoginForm;
