import React from 'react';
import {connect} from 'react-redux'
import {compose} from 'redux'
import {setCommonError} from '../redux/app_reducer'
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import { IconButton, Snackbar } from '@material-ui/core';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const CommonError = props => {

  const handleClose = () => {
    props.setCommonError(null)
  }

  return (
    <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      open={props.error}
      autoHideDuration={6000}
      onClose={handleClose}
      message={props.error}
      action={
        <React.Fragment>
          <Button color="secondary" size="small" onClick={handleClose}>
            Refresh
          </Button>
          <IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </React.Fragment>
      }
    />
  )
}
let mapStateToProps = state => ({
  error: state.app.commonError
})

export default compose(connect(mapStateToProps, {setCommonError}))(CommonError);
