import React from 'react';
import BookitLogo from '../assets/bookit-logo.png';
import { useHistory } from 'react-router-dom';
import { useForm, Controller, appendErrors } from 'react-hook-form';
import { StoreContext } from '../utils/store';
import {
  makeStyles,
  Container,
  Button,
  Box,
  TextField,
  FormControl,
  Tooltip
} from '@material-ui/core';
import axios from 'axios';
import { toast } from 'react-toastify';

// Page styling used on the Login page and its subcomponents
const useStyles = makeStyles((theme) => ({
  container: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    paddingTop: '50px',
    paddingBottom: '50px',
    alignItems: 'center',
    color: 'white',
    backgroundColor: theme.palette.background.default,
  },
  logo: {
    display: 'flex',
    margin: '20px',
    justifyContent: 'center',
    maxHeight: '250px',
    maxWidth: '266px',
  },
  img: {
    maxHeight: '250px',
    maxWidth: '266px',
  },
  box: {
    display: 'flex',
    margin: theme.spacing(1),
  },
  button: {
    margin: theme.spacing(1),
    width: '12em',
  },
  textarea: {
    color: '#648dae'
  },
  toasty: {
    textAlign: 'center',
    justifyContent: 'center',
    alignContent: 'center',
  }
}));

// The Login page prompts the user to enter their email and password,
// which are both validated upon input. Appropriate error messages are shown
// using Toastify when incorrect input is detected, or if invalid details
// are submitted. If a user does not have an account, a button exists
// 'New User' which takes the user to the Register page allowing them to
// create a new account in order to log in successfully in the future.
const Login = () => {
  // context variables used throughout the page
  const context = React.useContext(StoreContext);
  const setToken = context.token[1];
  const baseUrl = context.baseUrl;
  const setPage = context.pageState[1];
  const history = useHistory();
  // class used for the Toastify error component styling
  const toastErrorStyle = {
    backgroundColor: '#cc0000',
    opacity: 0.8,
    textAlign: 'center',
    fontSize: '18px'
  };
  // useForm hook comes from react-hook-form, which handles user input
  // and controls form submission
  const { handleSubmit, control } = useForm();
  const onSubmit = (data) => {

    console.log('entered data is:');
    console.log(data);

    // Check for empty fields
    if (data.email === '') {
      toast.error(
        'Please enter your Email address', {
          position: 'top-right',
          hideProgressBar: true,
          style: toastErrorStyle
        }
      );
    } else if (data.password === '') {
      toast.error(
        'Please enter your Password', {
          position: 'top-right',
          hideProgressBar: true,
          style: toastErrorStyle
        }
      );
    } else {
      // Post a Login request
      axios({
        method: 'POST',
        url: `${baseUrl}/auth`,
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
        data: {
          email: data.email,
          password: data.password
        }
      })
        .then((response) => {
          // store the authorization token

          console.log(response);
          alert('Success! :)');

          // setToken(response.data.token);
          // // navigate to the Dashboard screen
          // history.push('/dashboard');

        })
        .catch((error) => {
          let errorText = '';
          error.response.data.error !== undefined
            ? errorText = error.response.data.error
            : errorText = 'Invalid input'
          toast.error(
            errorText, {
              position: 'top-right',
              hideProgressBar: true,
              style: toastErrorStyle
            }
          );
        })
    }
  };
  // the useEffect hook simply sets the page variable to the login page itself
  React.useEffect(() => {
    setPage('/login');
  }, []);
  const registerScreenButton = () => {
    // redirect user to the Register page
    history.push('/register');
  };
  // classes used for Material UI component styling
  const classes = useStyles();
  return (
    <Container className={classes.container}>
      <Box className={classes.logo}>
        <Tooltip title="Bookit" aria-label="bookit logo">
          <img className={classes.img} src={BookitLogo} alt="Bookit Logo" />
        </Tooltip>
      </Box>
      <br />
      <Box>
        <h2>BookIt Login</h2>
      </Box>
      <br />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box className={classes.box}>
          <FormControl>
            <Controller
              name="email"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  label="Email"
                  {...field}
                />
              )}
            />
          </FormControl>
        </Box>
        <Box className={classes.box}>
          <FormControl>
            <Controller
              name="password"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  type="password"
                  label="Password"
                  color="secondary"
                  {...field}
                />
              )}
            />
          </FormControl>
        </Box>
        <br />
        <Tooltip title="Login" aria-label="log in">
          <Button
            className={classes.button}
            variant="outlined" color="secondary" type="submit"
          >
            Login
          </Button>
        </Tooltip>
      </form>
      <Box className={classes.box}>
        <Tooltip title="New User" aria-label="new user">
          <Button
            className={classes.button}
            variant="outlined"
            color="primary"
            onClick={registerScreenButton}
          >
            New User
          </Button>
        </Tooltip>
      </Box>
      <br />
    </Container>
  );
}

export default Login;