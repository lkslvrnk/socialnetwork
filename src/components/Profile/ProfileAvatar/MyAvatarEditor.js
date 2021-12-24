import React from 'react';
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
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  root: {
    ...theme.styles.flexColumnScratch,
  },
}));

const MyAvatarEditor = props => {
  let [selectedImage, setSelectedImage] = React.useState(null)
  let [showCancelDialog, setShowCancelDialog] = React.useState(false)
  let [scaleValue, setScaleValue] = React.useState(1)
  let classes = useStyles()
  const { t } = useTranslation();
  const dispatch = useDispatch()

  function dataURItoBlob (dataURI) {
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0) {
      byteString = atob(dataURI.split(',')[1]);
    } else {
      byteString = unescape(dataURI.split(',')[1]);
    }
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], {type: mimeString});
  }

  const onScaleChange = (event, newValue) => {
    setScaleValue(newValue)
  }

  const profileImageChange = (event) => {
    const file = event.target.files[0]
    if(file) {
      const {type} = file
      if(type && type.endsWith('jpeg') || type.endsWith('png') || type.endsWith('jpg')) {
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

  let onMinus = () => {
    if(scaleValue > 1) setScaleValue(scaleValue - 0.1)
  }

  let onPlus = () => {
    if(scaleValue < 10) setScaleValue(scaleValue + 0.1)
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

  const onCrop = () => {
    if(editorRef.current !== null) {
      const url = editorRef.current.getImageScaledToCanvas().toDataURL()
      let rect = editorRef.current.getCroppingRect()

      let img = new Image()
      img.src = window.URL.createObjectURL(selectedImage)

      img.onload = () => {
        let y = img.height * rect.y
        let x = img.width * rect.x
        let width = img.width * rect.width
        dispatch(updateAvatar(selectedImage, x, y, width, props.currentUserId))
      } 
    }
  }

  return (
    <Dialog
      onClose={openCancelDialog}
      open={props.show}
    >
      <DialogTitle >{selectedImage ? t('Select region') : t('Select image')}</DialogTitle>
        {selectedImage && 
        <AvatarEditor
          ref={editorRef}
          image={selectedImage}
          width={250}
          height={250}
          border={[70, 30]}
          color={[255, 255, 255, 0.6]}
          scale={scaleValue}
          borderRadius={1100}
        />}

      <DialogContent>
        {selectedImage && 
          <div style={{display: 'flex', alignItems: 'center'}}>
            <IconButton size="small" onClick={onMinus} children={<RemoveIcon />} />
              <Slider
                step={0.1}
                min={1}
                max={10}
                value={scaleValue}
                onChange={onScaleChange} 
                aria-labelledby="continuous-slider"
                style={{margin: '0 8px'}}
              />
            <IconButton size="small" onClick={onPlus} children={<AddIcon />} />
          </div>
        }
        {!selectedImage && <Input type='file' accept="image/png, image/jpeg" onChange={profileImageChange}/>}
      </DialogContent>
      <DialogActions>
      {selectedImage && 
        <>
          <Button 
            variant="contained" 
            onClick={() => setSelectedImage(null)}
          >
            {t('Back')}
          </Button>

          <Button
            variant="contained" 
            onClick={onCrop} 
          >
            {t('Save')}
          </Button>
        </>
       }
      </DialogActions>
      <YesCancelDialog
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
