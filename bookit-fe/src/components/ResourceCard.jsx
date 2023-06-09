import React from 'react';
import PropTypes from 'prop-types';
import { StoreContext } from '../utils/store';
import { useHistory } from "react-router-dom";
import PlaceholderImage from '../assets/mountaindawn.png';
import CustomButton from './CustomButton';
import {
  makeStyles,
  Tooltip,
  Card,
  CardHeader,
  CardContent,
  CardMedia,
  CardActions,
  Avatar,
  Typography,
  Box,
  Link,
  Button,
  IconButton,
} from '@material-ui/core';
import { Link as RouterLink } from 'react-router-dom';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import ArrowRight from '@material-ui/icons/ArrowRight';
import RoomIcon from '@material-ui/icons/Room';
import Rating from '@material-ui/lab/Rating';
import axios from 'axios';
import styled from 'styled-components';
import { toast } from 'react-toastify';

const WhiteText = styled.span`
  color: white;
`

// Page styling used on the ResourceCard component
const useStyles = makeStyles((theme) => ({
  cardRoot: {
    maxWidth: 345,
    minWidth: 345,
    maxHeight: 650,
    minHeight: 650,
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
    paddingTop: '56.25%',
  },
  resourceCardActions: {
    justifyContent: 'space-between',
  },
  resourceCardCentered: {
    justifyContent: 'center',
    padding: 0,
  },
  resourceCardRating: {
    display: 'flex',
    justifyContent: 'center',
    padding: '8px 0px',
    margin: theme.spacing(0.5),
  },
  resourceCardDescDiv:{
    maxHeight: '100px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    height: '128px',
  },
  resourceCardDesc:{
    maxHeight: '100px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: "-webkit-box",
    "-webkit-line-clamp": 4,
    "-webkit-box-orient": "vertical",
  },
  locationContent: {
    padding: '6px 16px',
  },
  locationDiv: {
    display: 'flex',
    flexDirection: 'row',
    maxHeight: '40px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  locationIcon: {
    paddingRight: '4px',
    width: '16px',
    height: '16px',
  },
  locationText: {
    height: '56px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: "-webkit-box",
    "-webkit-line-clamp": 2,
    "-webkit-box-orient": "vertical",
  },
  categoryContent: {
    padding: '6px 16px',
  },
  categoryText: {
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: "-webkit-box",
    "-webkit-line-clamp": 1,
    "-webkit-box-orient": "vertical",
  },
}));

// class used for the Toastify error component styling
const toastErrorStyle = {
  backgroundColor: '#cc0000',
  opacity: 0.8,
  textAlign: 'center',
  fontSize: '18px'
};

