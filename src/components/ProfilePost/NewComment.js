import React, {useState, useEffect, useRef} from 'react';

import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import {useTranslation} from 'react-i18next';
import SendIcon from '@material-ui/icons/Send';
import { Button, makeStyles, Popper, TextField, useTheme } from '@material-ui/core';
import { useDispatch } from 'react-redux'
import Preloader from '../Common/Preloader/Preloader';
import { usePrevious } from '../../hooks/hooks';
import SentimentSatisfiedRoundedIcon from '@material-ui/icons/SentimentSatisfiedRounded';
import EmojiPicker from '../Common/EmojiPicker';
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto';
import { createComment, createCommentPhoto, editPostComment, getCommentPhoto } from '../../redux/profile_posts_reducer';

const useStyles = makeStyles((theme) => ({
  avatar: {
    [theme.breakpoints.down("xs")]: {
      display: 'none'
    },
  },
  pickEmojiButton: {
    [theme.breakpoints.down("xs")]: {
    },
  },
  createCommentButton: {
    marginLeft: 8
  },
  fieldTextSize: theme.typography.body2,
  fieldContainer: {
    display: 'flex',
    alignItems: 'flex-start'
  },
  field: {
    display: 'flex',
  },
  underField: {
    ...theme.styles.flexRowAlignCenter,
    padding: theme.spacing(0.5, 1),
    color: theme.palette.text.secondary,
    fontSize: '0.840rem',
    fontWeight: 500,
    wordBreak: "keep-all"
  },
}))

const NewComment = React.memo(props => {

  const {
    postId, rootId, repliedId, avatarSize, autoFocus, focusTrigger, setShowReplyField,
    editMode, editingComment, onEditingFinish, creatorPicture
  } = props;

  const classes = useStyles();
  const { t } = useTranslation();
  const dispatch = useDispatch()
  const theme = useTheme()

  const openImageExplorer = () => {
    photoInput.current.click()
  }

  const photoInput = React.useRef(null)
  const videoInput = React.useRef(null)
  const audioInput = React.useRef(null)

  const [attachment, setAttachment] = useState(editMode ? editingComment.attachment : null)

  const width = avatarSize ? avatarSize : 40
  const height = avatarSize ? avatarSize : 40

  const [text, setText] = useState(editMode ? editingComment.text : '')

  const changeText = (e) => {
    setText(e.target.value)
  }

  const ref1 = useRef(null)

  const [commentIsCreating, setCommentIsCreating] = useState(false)
  const [commentIsEditing, setCommentIsEditing] = useState(false)
  const [error, setError] = useState("")

  const prevFocusTrigger = usePrevious(focusTrigger)

  useEffect(() => {
    if(prevFocusTrigger !== null && focusTrigger !== prevFocusTrigger) {
      inputRef.current.focus()
    }
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
              console.log(response.data.photo)
              setAttachment(response.data.photo)
            }
          }
        } catch(err) {
          console.log(err)
        }
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
    } else if (commentIsCreating || !text) {
      return
    }
    let attachmentId = attachment ? attachment.id : null

    setCommentIsCreating(true)
    dispatch(createComment(postId, text, attachmentId, rootId, repliedId))
      .then((response) => {
        setCommentIsCreating(false)
        setText('')
        setError(false)
        setShowReplyField(false)
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
        style={{
          cursor: 'pointer',
          color: editMode
            ? null
            : ( !showEmojiPicker ? theme.palette.action.disabled : null )
        }}
        ref={emojiPickerPopperAnchor}
      />
      { emojiPopper }
    </div>
  )

  let pickPhoto = (
    <div>
      <AddAPhotoIcon
        onClick={openImageExplorer}
        style={{
          cursor: 'pointer',
          color: editMode
            ? null
            : ( !showEmojiPicker ? theme.palette.action.disabled : null )
        }}
      />
    </div>
  )

  const adornments = (
    <div style={{display: 'flex' }}>
      <div className={classes.pickEmojiButton} style={{marginRight: 8}} >{pickEmoji}</div>
      <div >{pickPhoto}</div>
    </div>
  )

  return (
    <div>
    <div className={classes.field} >
      { !editMode && <Avatar
          className={classes.avatar}
          style={{ marginRight: 8, width: width, height: height }}
          src={creatorPicture}
        />
      }

      <TextField
        onBlur={ () => setError("") }
        onKeyPress={ onEnterPress }
        autoFocus={ autoFocus}
        ref={ref1}
        inputRef={ inputRef }
        size='small'
        multiline
        fullWidth
        variant={ editMode ? "standard" : "outlined" }
        value={text}
        onChange={ changeText }
        error={!!error}
        helperText={error ? error : ""}
        InputProps={{
          classes: { input: classes.fieldTextSize, },
          style: editMode ? {} : { borderRadius: '8px', padding: '4px 8px' },
          endAdornment: editMode ? null : adornments
        }}
        onFocus={(e) =>
          e.currentTarget.setSelectionRange(
            e.currentTarget.value.length,
            e.currentTarget.value.length
          )}
      />

      <input
        accept='image/*'
        style={{ display: 'none' }}
        id='post-comment-photo-input'
        type='file'
        onChange={(event) => {
          handleImageUpload(event)
        }}
        ref={photoInput}
      />

      <div style={{display: 'flex', alignItems: 'center'}}>
        { !editMode &&
          <>
            <div style={{position: 'relative'}} >
              <IconButton
                size='small'
                disabled={ commentIsCreating || (!text.length && !Boolean(attachment)) } 
                className={classes.createCommentButton}
                onClick={ handleCreate }
              >
                <SendIcon />
              </IconButton>

              { commentIsCreating &&
                <div style={{position: 'absolute', top: 0, right: 0}}>
                  <Preloader size={30} />
                </div>
              }
            </div>
          </>
        }
      </div>
    </div>
    { editMode &&
      <div className={classes.underField}>
        { adornments }
        <div
          onClick={onEditingFinish}
          style={{cursor: 'pointer', marginLeft: 'auto', textTransform: 'uppercase', marginRight: 16}}
        >
          {t('Cancel')}
        </div>
        <div style={{position: 'relative'}} >
          <Button
            onClick={handleSave}
            variant='contained'
            disabled={commentIsEditing}
          >
            {t('Save')}
          </Button>
          { commentIsEditing &&
            <div style={{position: 'absolute', top: 0, right: 0, left: 0, bottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
              <Preloader size={30} />
            </div>
          }
        </div>
      </div>
    }

    { attachment &&
      <div style={{marginLeft: editMode ? 0 : 56, marginTop: 8, maxWidth: 150}}>
        <img
          style={{width: '100%'}}
          src={`http://localhost:8001/images/for-photos/${attachment.versions
            ? attachment.versions[2] : attachment.src}`} />
        </div>
    }
    </div>
  )
})

export default NewComment



