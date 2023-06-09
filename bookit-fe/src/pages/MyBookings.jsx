import React from 'react';
import Navbar from '../components/Navbar';
import { StoreContext } from '../utils/store';
import { fetchMyBookings } from '../utils/auxiliary';
import BookingListItem from '../components/BookingListItem';
import {
  Redirect,
} from 'react-router-dom';
import {
  makeStyles,
  Box,
  Container,
  Typography,
  CircularProgress,
  Button,
  ButtonGroup,
  Tooltip,
  Divider,
} from '@material-ui/core';

// Page styling used on the MyBookings screen and its subcomponents
const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  container: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    minHeight: '100vh',
    width: '100%',
    backgroundColor: theme.palette.background.default,
  },
  containerDiv: {
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'flex-start',
    width: '100%',
  },
  mytitleDiv: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    margin: theme.spacing(1),
  },
  mysubtitleDiv: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    marginLeft: '20px',
  },
  subtitleTextDiv: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'flex-start',
    marginLeft: '36px',
  },
  subtitleBtnDiv: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'flex-end',
  },
  btnGrp: {
    marginRight: '20px',
  },
  button: {
    margin: theme.spacing(1),
  },
  divider: {
    marginTop: '20px',
    height: '2px',
  },
  bookingsNotFoundDiv: {
    margin: '2em 0em',
  },
}));

// The MyBookings page allows the primary user to manage their upcoming & past
// bookings. Each Booking is represented by a BookingListItem subcomponent,
// which allowed the primary user to change their booking, provided it is more
// than 3 days away. Moreover, the primary user may also enter their reviews in
// the past bookings tab, which opens up the RatingDialog subcomponent, contained
// within east BookingListItem.
const MyBookings = () => {
  // state variables
  const context = React.useContext(StoreContext);
  const token = context.token[0];
  const baseUrl = context.baseUrl;
  const [mybookings, setMybookings] = context.mybookings;
  const updated = context.updates[0];
  React.useEffect(() => {
    if (token === null) {
      return <Redirect to={{ pathname: '/login' }} />
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [page, setPage] = context.pageState;
  const [loadingState, setLoadingState] = React.useState('idle');
  // toggle between upcoming and past bookings
  const [upcomingBtn, setUpcomingBtn] = React.useState(true);
  // sends a fetch API request to populate the primary user's bookings
  React.useEffect(() => {
    setPage('/mybookings');
    async function setupMyBookings () {
      setLoadingState('loading');
      await fetchMyBookings(baseUrl, token, setMybookings);
      setLoadingState('success');
    }
    setupMyBookings();
  }, [updated]); // eslint-disable-line react-hooks/exhaustive-deps
  // classes used for Material UI component styling
  const classes = useStyles();

  return (
    <Container>
      <Navbar page={page} />
      <Container className={classes.container}>
        {
          loadingState !== 'success' &&
          <div>
            <CircularProgress color="secondary" />
          </div>
        }
        {
          loadingState === 'success' &&
          <Box className={classes.containerDiv}>
            <Box className={classes.mytitleDiv}>
              <Box>
                <Typography align="left" variant="h4">
                  Bookings
                </Typography>
              </Box>
            </Box>
            <Box className={classes.mysubtitleDiv}>
              <Box className={classes.subtitleTextDiv}>
                <Typography component={'span'} align="center" variant="h6" color="textSecondary">
                  {upcomingBtn === true ? "Upcoming" : "Past"}
                </Typography>
              </Box>
              <Box className={classes.subtitleBtnDiv}>
                <ButtonGroup variant="text" color="primary" className={classes.btnGrp} >
                  <Tooltip title="Upcoming">
                    <Button
                      id="upcoming-bookings-button"
                      variant="text"
                      color={upcomingBtn === true ? "default" : "primary"}
                      className={classes.buttonText}
                      onClick={() => {
                        setUpcomingBtn(true);
                      }}
                    >
                      Upcoming
                    </Button>
                  </Tooltip>
                  <Tooltip title="Past">
                    <Button
                      id="past-bookings-button"
                      variant="text"
                      color={upcomingBtn === true ? "primary" : "default"}
                      className={classes.buttonText}
                      onClick={() => {
                        setUpcomingBtn(false);
                      }}
                    >
                      Past
                    </Button>
                  </Tooltip>
                </ButtonGroup>
              </Box>
            </Box>
            <Divider light className={classes.divider} />
            {
              upcomingBtn === true &&
              mybookings.upcoming?.length > 0 &&
              mybookings.upcoming.map((booking) => (
                <Box key={booking.booking_id}>
                  <BookingListItem booking={booking} upcoming={true} />
                </Box>
              ))
            }
            {
              upcomingBtn === true &&
              mybookings.upcoming?.length === 0 &&
              <Box className={classes.bookingsNotFoundDiv}>
                <Typography
                  component={'span'} align="center"
                  variant="body1" color="textSecondary"
                >
                  {`No upcoming Bookings found.`}
                </Typography>
              </Box>
            }            
            {
              upcomingBtn === false &&
              mybookings.past?.length > 0 &&
              mybookings.past.map((booking) => (
                <Box key={booking.booking_id}>
                  <BookingListItem booking={booking} upcoming={false} />
                </Box>
              ))
            }
            {
              upcomingBtn === false &&
              mybookings.past?.length === 0 &&
              <Box className={classes.bookingsNotFoundDiv}>
                <Typography
                  component={'span'} align="center"
                  variant="body1" color="textSecondary"
                >
                  {`No past Bookings found.`}
                </Typography>
              </Box>
            }
            <br />
            <br />
          </Box>
        }
      </Container>
    </Container>
  )
}

export default MyBookings;
