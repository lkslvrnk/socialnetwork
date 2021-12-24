import React, {useState, useEffect} from 'react'
import { Button, GridList, GridListTile, GridListTileBar, Typography, Divider } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitleWithCloseButton from './DialogTitleWithCloseButton';
import {useTranslation} from 'react-i18next';
import { makeStyles} from "@material-ui/core/styles";
import {getAlbums, getPhotos} from '../../redux/photos_reducer'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {baseUrl} from '../../api/api'
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import StorageIcon from '@material-ui/icons/Storage';
import PhotoCameraIcon from '@material-ui/icons/PhotoCamera';
import PhotoGallery from './PhotoGallery';
import Skeleton from '@material-ui/lab/Skeleton';

const useStyles = makeStyles(theme => ({
  input: {
    display: 'none'
  },
}));

const AddPhotoDialog = (props) => {
  const {show, onUploadFromStorage, onCaptureFromCamera, handleClose, albums, photos, photosAreLoaded, onDone} = props
  const { t } = useTranslation();
  const classes = useStyles();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const bigTileHeight = useMediaQuery(theme.breakpoints.up('sm'));
  const [selectedPhotos, setSelectedPhotos] = useState([])

  useEffect(() => {
    return () => console.log('UNMOUNT')
  }, [])


  const onSelect = (src) => {
    console.log(selectedPhotos)
    let inArray = selectedPhotos.filter(photo => photo.src === src)[0]
    if(inArray) {
      setSelectedPhotos(selectedPhotos.filter(photo => photo.src !== src))
    } else {
      console.log(photos)
      let inPhotos = photos.filter(photo => photo.src === src)[0]
      setSelectedPhotos([...selectedPhotos, {src: src, id: inPhotos.id}])
    }
  }

  const photoInput = React.useRef(null)

  return (
    <Dialog
      fullScreen={fullScreen}
      fullWidth
      maxWidth={'md'}
      onClose={handleClose}
      aria-labelledby="simple-dialog-title"
      open={show}
    >
      <DialogTitleWithCloseButton
        onClose={handleClose}
        children={t('Select photo')}
      />
      <Divider />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          padding: 8
        }}
      >
        <input
          accept='image/*'
          className={classes.input}
          id='photo-input'
          multiple
          type='file'
          onChange={(event) => {
            setSelectedPhotos([])
            onUploadFromStorage(event)
            handleClose()
          }}
          ref={photoInput}
        />
        <Button
          size='large'
          startIcon={<StorageIcon />}
          onClick={() => photoInput.current.click()}
          disableRipple
        >
          {t('Upload from storage')}
        </Button>
        
        <Button
          disableRipple
          size='large'
          onClick={onCaptureFromCamera}
          startIcon={<PhotoCameraIcon />}
        >
          {t('Capture from camera')}
        </Button>

      </div>

      <DialogContent dividers>
        <div
          style={{
            paddingBottom: 16,
            display: 'flex',
             justifyContent: 'space-between'
          }}
        >
          <Typography variant='h6'>{t('Albums')}</Typography>
        </div>
        <GridList 
          cellHeight={bigTileHeight ? 180 : 120}
          cols={3}
          className={classes.gridList}
        >
          {albums.map((tile) => {
            let cover = tile.cover ? `${baseUrl}/images/${tile.cover}` : `${baseUrl}/images/standard/camera_big.png`

            return (
              <GridListTile key={'https://sun1-85.userapi.com/pdQx1hTWTJgINbW4DqWO4OW0-NcNgnzTu17f7g/HA1zSAj_b6U.jpg'}>
              <img src={cover} alt={tile.name} />
                <GridListTileBar
                  title={tile.name}
                  subtitle={<span>{t('Count')}: {tile.photosCount}</span>}
                />
              </GridListTile>
            )
          })}
        </GridList>
        <Divider />
        <div
          style={{
            paddingTop: 16,
            paddingBottom: 16,
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          <Typography variant='h6'>{t('All photos')}</Typography>
        </div>
        {photosAreLoaded ?
          <div
            style={{
              minWidth: photos.length > 0 && 200
            }}
          >
            <PhotoGallery
              grid={true}
              columnsCount={4}
              images={photos}
              selectMode={true}
              spacing={1}
              imageBorderRadius={2}
              onSelect={onSelect}
            />
          </div>
          :
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            {[1, 2, 3, 4].map(el => <Skeleton animation='pulse' width={'24.5%'} height={120} variant="rect"/> )}
          </div>          
        }
      </DialogContent>
      <DialogActions>
        <Button
          disableRipple
          size='large'
          variant='outlined'
          onClick={() => {
            onDone([...selectedPhotos])
            setSelectedPhotos([])
            handleClose()
          }}
        >
          {t('Done')}
        </Button>
      </DialogActions>
      
    </Dialog>
  )
}

let mapStateToProps = state => {
  return {
    albums: state.photos.albums,
    albumsAreLoaded: state.photos.albumsAreLoaded,
    currentUserId: state.auth.id,
    photos: state.photos.photos,
    photosAreLoaded: state.photos.photosAreLoaded,
  }
}

let functions = {
  getAlbums, getPhotos
}

export default compose(
  connect(mapStateToProps, functions),
)(AddPhotoDialog);