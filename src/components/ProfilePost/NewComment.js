import React, {useState, useEffect, useRef} from 'react'
import Avatar from "@material-ui/core/Avatar"
import {useTranslation} from 'react-i18next'
import SendIcon from '@material-ui/icons/Send'
import { Button, Popper, TextField, useTheme } from '@material-ui/core'
import { useDispatch } from 'react-redux'
import { usePrevious } from '../../hooks/hooks'
import SentimentSatisfiedRoundedIcon from '@material-ui/icons/SentimentSatisfiedRounded'
import EmojiPicker from '../Common/EmojiPicker'
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto'
import ButtonWithCircularProgress from '../Common/ButtonWithCircularProgress'
import { imagesStorage } from '../../api/api'
import { useStyles } from './NewCommentStyles'
import IconButtonWithCircularProgress from '../Common/IconButtonWithCircularProgress'
import {
  createComment,
  createCommentPhoto,
  editPostComment,
  getCommentPhoto
} from '../../redux/profile_posts_reducer'
import HighlightOffIcon from '@material-ui/icons/HighlightOff';
import { PhotoSlider } from 'react-photo-view'

const NewComment = React.memo(props => {

  const {
    postId, rootId, repliedId, autoFocus, focusTrigger, setShowReplyField,
    editMode, editingComment, onEditingFinish, creatorPicture
  } = props;

  const classes = useStyles();
  const { t } = useTranslation();
  const dispatch = useDispatch()
  const theme = useTheme()

  const [attachment, setAttachment] = useState(editMode ? editingComment.attachment : null)
  const [text, setText] = useState(editMode ? editingComment.text : '')
  const [commentIsCreating, setCommentIsCreating] = useState(false)
  const [commentIsEditing, setCommentIsEditing] = useState(false)
  const [error, setError] = useState("")
  const [photoUploadError, setPhotoUploadError] = useState(false)

  const [viewerIsOpen, setViewerIsOpen] = useState(false);
  const viewerPhotos = !!attachment ? [{src: `${imagesStorage}${attachment.originalSrc}`}] : []
  // console.log(attachment)

  const changeText = (e) => setText(e.target.value)
  const ref1 = useRef(null)
  const photoInput = React.useRef(null)

  const prevFocusTrigger = usePrevious(focusTrigger)

  const openImageExplorer = () => {
    photoInput.current.click()
  }

  useEffect(() => {
    if(prevFocusTrigger !== null && focusTrigger !== prevFocusTrigger) {
      inputRef.current.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusTrigger])

  let handleImageUpload = async (event) => {
    const file = event.target.files[0]
    
    if(file) {
      const {type} = file
      if(!type) return

      if((type && type.endsWith('jpeg')) || (type.endsWith('png')) || (type.endsWith('jpg'))) {
        try {
          let response = await dispatch(createCommentPhoto(file))
          if(response.status === 201) {
            response = await dispatch(getCommentPhoto(response.data.id))
            if(response.status === 200) {
              setAttachment(response.data.photo)
            }
          }
          setPhotoUploadError(false)
        } catch(err) {
          setPhotoUploadError(true)
        }
      } else {
        setPhotoUploadError(true)
      }
      photoInput.current.value = ''
    }
  }

  const handleSave = async () => {
    try {
      setCommentIsEditing(true)
      let attachmentId = attachment ? attachment.id : null
      await dispatch(editPostComment(postId, editingComment.id, text, attachmentId, editingComment.rootId))
      setError(null)
      setCommentIsEditing(false)
      onEditingFinish()
    } catch (e) {
      setError('Saving error')
      setCommentIsEditing(false)
    }
  }

  const handleCreate = () => {
    if(text.length > 200) {
      setError('Превышено количество символов')
      return
    } else if (commentIsCreating || (!text && !attachment)) {
      return
    }
    let attachmentId = attachment ? attachment.id : null

    setCommentIsCreating(true)
    dispatch(createComment(postId, text, attachmentId, rootId, repliedId))
      .then((response) => {
        setCommentIsCreating(false)
        setText('')
        setError(false)
        if(setShowReplyField) {
          setShowReplyField(false)
        }
        setAttachment(null)
      })
      .catch((error) => {
        setCommentIsCreating(false)
        inputRef.current.focus()
        setError(t('Creating error'))
      })
  }

  const onEnterPress = (event) => {
    if(event.key === 'Enter' && event.shiftKey) {
      return
    }
    else if (event.key === 'Enter' && !event.shiftKey) {
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

  let pickEmoji = (
    <div>
      <SentimentSatisfiedRoundedIcon
        onClick={toggleEmojiPicker}
        color={editMode
          ? (showEmojiPicker ? 'secondary' : 'action')
          : (showEmojiPicker ? 'action' : 'disabled')
        }
        style={{cursor: 'pointer'}}
        ref={emojiPickerPopperAnchor}
      />
      { emojiPopper }
    </div>
  )

  // console.log(photoUploadError)

  let pickPhoto = (
    <div>
      <AddAPhotoIcon
        onClick={openImageExplorer}
        color={photoUploadError
          ? 'error' : (editMode ? 'action' : 'disabled')
        }
        style={{ cursor: 'pointer' }}
      />
    </div>
  )

  const adornments = (
    <div style={{display: 'flex' }}>
      <div
        className={classes.pickEmojiButton}
        style={{marginRight: 8}}
      >
        {pickEmoji}
      </div>
      <div style={{marginRight: 8}} >{pickPhoto}</div>
    </div>
  )

  const handleFieldOnFocus = (e) => {
    e.currentTarget.setSelectionRange(
      e.currentTarget.value.length,
      e.currentTarget.value.length
    )
  }

  return (
    <div>
      <div className={classes.field} >
        { !editMode &&
          <Avatar
            className={classes.avatar}
            src={creatorPicture}
          />
        }
        <TextField
          onBlur={() => setError("")}
          onKeyPress={onEnterPress}
          autoFocus={autoFocus}
          ref={ref1} inputRef={inputRef}
          size='small' multiline fullWidth
          variant={editMode ? "standard" : "outlined"}
          value={text}
          onChange={changeText} onFocus={handleFieldOnFocus}
          error={!!error}
          helperText={error ? error : ""}
          InputProps={{
            classes: {input: classes.fieldTextSize},
            style: editMode ? {} : {borderRadius: '8px', padding: '4px 8px'},
            endAdornment: editMode ? null : adornments
          }}
        />
        <input
          accept='image/jpeg,image/png'
          style={{ display: 'none' }}
          id='post-comment-photo-input'
          type='file'
          onChange={(event) => {
            handleImageUpload(event)
            console.log('onchange')
          }}
          ref={photoInput}
        />
        { !editMode &&
          <div className={classes.createCommentButton}>
            <IconButtonWithCircularProgress
              size='small'
              children={<SendIcon />}
              disabled={commentIsCreating || (!text.length && !Boolean(attachment))}
              onClick={handleCreate}
              enableProgress={commentIsCreating}
            />
          </div>
        }
      </div>

      
      <div className={classes.underField}>
        { editMode && adornments }
        
        { editMode &&
          <>
            {}
            <Button
              onClick={onEditingFinish}
              children={t('Cancel')}
              style={{marginLeft: 'auto', marginRight: 16}}
            />
            <ButtonWithCircularProgress
              enableProgress={commentIsEditing}
              disabled={commentIsEditing}
              variant='contained'
              children={t('Save')}
              onClick={handleSave}
            />
          </>
        }
      </div>

      { attachment &&
        <div style={{position: 'relative', marginLeft: editMode ? 0 : 56, marginTop: 8, maxWidth: 150}}>
          <img
            alt='comment-attachment'
            style={{width: '100%'}}
            src={`${imagesStorage}/${attachment.versions
              ? attachment.versions[2] : attachment.mediumSrc}`}
          />
          <div style={{position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, cursor: 'pointer'}} onClick={() => setViewerIsOpen(true)}/>
          <div style={{position: 'absolute', top: 4, right: 4, cursor: 'pointer'}}>
            <HighlightOffIcon onClick={() => setAttachment(null)}/>
          </div>
        </div>
      }

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




