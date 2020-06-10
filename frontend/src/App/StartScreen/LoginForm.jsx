import React, { useContext, useState, useRef } from 'react';
import { Schema, Form, Button, FormGroup, ControlLabel, ButtonToolbar, FormControl } from 'rsuite';
import { WebSocketContext } from '../../socket.context';

const { StringType } = Schema.Types;

const LoginFormModel = Schema.Model({
  email: StringType()
    .isEmail('Please enter a valid email address.')
    .isRequired('This field is required.'),
  password: StringType().isRequired('This field is required.')
});

function LoginForm() {
  const ws = useContext(WebSocketContext);
  const [loginError, setLoginError] = useState(null);
  const [email, ] = useState();
  const [password, ] = useState();

  let loginFormRef = useRef();

  const handleSignIn = async () => {
    setLoginError(null);

    const customerData = { email, password }; // todo hash
    // TODO: some loader for form
    const isFormValid = loginFormRef.check();
    if (isFormValid) {
      // todo constants
      const loginResult = await ws.emitMessage('CUSTOMER_LOGIN_TRY', customerData);
      console.log("handleSignIn -> loginResult", loginResult)
      if (!loginResult) {
        setLoginError('Sorry, your login or password is incorrect.');
      }
    }
  }

  return (
    <Form
      fluid
      ref={ref => (loginFormRef = ref)}
      model={LoginFormModel}
    >
      <FormGroup className="ic_user">
        <ControlLabel>Email</ControlLabel>
        <FormControl name="email" errorPlacement="topStart"/>
      </FormGroup>
      <FormGroup className="ic_pw">
        <ControlLabel>Password</ControlLabel>
        <FormControl name="password" type="password" errorPlacement="bottomStart" errorMessage={loginError}/>
      </FormGroup>
      <div>*Any login credentials working at this point</div>
      <FormGroup>
        <ButtonToolbar>
          <Button appearance="primary" onClick={handleSignIn}>
            Sign in
          </Button>
          <Button appearance="link">Registration</Button>
        </ButtonToolbar>
      </FormGroup>
    </Form>
  );
}

export default LoginForm;
