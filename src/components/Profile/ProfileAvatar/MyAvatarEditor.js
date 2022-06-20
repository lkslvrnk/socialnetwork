import React, { useRef, useState } from 'react';
import Slider from '@material-ui/core/Slider';
import {connect, useDispatch} from 'react-redux'
import {compose} from 'redux'
import {updateAvatar, createPhoto} from '../../../redux/profile_reducer'
import Button from "@material-ui/core/Button";
import Input from '@material-ui/core/Input';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import YesCancelDialog from '../../Common/YesCancelDialog.js';
import { useTranslation } from 'react-i18next';
import AvatarEditor from 'react-avatar-editor'
import { useMediaQuery } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import ButtonWithCircularProgress from '../../Common/ButtonWithCircularProgress';
import AcceptDialog from '../../Common/AcceptDialog';
import { useSnackbar } from 'notistack';

const MyAvatarEditor = props => {
  let [selectedImage, setSelectedImage] = useState(null)
  let [showCancelDialog, setShowCancelDialog] = useState(false)
  let [scaleValue, setScaleValue] = useState(1)
  const { t } = useTranslation();
  const dispatch = useDispatch()

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('xs'));
  const [isUpdating, setIsUpdating] = useState(false)
  const input = useRef(null)

  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  const onScaleChange = (event, newValue) => {
    setScaleValue(newValue)
  }

  const profileImageChange = (event) => {
    const file = event.target.files[0]
    if(file) {
      const {type} = file
      if(type && (type.endsWith('jpeg') || type.endsWith('png') || type.endsWith('jpg'))) {
        setSelectedImage(file)
      }
    }
  }

  let editorRef = React.useRef(null)

  React.useEffect(() => {
    if(!props.show) {
      setSelectedImage(null)
    }
  }, [props.show])

  const minusInterval = React.useRef(null)

  let onMinusClick = () => {
    setScaleValue(prev => prev > 1 ? prev - 0.1 : prev)
  }

  let onMinusPress = () => {
    minusInterval.current = setInterval(() => {
      setScaleValue(prev => prev > 1 ? prev - 0.1 : prev)
    }, 100)
  }

  let onMinusPressEnd = () => {
    clearInterval(minusInterval.current)
  }

  const plusInterval = React.useRef(null)

  let onPlusClick = () => {
    setScaleValue(prev => prev < 10 ? prev + 0.1 : prev)
  }

  let onPlusPress = () => {
    plusInterval.current = setInterval(() => {
      setScaleValue(prev => prev < 10 ? prev + 0.1 : prev)
    }, 100)
  }

  let onPlusPressEnd = () => {
    clearInterval(plusInterval.current)
  }

  let close = () => {
    setShowCancelDialog(false)
    props.setShow(false)
    setSelectedImage(null)    
  }

  let openCancelDialog = () => {
    if(selectedImage) {
      setShowCancelDialog(true)
    } else {
      props.setShow(false)
    }
  }

  const onCrop = async () => {
    if(editorRef.current !== null) {
      setIsUpdating(true)

      let rect = editorRef.current.getCroppingRect()

      let img = new Image()
      img.src = window.URL.createObjectURL(selectedImage)

      img.onload = () => {
        let y = img.height * rect.y
        let x = img.width * rect.x
        let width = img.width * rect.width
        dispatch(updateAvatar(selectedImage, x, y, width, props.currentUserId))
          .then(
            () => setIsUpdating(false),
            (err) => {
              setIsUpdating(false)
              enqueueSnackbar('Avatar was not created', {variant: 'error'})
            }
          )
      } 
    }
  }

  return (
    <Dialog
      onClose={isUpdating ? () => {} : openCancelDialog}
      open={props.show}
      fullScreen={selectedImage && matches}
    >
      { selectedImage &&
        <DialogTitle >
          {t('Select region')}
        </DialogTitle>
      }
        
      {selectedImage && 
        <div style={{display: 'flex', justifyContent: 'center', position: 'relative'}}>
          {isUpdating && <div style={{position: 'absolute', top: 0, bottom: 0, left: 0, right: 0}}/>}
          <AvatarEditor
            ref={editorRef}
            image={selectedImage}
            width={300}
            height={300}
            border={[8, 8]}
            color={[255, 255, 255, 0.8]}
            scale={scaleValue}
            borderRadius={1100}
          />
        </div>
      }
      <DialogContent style={{flexGrow: 0, overflow: 'visible'}}>
        {selectedImage && 
          <div style={{display: 'flex', alignItems: 'center'}}>
            <IconButton
              onMouseDown={onMinusPress}
              onMouseUp={onMinusPressEnd}
              onClick={onMinusClick}
              children={<RemoveIcon />}
              disabled={isUpdating}
            />
            <Slider
              step={0.1}
              min={1}
              max={10}
              value={scaleValue}
              onChange={onScaleChange} 
              aria-labelledby="continuous-slider"
              style={{margin: '0 8px'}}
              disabled={isUpdating}
            />
            <IconButton
              onMouseDown={onPlusPress}
              onMouseUp={onPlusPressEnd}
              onClick={onPlusClick}
              children={<AddIcon />}
              disabled={isUpdating}
            />
          </div>
        }
        {!selectedImage &&
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <div style={{marginBottom: 16}}>
              {t('upload an avatar')}
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
              {t('Select a file')}
            </Button>
          </div>
        }
      </DialogContent>
      <DialogActions>
      {selectedImage && 
        <>
          <Button 
            onClick={() => setSelectedImage(null)}
            disabled={isUpdating}
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
        onYes={close}
        title={t('Discard changes')}
        text={t('You sure you want to discard changes?')}
      />
    </Dialog>
  )
}

let mapStateToProps = state => ({})

export default compose(
  connect(mapStateToProps, { updateAvatar, createPhoto }),
)(MyAvatarEditor);