// The ResourceCard component is a subcomponent representing a Listing
// and contains various information about a particular resource.
// The component itself requires the Listing as a Prop in order to render it.
// The contents include a title, default thumbnail image, resource owner,
// avg rating, address and brief description and relevant interaction buttons.
// A user may navigate to the Listing owner's profile by clicking on their username
// or navigate to the individiaul Listing page itself by clicking on the
// 'View Listing' button.
const ResourceCard = (
{
  resource, owner, parentPage, handleClickOpen
}) => {
  // state variables
  const context = React.useContext(StoreContext);
  const token = context.token[0];
  const baseUrl = context.baseUrl;
  const currPage = context.pageState[0];
  const user = context.username[0];
  const history = useHistory();
  const [availabilities, setAvailabilities] = React.useState([]);
  // sends an API fetch request to find the number of availabilities
  // a particular Listing may have
  React.useEffect(() => {
    async function fetchAvailabilities () {
      try {
        const response = await axios({
          method: 'GET',
          url: `${baseUrl}/availabilities?listing_id=${resource.listing_id}`,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            "Authorization": `JWT ${token}`,
          },
        })
        await setAvailabilities(response.data.availabilities);
      } catch(error) {
        console.log(error.response);
        let errorText = '';
        if (error.response.data.error !== undefined) {
          errorText = error.response.data.error;
        } else if (error.response.data.message !== undefined) {
          errorText = error.response.data.message;
        } else {
          errorText = 'Invalid input';
        }
        toast.error(
          errorText, {
            position: 'top-right',
            hideProgressBar: true,
            style: toastErrorStyle
          }
        );
        await setAvailabilities([]);
      }
    }
    if (parentPage !== '/listings/edit') {
      fetchAvailabilities();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // material UI styling
  const classes = useStyles();

  return (
    <Card className={classes.cardRoot}>
      {
        parentPage !== '/listings/edit' &&
        <CardHeader
          avatar={
            <Avatar aria-label="resource">
              {owner[0]}
            </Avatar>
          }
          title={
            <Typography
              variant="subtitle2"
              align="left"
              className={classes.categoryText}
            >
              {resource.listing_name}
            </Typography>
          }
          subheader={
            <Typography
              variant="subtitle2"
              color="textSecondary"
              align="left"
              className={classes.categoryText}
            >
              <Tooltip
                title={`View ${resource.username}'s profile`}
                placement="bottom-start"
              >
                <Link
                  component={RouterLink}
                  to={`/profile/${resource.username}`}
                >
                  {resource.username}
                </Link>
              </Tooltip>
            </Typography>
          }
        />
      }
      {
        parentPage === '/listings/edit' &&
        <CardHeader
          
          avatar={
            <Avatar aria-label="resource">
              {owner[0]}
            </Avatar>
          }
          title={
            <Typography 
              variant="subtitle2"
              align="left"
              className={classes.categoryText}
            >
              {resource.listing_name}
            </Typography>
          }
          subheader={
            <Typography
              variant="subtitle2"
              color="textSecondary"
              align="left"
              className={classes.categoryText}
            >
              {resource.username}
            </Typography>
          }
        />
      }

      <Tooltip title="Resource Image"
        aria-label="resource image"
      >
        <CardMedia
          id="resource-card-image"
          className={classes.media}
          image={
            resource.listing_image !== null
              ? resource.listing_image
              : PlaceholderImage
          }
          alt="Placeholder image"
        />
      </Tooltip>

      <CardContent className={classes.resourceCardRating}>
        <Tooltip
          title={
            parentPage !== '/listings/edit'
              ? `Average rating: ${resource.avg_rating}`
              : 'Average rating: 0'
          }
          placement="top"
        >
          <div>
            <Rating
              name="avg-rating"
              defaultValue={
                parentPage !== '/listings/edit'
                  ? resource.avg_rating
                  : 0
              }
              precision={0.1}
              readOnly
            />
          </div>
        </Tooltip>
      </CardContent>
      <CardContent className={classes.locationContent}>
        <Box className={classes.locationDiv}>
          <RoomIcon className={classes.locationIcon} />
          <Typography className={classes.locationText} paragraph align="left" variant="caption" component="p">
            {resource.address}
          </Typography>
        </Box>
      </CardContent>
      <CardContent className={classes.categoryContent}>
        <Typography component={'span'} className={classes.categoryText} align="left" variant="subtitle2" color="textSecondary">
          <WhiteText>Category / </WhiteText>
          {
            resource.category !== '' &&
            resource.category?.charAt(0).toUpperCase() + resource.category?.slice(1)
          }
          {
            resource.category === '' &&
            'None'
          }
        </Typography>
      </CardContent>
      <CardContent className={classes.resourceCardDescDiv}>
        <Typography className={classes.resourceCardDesc} paragraph align="left" variant="body2" color="textSecondary" component="p">
          {resource.description}
        </Typography>
      </CardContent>
      <CardContent className={classes.resourceCardCentered}>
        <Typography variant="overline" align="center" color="textPrimary" component="p">
          {
            parentPage !== '/listings/edit' &&
            `Availabilities: ${availabilities.length}`
          }
          {
            parentPage === '/listings/edit' &&
            'Availabilities: 0'
          }
        </Typography>
      </CardContent>
      <CardActions
        className={
          user === resource.username && parentPage === '/mylistings' ?
            classes.resourceCardActions :
            classes.resourceCardCentered
        }
      >
        {
          parentPage !== '/listings/edit' &&
          <Box>
            <CustomButton
              title={'View Listing'}
              ariaLabel={'listing'}
              id={'resource-card-listing-button'}
              variant={'contained'}
              color={'primary'}
              className={classes.button}
              endIcon={<ArrowRight />}
              onClick={() => {
                history.push({
                  pathname: `/listings/${resource.listing_id}`,
                  state: {
                    givenListingId: parseInt(resource.listing_id),
                  }
                })
              }}
            />
          </Box>
        }
        {
          parentPage === '/listings/edit' &&
          <Box>
            <Button
              id={'resource-card-listing-button-mock'}
              variant={'contained'}
              color={'primary'}
              className={classes.button}
              disabled={true}
              endIcon={<ArrowRight />}
            >
              View Listing
            </Button>
          </Box>
        }
        {
          user === resource.username &&
          parentPage !== '/search' &&
          parentPage !== '/listings/edit' &&
          <Box>
            <Tooltip title={'Edit'} aria-label={'edit'}>
              <IconButton
                id={'resource-card-edit-button'}
                color={'primary'}
                className={classes.button}
                onClick={() => {
                  history.push({
                    pathname: `/listings/edit/${resource.listing_id}`,
                    state: {
                      givenListingId: parseInt(resource.listing_id),
                      prevPage: currPage,
                    }
                  })
                }}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title={'Delete'} aria-label={'delete'}>
              <IconButton
                id={'resource-card-delete-button'}
                color={'secondary'}
                className={classes.button}
                onClick={() => handleClickOpen(resource.listing_id)}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        }
      </CardActions>
    </Card>
  );
}

ResourceCard.propTypes = {
  resource: PropTypes.object.isRequired,
  owner: PropTypes.string.isRequired,
  parentPage: PropTypes.string.isRequired,
  handleClickOpen: PropTypes.func,
};

export default ResourceCard;
