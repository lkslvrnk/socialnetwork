import React, { useRef, useState } from 'react';
import {connect, useDispatch} from 'react-redux'
import {compose} from 'redux'
import {updateCover} from '../../../redux/profile_reducer'
import Button from "@material-ui/core/Button";
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import ButtonWithCircularProgress from '../../Common/ButtonWithCircularProgress';
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import AcceptDialog from '../../Common/AcceptDialog';
import { useSnackbar } from 'notistack';
import { useStyles } from './CoverEditorStyles';

const CoverEditor = props => {
  let [selectedFile, setSelectedFile] = useState(null)
  let [selectedImage, setSelectedImage] = useState(null)
  let [showCancelDialog, setShowCancelDialog] = useState(false)
  let [scaleValue] = useState(0.3)
  const classes = useStyles()
  const { t } = useTranslation();
  const dispatch = useDispatch()
  const [cropper, setCropper] = useState()
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('xs'));
  const [isUpdating, setIsUpdating] = useState(false)
  const input = useRef(null)

  const profileImageChange = (event) => {
    const file = event.target.files[0]
    if(file) {
      const {type} = file
      if(type
        && (
          type.endsWith('jpeg')
          || type.endsWith('png')
          || type.endsWith('jpg')
        )
      ) {
        setSelectedFile(file)
        const reader = new FileReader()
        reader.onload = () => {
          setSelectedImage(reader.result)
        }
        reader.readAsDataURL(file)
      }
    }
  }

  React.useEffect(() => {
    if(!props.show) {
      setSelectedImage(null)
    }
  }, [props.show])

  let handleCloseAcceptDialog = () => {
    setShowCancelDialog(false)
    props.setShow(false)
    setSelectedImage(null)    
  }

  let handleOpenCancelDialog = () => {
    if(selectedImage) {
      setShowCancelDialog(true)
    } else {
      props.setShow(false)
    }
  }

  const { enqueueSnackbar } = useSnackbar()

  const onCrop = async () => {
    if (typeof cropper !== "undefined") {
      setIsUpdating(true)

      const data = cropper.getData()
      const x = data.x
      const y = data.y
      const width = data.width
      dispatch(updateCover(selectedFile, x, y, width, props.currentUserId))
        .then(
          () => setIsUpdating(false),
          (err) => {
            setIsUpdating(false)
            enqueueSnackbar(
              t('Cover was not created'),
              {variant: 'error'}
            )
          }
        )
    }
  }

  return (
    <Dialog
      onClose={isUpdating ? () => {} : handleOpenCancelDialog}
      open={props.show}
      fullScreen={selectedImage && matches}
    >
      { selectedImage &&
        <DialogTitle >
          {t('Select region')}
        </DialogTitle>
      }
      {selectedImage && 
        <div className={classes.cropper}>
          <Cropper
            style={{overflow: 'hidden'}}
            zoomTo={scaleValue}
            initialAspectRatio={3.03}
            aspectRatio={3.03}
            src={selectedImage}
            viewMode={1}
            minCropBoxHeight={10}
            background={false}
            responsive={true}
            autoCropArea={1}
            checkOrientation={false}
            onInitialized={(instance) => {
              setCropper(instance)
            }}
            guides={true}
            dragMode='move'
          />
          {isUpdating &&
            <div className={classes.disableCropper}/>
          }
        </div>
      }
      <DialogContent className={classes.dialogContent}>
        {!selectedImage &&
          <div className={classes.uploadPhoto} >
            <div style={{marginBottom: 16}}>
              {t('upload a cover')}
            </div>
            
            <input
              accept='image/jpeg,image/png'
              type='file'
              onChange={profileImageChange}
              style={{display: 'none'}}
              ref={input}
            />
            <Button
              variant='contained'
              onClick={() => input.current.click()}
            >
              {t('Select image')}
            </Button>
          </div>
        }
      </DialogContent>
      
      <DialogActions>
        {selectedImage && 
        <>
          <Button
            disabled={isUpdating}
            onClick={() => setSelectedImage(null)}
          >
            {t('Back')}
          </Button>

          <ButtonWithCircularProgress
            variant="contained" 
            onClick={onCrop}
            children={t('Save')}
            enableProgress={isUpdating}
            disabled={isUpdating}
          />
        </>
       }
      </DialogActions>
      <AcceptDialog
        show={showCancelDialog}
        setShow={setShowCancelDialog}
        onYes={handleCloseAcceptDialog}
        title={t('Discard changes')}
        text={t('You sure you want to discard changes?')}
      />
    </Dialog>
  )
}

let mapStateToProps = state => ({})

export default compose(
  connect(mapStateToProps),
)(CoverEditor);
