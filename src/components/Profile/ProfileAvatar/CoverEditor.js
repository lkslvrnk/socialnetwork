import React, { useRef, useState } from 'react';
import Slider from '@material-ui/core/Slider';
import {connect, useDispatch} from 'react-redux'
import {compose} from 'redux'
import {updateCover} from '../../../redux/profile_reducer'
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
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";

const CoverEditor = props => {
  let [selectedFile, setSelectedFile] = useState(null)
  let [selectedImage, setSelectedImage] = useState(null)
  const [cropData, setCropData] = useState("#");
  let [showCancelDialog, setShowCancelDialog] = useState(false)
  let [scaleValue, setScaleValue] = useState(0.3)
  const { t } = useTranslation();
  const dispatch = useDispatch()
  const [cropper, setCropper] = useState()
  const defaultSrc = "https://img2.akspic.ru/previews/5/7/1/6/6/166175/166175-gubka_bob-multfilm-multik-bikini_bottom-nikelodeon-500x.jpg";
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('xs'));
  const [isUpdating, setIsUpdating] = useState(false)
  const input = useRef(null)

  const onScaleChange = (event, newValue) => {
    setScaleValue(newValue)
  }

  const profileImageChange = (event) => {
    const file = event.target.files[0]
    if(file) {
      const {type} = file
      if(type && (type.endsWith('jpeg') || type.endsWith('png') || type.endsWith('jpg'))) {
        setSelectedFile(file)
        const reader = new FileReader();
        reader.onload = () => {
          setSelectedImage(reader.result)
        };
        reader.readAsDataURL(file);
      }
    }
  }

  React.useEffect(() => {
    if(!props.show) {
      setSelectedImage(null)
    }
  }, [props.show])

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
    if (typeof cropper !== "undefined") {
      setIsUpdating(true)

      const data = cropper.getData()
      const x = data.x
      const y = data.y
      const width = data.width
      dispatch(updateCover(selectedFile, x, y, width, props.currentUserId))
        .then(
          () => setIsUpdating(false),
          () => setIsUpdating(false),
        )
    }
  }

  const getCropData = () => {
    if (typeof cropper !== "undefined") {
      console.log(cropper.getData())
      setCropData(cropper.getCroppedCanvas().toDataURL());
    }
  };

  return (
    <Dialog
      onClose={openCancelDialog}
      open={props.show}
      fullScreen={selectedImage && matches}
    >
      <DialogTitle >
        {selectedImage
          ? t('Select region')
          : t('Select image')
        }
      </DialogTitle>
        {selectedImage && 
          <div style={{ maxWidth: 800 }}>
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
                setCropper(instance);
              }}
              guides={true}
              dragMode='move'
            />
          </div>
        }
      <DialogContent>
        {!selectedImage &&
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <div style={{marginBottom: 16}}>
              {t('Please upload a photo, we support JPG and PNG files')}
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
  connect(mapStateToProps),
)(CoverEditor);
