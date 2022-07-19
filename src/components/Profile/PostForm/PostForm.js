import {
  Button, CardActions, Checkbox, ClickAwayListener, Dialog, DialogActions,
  DialogContent, IconButton, ListItemText, MenuItem, MenuList, Paper,
  Popper, TextField, Typography, useTheme
} from '@material-ui/core'
import React, { useState, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { useStyles } from './PostFormStyles'
import { useTranslation } from 'react-i18next'
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto'
import LinearProgress from '@material-ui/core/LinearProgress'
import SettingsIcon from '@material-ui/icons/Settings'
import EmojiPicker from '../../Common/EmojiPicker'
import SentimentSatisfiedRoundedIcon from '@material-ui/icons/SentimentSatisfiedRounded'
import {
  createPostPhoto,
  getPostPhoto,
  editPost
} from '../../../redux/profile_posts_reducer'
import SimplePhotoGallery from '../../Common/SimplePhotoGallery'
import { createSimpleGalleryPhoto } from '../../../helper/helperFunctions'

const PostForm = props => {
  const {
    onSubmit, editMode, setEditMode, text, currentAttachments,
    commentingIsDisabled, isPublic, onEditFinish, editingPostId
  } = props

  const [
    attachments, setAttachments
  ] = useState(editMode ? [...currentAttachments] : [])
  const [postText, setPostText] = useState(editMode ? text : '')
  const theme = useTheme()
  const photoInput = React.useRef(null)
  const dispatch = useDispatch();
  const classes = useStyles({ 'matches800': true })
  const { t } = useTranslation();
  const [progressObjects, setProgressObjects] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [
    publicCheckboxIsChecked, setPublicCheckboxIsChecked
  ] = useState(editMode ? isPublic : true)
  const [
    disableComments,
    setDisableComments
  ] = useState(editMode ? commentingIsDisabled : false)
  const [photoUploadError, setPhotoUploadError] = useState(false)
  const [showErrorDialog, setShowErrorDialog] = useState(false)

  const openImageExplorer = () => photoInput.current.click()

  let handleImageUpload = async (event) => {
    const files = event.target.files

    const fileObjects = []
    for (let i = 0; i < files.length; i++) {
      let file = files[i]
      const { type } = file

      if (!type) continue

      if ((files.length + attachments.length) > 8) {
        setShowErrorDialog(t("Can't add more than 8 photos"))
        photoInput.current.value = ''
        return
      }
      if ((type && type.endsWith('jpeg'))
        || (type.endsWith('png'))
        || (type.endsWith('jpg'))
      ) {
        let filename = file.name
        let fileId = file.name + Date.now()
        setProgressObjects(prev => {
          let progressInfo = {
            filename,
            loaded: 0,
            total: -1,
            fileId,
            percents: 0
          }
          return [...prev, progressInfo]
        })
        fileObjects.push({ fileId: fileId, filename, type, realFile: file })
      }
      else {
        continue
      }
    }
    photoInput.current.value = ''

    for (let i = 0; i < fileObjects.length; i++) {
      let fileObject = fileObjects[i]

      try {
        let response = await dispatch(createPostPhoto(fileObject.realFile, () => { }))

        if (response.status === 201) {
          response = await dispatch(getPostPhoto(response.data.id))
          if (response.status === 200) {
            let returned = response.data.photo
            let photo = createSimpleGalleryPhoto(
              returned.id, returned.versions[2], returned.versions[0]
            )
            setAttachments(prev => [...prev, photo])

            setProgressObjects(prev => {
              return prev.filter(prevProgress => {
                return prevProgress.fileId !== fileObject.fileId
              })
            })
          }
        }
      }
      catch (err) {
        setProgressObjects(prev => {
          return prev.filter(prevProgress => {
            return prevProgress.fileId !== fileObject.fileId
          })
        })
      }
    }
  }

  const handleSubmit = async () => {
    if (isSubmitting || (!postText.length && !attachments.length)) {
      return
    }
    setIsSubmitting(true)
    setPhotoUploadError(false)
    let preparedAttachments = attachments.map(attachment => attachment.id)

    if (editMode) {
      try {
        await dispatch(editPost(
          editingPostId, postText, preparedAttachments,
          Number(disableComments), Number(publicCheckboxIsChecked)
        ))
        setIsSubmitting(false)
        onEditFinish()
      } catch (e) {
        setIsSubmitting(false)
      }
    }
    else {
      onSubmit(
        postText, preparedAttachments,
        Number(publicCheckboxIsChecked),
        Number(disableComments), null)
        .then(
          () => {
            setAttachments([])
            setIsSubmitting(false)
            setPostText('')
          }
        )
    }
  }

  const [postSettingsAnchor, setPostSettingsAnchor] = useState(null)

  const handleClickAwayPostSettings = () => {
    setPostSettingsAnchor(null)
  }
  const handleDisableCommentCheck = e => setDisableComments(prev => !prev)
  const handleIsPublicCheck = e => setPublicCheckboxIsChecked(prev => !prev)

  const postSettings = (
    <div className={classes.postSettingsButtonWrapper}>
      <ClickAwayListener onClickAway={handleClickAwayPostSettings} >
        <div>
          <IconButton
            size='small'
            onClick={(e) => setPostSettingsAnchor(e.currentTarget)}
            disabled={isSubmitting}
          >
            <SettingsIcon style={{ display: 'block' }} />
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
              <MenuList dense>
                <MenuItem
                  disableRipple
                  onClick={handleIsPublicCheck}
                >
                  <Checkbox
                    className={classes.settingsItemCheckbox}
                    checked={publicCheckboxIsChecked}
                  />
                  <ListItemText>
                    {t('Public')}
                  </ListItemText>
                </MenuItem>

                <MenuItem
                  disableRipple
                  onClick={handleDisableCommentCheck}
                >
                  <Checkbox
                    className={classes.settingsItemCheckbox}
                    checked={disableComments}
                  />
                  <ListItemText>
                    {t('Disable comments')}
                  </ListItemText>
                </MenuItem>

              </MenuList>
            </Paper>
          </Popper>
        </div>
      </ClickAwayListener>
    </div>
  )

  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
  const emojiPickerPopperAnchor = useRef(null)

  const onEmojiSelect = e => setPostText(prev => prev += e.native)
  const handleOnChange = (e) => setPostText(e.target.value)
  const toggleEmojiPicker = () => {
    setShowEmojiPicker((prev) => {
      if(isSubmitting) {
        return false
      }
      return !prev
    })
  }
  const handleEmojiPickerClose = () => setShowEmojiPicker(false)

  let renderPickEmoji = (
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
    </div>
  )

  return (
    <div>
      <div className={classes.textFieldWrapper} >
        <TextField
          disabled={isSubmitting}
          size='small'
          placeholder={!editMode ? t('New post') : ''}
          multiline
          fullWidth
          value={postText}
          onChange={handleOnChange}
          InputProps={{
            classes: { input: classes.resize },
            style: { padding: 6 },
            endAdornment: renderPickEmoji
          }}
          onFocus={e => {
            e.currentTarget.setSelectionRange(
              postText.length, postText.length
            )
          }}
        />
      </div>

      <div className={classes.files}>
        <div className={classes.mediaLoadingProgress}>
          {progressObjects.map(e => {
            return (
              <div
                key={e.fileId}
                className={classes.loadingFile}
              >
                <div className={classes.loadingFileName}  >
                  {e.filename}
                </div>
                <LinearProgress style={{ width: 150, height: 10 }} />
              </div>
            )
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
            onChange={(event) => handleImageUpload(event)}
            ref={photoInput}
          />
          <div className={classes.addPhotoIconWrapper} >
            <IconButton
              size='small'
              style={{ marginRight: 16 }}
              onClick={openImageExplorer}
              disabled={isSubmitting}
            >
              <AddAPhotoIcon
                color={photoUploadError
                  ? 'error'
                  : isSubmitting ? 'disabled' : 'action'
                }
              />
            </IconButton>
          </div>
        </div>

        {postSettings}

        {editMode &&
          <Button
            disabled={isSubmitting}
            style={{ marginRight: 16 }}
            onClick={() => setEditMode(false)}
            children={t('Cancel')}
          />
        }
        <Button
          variant='contained'
          disabled={
            isSubmitting
            || (!postText.length && !attachments.length)
            || progressObjects.length > 0
          }
          disableElevation
          style={{ textTransform: 'none' }}
          onClick={handleSubmit}
        >
          {editMode ? t('Save') : t('Publicate')}
        </Button>
      </CardActions>

      {isSubmitting && <LinearProgress />}

      <Dialog
        onClose={() => setShowErrorDialog(false)}
        open={!!showErrorDialog}
      >
        <DialogContent >
          <Typography variant='body2'>
            {showErrorDialog}
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setShowErrorDialog(false)}
            children={t('Ok')}
          />
        </DialogActions>

      </Dialog>

    </div>
  )
}

export default PostForm