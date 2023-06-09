import React from 'react';
import { StoreContext } from '../utils/store';
import { useHistory } from 'react-router-dom';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@material-ui/core';
import PropTypes from 'prop-types';
import axios from 'axios';
import { toast } from 'react-toastify';

// The DeleteDialog component is a Material UI dialog wrapper which takes in
// props as state handlers, and a relevant item id. The user is promtped
// whether they would like to confirm the deletion of a particular item,
// and upon confirmation an API DELETE request is sent.
const DeleteDialog = ({ open, handleClose, deleteId, page, item, deleteUuid }) => {
  // state variables
  const context = React.useContext(StoreContext);
  const token = context.token[0];
  const baseUrl = context.baseUrl;
  const [updated, setUpdate] = context.updates;
  const history = useHistory();
  // the API URL depends on the item prop
  let deleteUrl = `${baseUrl}/listings/${deleteId}`;
  if (item === "Availability") {
    deleteUrl = `${baseUrl}/availabilities/${deleteId}`;
  } else if (item === "Booking") {
    deleteUrl = `${baseUrl}/bookings/${deleteUuid}`;
  } else if (item === "Review") {
    deleteUrl = `${baseUrl}/ratings/${deleteId}`;
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
    >
      <DialogTitle id="delete-dialog-title">{`Delete ${item}`}</DialogTitle>
      <DialogContent>
        <DialogContentText id="delete-dialog-description">
          {`Deleting this ${item} is irreversible. Are you sure you want to delete it?`}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          title="Delete"
          color="secondary"
          onClick={async () => {
            await axios({
              method: 'DELETE',
              url: deleteUrl,
              headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                "Authorization": `JWT ${token}`,
              },
            })
              .catch((error) => {
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
                    style: {
                      backgroundColor: '#cc0000',
                      opacity: 0.8,
                      textAlign: 'center',
                      fontSize: '18px'
                    }
                  }
                );
              })
            setUpdate(!updated);
            handleClose();
            if (item !== "Availability" && page !== '/mylistings' && page !== '/mybookings') {
              history.push('/mylistings');
            }
          }}
        >
          Delete
        </Button>
        <Button title="Cancel" onClick={handleClose} color="primary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}

DeleteDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  deleteId: PropTypes.number,
  page: PropTypes.string,
  item: PropTypes.string.isRequired,
  deleteUuid: PropTypes.string,
};

export default DeleteDialog;
