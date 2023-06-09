import React from 'react';
import Navbar from '../components/Navbar';
import ResourceCard from '../components/ResourceCard';
import DeleteDialog from '../components/DeleteDialog';
import { StoreContext } from '../utils/store';
import { fetchMyListings } from '../utils/auxiliary';
import {
  useHistory,
  Redirect,
} from 'react-router-dom';
import {
  makeStyles,
  Container,
  Box,
  Button,
  Grid,
  Typography,
  Tooltip,
  CircularProgress,
  Divider,
} from '@material-ui/core';
import Add from '@material-ui/icons/Add';

// Page styling used on the MyListings screen and its subcomponents
const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  cardRoot: {
    maxWidth: 345,
    minWidth: 345,
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
    alignContent: 'flex-start',
    width: '100%',
    justifyContent: 'center',
  },
  outerContainerBtns: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  mytitleDiv: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    margin: theme.spacing(1),
  },
  titleSubcontainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  titleHeadingDiv: {
    paddingRight: '10px',
  },
  button: {
    margin: theme.spacing(1),
    paddingBottom: '8px',
  },
  resourceBorder: {
    margin: theme.spacing(1),
    border: '1px solid #000',
    boxShadow: theme.shadows[5],
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9 ratio
  },
  image: {
    height: '128px',
    width: '128px',
    margin: 'auto',
  },
  resourceCardActions: {
    justifyContent: 'space-between',
  },
  resourceCardCentered: {
    justifyContent: 'center',
  },
  locationDiv: {
    display: 'flex',
    flexDirection: 'row',
  },
  locationIcon: {
    paddingRight: '4px',
    width: '16px',
    height: '16px',
  },
  listingsNotFoundDiv: {
    margin: '2em 0em',
  },
  divider: {
    margin: '1em 0em',
    height: '2px',
  },
}));

// The MyListings page allows the primary user to create a new listing, redirecting
// to the EditListing page, and also populates the page with their existing
// Listings as Resource Card subcomponents. This allows for efficient navigation
// to one's managing one's own Listings all in one place.
const MyListings = () => {
  const context = React.useContext(StoreContext);
  const token = context.token[0];
  const history = useHistory();
  const baseUrl = context.baseUrl;
  React.useEffect(() => {
    if (token === null) {
      return <Redirect to={{ pathname: '/login' }} />
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // state variables
  const username = context.username[0];
  const [mylistings, setMylistings] = context.mylistings;
  const [page, setPage] = context.pageState;
  const [loadingState, setLoadingState] = React.useState('idle');
  // updated ensures appropriate re-rendering upon changing or deleting a resource
  const updated = context.updates[0];
  // used for the delete dialog
  const [open, setOpen] = React.useState(false);
  // listid represents the current listing id which the user may want to delete
  const [listid, setListid] = React.useState(null);
  // state variables used for the DeleteDialog modal
  const handleClickOpen = (id) => {
    setListid(id);
    setOpen(true);
  };
  const handleClose = () => {
    setListid(null);
    setOpen(false);
  };

  React.useEffect(() => {
    setPage('/mylistings');
    async function setupMyListings () {
      setLoadingState('loading');
      await fetchMyListings(baseUrl, token, setMylistings);
      setLoadingState('success');
    }
    setupMyListings();
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
              <Box className={classes.titleSubcontainer}>
                <Box className={classes.titleHeadingDiv}>
                  <Typography gutterBottom paragraph align="left" variant="h4">
                    Your Listings
                  </Typography>
                </Box>
                <Box className={classes.outerContainerBtns}>
                  <Tooltip title="Create New Listing" aria-label="new listing">
                    <Button
                      id="new-listing-button"
                      className={classes.button}
                      variant="contained"
                      color="primary"
                      endIcon={<Add />}
                      onClick={() => {
                        history.push({
                          pathname: `/listings/create`,
                          state: {
                            prevPage: '/mylistings'
                          }
                        })
                      }}
                    >
                      New Listing
                    </Button>
                  </Tooltip>
                </Box>
              </Box>
              <Divider light className={classes.divider} />
            </Box>
            {
              mylistings.length > 0 &&
              <Grid className={classes.root} container spacing={2}>
                <Grid item xs={12}>
                  <Grid container justify="center" spacing={2}>
                    {mylistings.map((listing) => (
                      <Grid key={listing.listing_id} item>
                        <ResourceCard
                          resource={listing}
                          owner={username}
                          parentPage={`/mylistings`}
                          handleClickOpen={handleClickOpen}
                        />
                        <DeleteDialog
                          open={open} handleClose={handleClose} deleteId={parseInt(listid)}
                          page="/mylistings" item="Listing"
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              </Grid>
            }
            {
              mylistings?.length === 0 &&
              <Box className={classes.listingsNotFoundDiv}>
                <Typography
                  component={'span'} align="center"
                  variant="body1" color="textSecondary"
                >
                  {`No Listings found. Try creating a new Listing.`}
                </Typography>
              </Box>
            }
          </Box>
        }
      </Container>
      <br />
    </Container>
  )
}

export default MyListings;
