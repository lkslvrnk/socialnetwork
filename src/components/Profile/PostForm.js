import { Button, CardActions, Checkbox, ClickAwayListener, Dialog, DialogActions, DialogContent, IconButton, MenuItem, MenuList, Paper, Popper, TextField, Typography, useTheme } from '@material-ui/core'
import React, { useState, useRef } from 'react'
import { useDispatch } from 'react-redux'
import PhotoGallery from '../Common/PhotoGallery'
import { useStyles } from './PostFormStyles'
import AddPhotoDialog from '../Common/AddPhotoDialog'
import { useTranslation } from 'react-i18next'
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto'
import LinearProgress from '@material-ui/core/LinearProgress'
import SettingsIcon from '@material-ui/icons/Settings'
import EmojiPicker from '../Common/EmojiPicker'
import SentimentSatisfiedRoundedIcon from '@material-ui/icons/SentimentSatisfiedRounded'
import { imagesStorage } from '../../api/api'
import {
  createPostPhoto,
  getPostPhoto,
  editPost,
  patchPost
} from '../../redux/profile_posts_reducer'
import SimplePhotoGallery from '../Common/SimplePhotoGallery'
import { createSimpleGalleryPhoto } from '../../helper/helperFunctions'
import AcceptDialog from '../Common/AcceptDialog'

