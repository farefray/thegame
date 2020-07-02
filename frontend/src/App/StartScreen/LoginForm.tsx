import React, { useContext, useState, useRef } from 'react';
import { Schema, Form, Button, FormGroup, ControlLabel, ButtonToolbar, FormControl, Loader } from 'rsuite';
import { WebSocketContext } from '../../socket.context';
import { newCustomerRegistration, customerLogin } from '@/firebase';

const { StringType } = Schema.Types;

const LoginFormModel = Schema.Model({
  email: StringType().isEmail('Please enter a valid email address.').isRequired('This field is required.'),
  password: StringType().isRequired('This field is required.')
});

enum VIEWMODE {
  LOGIN,
  REGISTRATION
}

/**
 * TODO confirmPassword and displayName upon registration
 */
function LoginForm() {
  const websocket = useContext(WebSocketContext);

  const [viewMode, setViewMode] = useState(VIEWMODE.LOGIN);
  const [isBusy, busy] = useState(false);
  const [formMessage, setFormMessage] = useState('');
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();

  let formRef = useRef<HTMLInputElement>(null);

  const handleSignIn = async () => {
    setFormMessage('');

    // @ts-ignore
    const isFormValid = formRef.check();
    if (isFormValid) {
      busy(true);

      const [error, user] = await customerLogin({ email, password });

      if (error) {
        setFormMessage(error);
        busy(false);
      }
    }
  };

  const handleRegistration = async () => {
    setFormMessage('');

    // @ts-ignore
    const isFormValid = formRef.check();
    if (isFormValid) {
      busy(true);

      const [error, user] = await newCustomerRegistration({ email, password });

      if (!user || error) {
        setFormMessage(error);
      } else {
        // @ts-ignore
        await websocket.emitMessage('NEW_CUSTOMER_REGISTRATION', user);
        setViewMode(VIEWMODE.LOGIN);
      }

      busy(false);
    }
  }

  return (
    <Form
      fluid
      ref={(ref) => (formRef = ref)}
      model={LoginFormModel}
      onChange={(formValue) => {
        setEmail(formValue.email);
        setPassword(formValue.password);
      }}
    >
      {isBusy && <Loader center backdrop />}
      <FormGroup className="ic_user">
        <ControlLabel>Email</ControlLabel>
        <FormControl name="email" errorPlacement="topStart" />
      </FormGroup>
      <FormGroup className="ic_pw">
        <ControlLabel>Password</ControlLabel>
        <FormControl name="password" type="password" errorPlacement="bottomStart" errorMessage={formMessage} />
      </FormGroup>
      <FormGroup>
        {viewMode === VIEWMODE.LOGIN ? (
          <ButtonToolbar>
            <Button appearance="default" onClick={handleSignIn}>
              Sign in
            </Button>
            <Button appearance="link" onClick={() => setViewMode(VIEWMODE.REGISTRATION)}>Registration</Button>
          </ButtonToolbar>
        ) : (
          <Button appearance="primary" onClick={handleRegistration}>
            Register
          </Button>
        )}
      </FormGroup>
    </Form>
  );
}

export default LoginForm;
