import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import SendIcon from '@material-ui/icons/Send'
import { Button, LinearProgress, Popper, TextField } from '@material-ui/core'
import { useDispatch } from 'react-redux'
import { usePrevious } from '../../../hooks/hooks'
import SentimentSatisfiedRoundedIcon from '@material-ui/icons/SentimentSatisfiedRounded'
import EmojiPicker from '../../Common/EmojiPicker'
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto'
import ButtonWithCircularProgress from '../../Common/ButtonWithCircularProgress'
import { useStyles } from './NewCommentStyles'
import IconButtonWithCircularProgress from '../../Common/IconButtonWithCircularProgress'
import {
  createComment,
  createCommentPhoto,
  editPostComment,
  getCommentPhoto
} from '../../../redux/profile_posts_reducer'
import { PhotoSlider } from 'react-photo-view'
import SimplePhotoGallery from '../../Common/SimplePhotoGallery'
import { createSimpleGalleryPhoto } from '../../../helper/helperFunctions'

const NewComment = React.memo(props => {

  const {
    postId, rootId, repliedId, autoFocus, focusTrigger,
    editMode, editingComment, onEditingFinish, place
  } = props;

  const classes = useStyles();
  const { t } = useTranslation();
  const dispatch = useDispatch()

  const [attachments, setAttachments] = useState(editMode
    ? (editingComment.attachment ? [editingComment.attachment] : [])
    : []
  )
  const [text, setText] = useState(editMode ? editingComment.text : '')
  const [commentIsCreating, setCommentIsCreating] = useState(false)
  const [commentIsEditing, setCommentIsEditing] = useState(false)
  const [error, setError] = useState("")
  const [photoUploadError, setPhotoUploadError] = useState(false)
  const [loadingFileName, setLoadingFileName] = useState('')
  const [viewerIsOpen, setViewerIsOpen] = useState(false);

  const viewerPhotos = !!attachments && attachments.length > 0
    ? [{ src: `${attachments[0].versions[0].src}` }] : []

  const changeText = (e) => setText(e.target.value)
  const photoInput = React.useRef(null)

  const prevFocusTrigger = usePrevious(focusTrigger)

  const openImageExplorer = () => {
    if (loadingFileName) {
      return
    }
    photoInput.current.click()
  }

  useEffect(() => {
    if (prevFocusTrigger !== null && focusTrigger !== prevFocusTrigger) {
      inputRef.current.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusTrigger])

  let handleImageUpload = async (event) => {
    const file = event.target.files[0]

    if (file) {
      const { type } = file
      if (!type) return

      if (
        (type && type.endsWith('jpeg'))
        || (type.endsWith('png'))
        || (type.endsWith('jpg'))
      ) {
        setAttachments([])
        setLoadingFileName(file.name)
        try {
          let response = await dispatch(createCommentPhoto(file))
          if (response.status === 201) {
            response = await dispatch(getCommentPhoto(response.data.id))
            if (response.status === 200) {
              setAttachments([response.data.photo])
            }
          }
          setPhotoUploadError(false)
        } catch (err) {
          setPhotoUploadError(true)
        } finally {
          setLoadingFileName('')
        }

      } else {
        setPhotoUploadError(true)
      }
      photoInput.current.value = ''
    }
  }

  const handleSave = async () => {
    if (text.length > 200) {
      setError(t('Exceeded number of characters'))
      return
    } else if (commentIsCreating || (!text && attachments.length === 0)) {
      return
    }
    try {
      setCommentIsEditing(true)
      let attachmentId = attachments && attachments.length ? attachments[0].id : null
      await dispatch(editPostComment(
        postId, editingComment.id, text, attachmentId,
        editingComment.rootId, place
      ))
      setError(null)
      setCommentIsEditing(false)
      onEditingFinish()
    } catch (e) {
      setError(t('Saving error'))
      setCommentIsEditing(false)
    }
  }

  const handleCreate = () => {
    if (text.length > 200) {
      setError(t('Exceeded number of characters'))
      return
    } else if (commentIsCreating || (!text && attachments.length === 0)) {
      return
    }
    let attachmentId = attachments && attachments.length ? attachments[0].id : null

    setCommentIsCreating(true)
    dispatch(createComment(postId, text, attachmentId, rootId, repliedId, place))
      .then((response) => {
        setCommentIsCreating(false)
        setText('')
        setError(false)
        setAttachments(null)
      })
      .catch((error) => {
        setCommentIsCreating(false)
        inputRef.current.focus()
        setError(t('Creating error'))
      })
  }

  const onEnterPress = (event) => {
    if (editMode || (event.key === 'Enter' && event.shiftKey)) {
      return
    } else if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleCreate()
    }
  }

  const inputRef = useRef(null)

  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
  const emojiPickerPopperAnchor = useRef(null)

  const onEmojiSelect = e => {
    setText(prev => prev += e.native)
  }

  const toggleEmojiPicker = () => setShowEmojiPicker((prev) => !prev);
  const handleEmojiPickerClose = () => setShowEmojiPicker(false);

  let emojiPopper = (
    <div>
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

  const adornments = (
    <div className={classes.adornments}>
      <div className={classes.adornment}>
        <SentimentSatisfiedRoundedIcon
          onClick={toggleEmojiPicker}
          color={editMode
            ? (showEmojiPicker ? 'secondary' : 'action')
            : (showEmojiPicker ? 'action' : 'disabled')
          }
          ref={emojiPickerPopperAnchor}
        />
        {emojiPopper}
      </div>

      <div className={classes.adornment} >
        <AddAPhotoIcon
          onClick={openImageExplorer}
          color={photoUploadError
            ? 'error'
            : (editMode ? 'action' : 'disabled')
          }
        />
      </div>
    </div>
  )

  const handleFieldOnFocus = (e) => {
    e.currentTarget.setSelectionRange(
      e.currentTarget.value.length,
      e.currentTarget.value.length
    )
  }

  let commentAttachment = null
  if (attachments && attachments.length > 0) {
    const attachment = attachments[0]
    const medium = attachment.versions[2]
    let maxSize = 150
    const width = medium.width
    const height = medium.height
    if (width > height) {
      maxSize = maxSize * (width / height)
    }

    commentAttachment = (
      <div
        className={classes.attachment}
        style={{
          maxWidth: maxSize,
          maxHeight: maxSize
        }}
      >
        <SimplePhotoGallery
          editMode
          centering={false}
          passedImages={[
            createSimpleGalleryPhoto(
              attachment.id,
              medium,
              attachment.versions[0]
            )
          ]}
          spacing={1}
          imageBorderRadius={2}
          setAttachments={setAttachments}
        />
      </div>
    )
  }

  const createButtonIsDisabled = commentIsCreating
    || (!text.length && !Boolean(attachments ? attachments.length : 0))

  const handleAttachmentInputChange = (event) => {
    handleImageUpload(event)
  }

  return (
    <div>
      <div className={classes.field} >
        <TextField
          disabled={commentIsCreating}
          onBlur={() => setError("")}
          onKeyPress={onEnterPress}
          autoFocus={autoFocus}
          inputRef={inputRef}
          size='small' multiline fullWidth
          variant={editMode ? "standard" : "outlined"}
          value={text}
          onChange={changeText} onFocus={handleFieldOnFocus}
          error={!!error}
          helperText={error ? error : ""}
          InputProps={{
            classes: { input: classes.fieldTextSize },
            style: editMode ? {} : { borderRadius: '8px', padding: '4px 8px' },
            endAdornment: editMode ? null : adornments
          }}
        />
        <input
          accept='image/jpeg,image/png'
          style={{ display: 'none' }}
          type='file'
          onChange={handleAttachmentInputChange}
          ref={photoInput}
        />
        {!editMode &&
          <div className={classes.createCommentButton}>
            <IconButtonWithCircularProgress
              size='small'
              children={<SendIcon />}
              disabled={createButtonIsDisabled}
              onClick={handleCreate}
              enableProgress={commentIsCreating}
            />
          </div>
        }
      </div>

      {loadingFileName &&
        <div className={classes.loadingFile} >
          <span className={classes.loadingFileName}>
            {loadingFileName}
          </span>
          <LinearProgress className={classes.loadingFileProgress} />
        </div>
      }
      <div className={classes.underField}>
        {editMode && adornments}

        {editMode &&
          <>
            <Button
              onClick={onEditingFinish}
              children={t('Cancel')}
              className={classes.editModeCancelButton}
            />
            <ButtonWithCircularProgress
              enableProgress={commentIsEditing}
              disabled={commentIsEditing || (!text && attachments.length === 0)}
              variant='contained'
              children={t('Save')}
              onClick={handleSave}
            />
          </>
        }
      </div>

      {commentAttachment}

      <PhotoSlider
        images={viewerPhotos}
        visible={viewerIsOpen}
        onClose={() => setViewerIsOpen(false)}
        index={0}
      />
    </div>
  )
})

export default NewComment