const PostForm = props => {
  const { onSubmit, editMode, setEditMode, text, currentAttachments, commentingIsDisabled, isPublic, onEditFinish, editingPostId} = props
  // console.log(currentAttachments)
  const openImageExplorer = () => {
    photoInput.current.click()
  }

  const [attachments, setAttachments] = useState(editMode ? [...currentAttachments] : [])
  const [postText, setPostText] = useState(editMode ? text : '')

  const theme = useTheme()
  const photoInput = React.useRef(null)
  const [addedPhotos, setAddedPhotos] = React.useState([])
  const [showAddPhotoDialog, setShowAddPhotoDialog] = useState(false)
  const dispatch = useDispatch();
  const [images, setImages] = React.useState([])
  const classes = useStyles({ 'matches800': true })
  const { t } = useTranslation();
  const [progressObjects, setProgressObjects] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [publicCheckboxIsChecked, setPublicCheckboxIsChecked] = useState(editMode ? isPublic : true)
  const [disableComments, setDisableComments] = useState(editMode ? commentingIsDisabled : false)
  const [error, setError] = useState('')
  const [photoUploadError, setPhotoUploadError] = useState(false)
  const [showErrorDialog, setShowErrorDialog] = useState(false)

  // console.log(attachments)

  let handleImageUpload = async (event) => {
    const files = event.target.files
    
    const pseudoFiles = []
    for (let i = 0; i < files.length; i++) {
      let file = files[i]
      const {type} = file
      
      if(!type) {
        continue
      }
      if((files.length + attachments.length) > 8) {
        setShowErrorDialog(t("Can't add more than 8 photos"))
        photoInput.current.value = ''
        return
      }
      if((type && type.endsWith('jpeg')) || (type.endsWith('png')) || (type.endsWith('jpg'))) { 
        let filename = file.name
        let fileId = file.name + Date.now()
        setProgressObjects(prev => {
          let progressInfo = {filename, loaded: 0, total: -1, fileId: fileId, percents: 0}
          return [...prev, progressInfo]
        })
        pseudoFiles.push({fileId: fileId, filename, type, realFile: file})
      }
      else {
        continue
      }
    }
    photoInput.current.value = ''

    for (let i = 0; i < pseudoFiles.length; i++) {
      let pseudoFile = pseudoFiles[i]
      
      try {
        let response = await dispatch(createPostPhoto(pseudoFile.realFile, () => {}))

        if(response.status === 201) {
          response = await dispatch(getPostPhoto(response.data.id))
          if(response.status === 200) {
            let returned = response.data.photo
            let photo = createSimpleGalleryPhoto(returned.id, returned.versions[2], returned.versions[0])
            setAttachments(prev => [...prev, photo])
            
            setProgressObjects(prev => {
              return prev.filter(prevProgress => {
                return prevProgress.fileId !== pseudoFile.fileId
              })
            })
          }
        }
      }
      catch(err) {
        setProgressObjects(prev => {
          return prev.filter(prevProgress => {
            return prevProgress.fileId !== pseudoFile.fileId
          })
        })
      } 
    }
  }

  const handleSubmit = async () => {
    if(isSubmitting || (!postText.length && !attachments.length)) {
      return
    }
    setIsSubmitting(true)
    setPhotoUploadError(false)
    let preparedAttachments = attachments.map(attachment => attachment.id)
    // console.log(preparedAttachments)

    if(editMode) {
      try {
        await dispatch(editPost(editingPostId, postText, preparedAttachments, Number(disableComments), Number(publicCheckboxIsChecked)))
        setError(null)
        setIsSubmitting(false)
        onEditFinish()
      } catch (e) {
        setError('Saving error')
        setIsSubmitting(false)
      }
    }
    else {
      onSubmit(postText, preparedAttachments, Number(publicCheckboxIsChecked), Number(disableComments), null)
      .then(
        () => {
          setAttachments([])
          setIsSubmitting(false)
          setPostText('')
        }
      )
    }
  }

  // const onDone = (selectedPhotos) => {
  //   let srcs = []
  //   let filteredSelected = []
  //   selectedPhotos.forEach(photo => {
  //     let inAddedPhotos = addedPhotos.filter(addedPhoto => photo.id === addedPhoto.id)[0]
  //     if (!inAddedPhotos) {
  //       filteredSelected.push(photo)
  //       srcs.push(photo)
  //     }
  //   })
  //   setImages([...images, ...srcs])
  //   setAddedPhotos([...addedPhotos, ...filteredSelected])
  // }

  const [postSettingsAnchor, setPostSettingsAnchor] = useState(null)

  const handleClickAwayPostSettings = () => {
    if(postSettingsAnchor) {
      setPostSettingsAnchor(null)
    }
  }

  const postSettings = (
    <ClickAwayListener onClickAway={ handleClickAwayPostSettings } >
      <div>
        <IconButton
          size='small'
          onClick={ (e) => setPostSettingsAnchor(e.currentTarget) }
        >
          <SettingsIcon style={{display: 'block'}} />
        </IconButton>

        <Popper
          open={Boolean(postSettingsAnchor)}
          anchorEl={postSettingsAnchor}
          placement='top'
          transition
          modifiers={{
            offset: {
              enabled: true,
              offset: '0, 12'
            }
          }}
        >
          <Paper elevation={3} >
            <MenuList dense >

              <MenuItem
                disableRipple
                style={{padding: 0, paddingRight: 8}}
                onClick={e => setPublicCheckboxIsChecked(prev => !prev)}
              >
                <div style={{display: 'flex', alignItems: 'center', }}>
                  <Checkbox checked={publicCheckboxIsChecked} />
                  <div>{t('Public')}</div>
                </div>
              </MenuItem>

              <MenuItem
                disableRipple
                style={{padding: 0, paddingRight: 8}}
                onClick={e => setDisableComments(prev => !prev)}
              >
                <div style={{display: 'flex', alignItems: 'center'}}>
                  <Checkbox checked={disableComments} />
                  <div>{t('Disable comments')}</div>
                </div>
              </MenuItem>

            </MenuList>
          </Paper>
        </Popper>
      </div>
    </ClickAwayListener>
  )
  
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
  const emojiPickerPopperAnchor = useRef(null)

  const onEmojiSelect = e => {
    setPostText(prev => prev += e.native)
  }

  const handleOnChange = (e) => {
    setPostText(e.target.value)
  }

  const toggleEmojiPicker = () => setShowEmojiPicker((prev) => !prev);

  const handleEmojiPickerClose = () => setShowEmojiPicker(false);

  let emojiPopper = (
    <Popper
      open={showEmojiPicker}
      anchorEl={emojiPickerPopperAnchor.current}
      transition
      modifiers={{ offset: { enabled: true, offset: '0, 10' } }}
    >
      <EmojiPicker
        show={true}
        onSelect={onEmojiSelect}
        onClose={handleEmojiPickerClose}
      />
    </Popper>
  )

  let pickEmoji = (
    <div>
      <SentimentSatisfiedRoundedIcon
        onClick={toggleEmojiPicker}
        style={{
          cursor: 'pointer',
          color: !showEmojiPicker
            ? theme.palette.action.disabled : null
        }}
        ref={emojiPickerPopperAnchor}
      />
      { emojiPopper }
    </div>
  )

  return (
    <div style={{ overflow: 'visible' }}>
      <div
        style={{
          padding: '0 8px',
          display: 'flex',
          position: 'relative'
        }}
      >
        <div style={{ width: '100%' }}>
          <TextField
            size='small'
            placeholder={ editMode ? '' : t('New post') }
            multiline
            fullWidth
            value={ postText }
            onChange={ handleOnChange }
            InputProps={{
              classes: { input: classes.resize, },
              style: { padding: 6, },
              endAdornment: pickEmoji
            }}
            onFocus={ e => {
              e.currentTarget.setSelectionRange(
                postText.length,
                postText.length
              )}
            }
          />
        </div>

      </div>

      <div style={{ padding: 8}}>

        <div style={{ marginBottom: 8}}>
          { progressObjects.map(e => {
            // Не работает onDownloadProgress при загрузке данных из сервера, поэтому не получается сделать на 100% правдивую шкалу,
            // поэтому я решил просто добавить анимацию загрузки без заполнения
            return <div key={e.fileId} style={{display: 'flex', alignItems: 'center', marginBottom: 8}}>
              <div style={{ marginRight: 16, wordBreak: 'break-all'}} >{e.filename}</div>
              <LinearProgress style={{width: 150, height: 10}} />
            </div>
          })}
        </div>

        <div>
          <SimplePhotoGallery
            passedImages={attachments ? attachments : []}
            editMode={true}
            spacing={1}
            imageBorderRadius={2}
            setAttachments={setAttachments}
          />
        </div>

      </div>

      <CardActions disableSpacing={true} >
        <div className={classes.addMedia}>
          <input
            accept='image/jpeg,image/png'
            className={classes.input}
            id='photo-input'
            multiple
            type='file'
            onChange={(event) => {
              handleImageUpload(event)
            }}
            ref={photoInput}
          />
          <div style={{marginLeft: 16, display: 'flex', alignItems: 'center'}}>
            <IconButton
              size='small'
              style={{marginRight: 16}}
              onClick={openImageExplorer}
            >
              <AddAPhotoIcon
                color={photoUploadError ? 'error' : 'action'}
              />
            </IconButton>
          </div>

          {/* { showAddPhotoDialog &&
            <AddPhotoDialog
              handleClose={() => setShowAddPhotoDialog(false)}
              onUploadFromStorage={handleImageUpload}
              show={showAddPhotoDialog}
              onDone={onDone}
            />
          } */}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
          <div style={{marginRight: 16}}>{ postSettings }</div>
          { editMode &&
            <Button disabled={ isSubmitting } style={{ marginRight: 16 }} onClick={ () => setEditMode(false) } >
              { t('Cancel') }
            </Button>
          }
          <Button
            variant='contained'
            disabled={isSubmitting || (!postText.length && !attachments.length) || progressObjects.length > 0}
            disableElevation
            style={{ textTransform: 'none'}}
            onClick={ handleSubmit }
          >
            { editMode ? t('Save') : t('Publicate')}
          </Button>
        </div>
      </CardActions>
      
      { isSubmitting && <LinearProgress /> }
      <Dialog
        onClose={() => setShowErrorDialog(false)}
        open={!!showErrorDialog}
      >
        <DialogContent >
          <Typography variant='body2'>{showErrorDialog}</Typography>
        </DialogContent>
        
        <DialogActions>
          <Button
            onClick={() => setShowErrorDialog(false)}
          >
            {t('Ok')}
          </Button>
        </DialogActions>
        
      </Dialog>

    </div>
  )
}

export default PostForm