import React, {useCallback, useEffect, useRef, useState} from 'react'
import {makeStyles} from "@material-ui/core/styles";
import IconButton from '@material-ui/core/IconButton';
import {useTranslation} from 'react-i18next';
import SendIcon from '@material-ui/icons/Send';
import { useTheme } from '@material-ui/core/styles'
import {change} from 'redux-form'
import {connect, useSelector} from 'react-redux'
import {compose} from 'redux'
import AttachFileIcon from '@material-ui/icons/AttachFile';
import { Popper, Paper, MenuList, MenuItem, Grow, Collapse, Fade, Zoom, Tooltip, withWidth, TextField, CircularProgress, Divider, Typography } from '@material-ui/core';
import PhotoCameraRoundedIcon from '@material-ui/icons/PhotoCameraRounded';
import TheatersRoundedIcon from '@material-ui/icons/TheatersRounded';
import AudiotrackRoundedIcon from '@material-ui/icons/AudiotrackRounded';
import { debounce } from '../../../../helper/helperFunctions.js';
import { chatsAPI } from '../../../../api/chats_api';
import removeEmptyLines from "remove-blank-lines"
import {useStyles} from "./NewMessageStyles"
import EmojiPicker from '../../../Common/EmojiPicker.jsx';
import SentimentSatisfiedRoundedIcon from '@material-ui/icons/SentimentSatisfiedRounded'
import CloseIcon from '@material-ui/icons/Close';
import { onRepliedOrEditedClick } from '../Chat';

const NewMessage = ({ isDisabled, onSubmit, isAcceptsMessages, chatId, isInitialized, editingMessage, closeEditMode, onEditSave, repliedMesage: repliedMessage, onCloseReplying }) => {
  const theme = useTheme()
  let classes = useStyles()
  const { t } = useTranslation();
  const [text, setText] = useState('')
  const textInput = useRef(null)
  const textInputInFocus = useRef(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const typingTimeout = useRef(false) // Пока эта переменная === true, не оповещаем собеседника о том, что текущий пользователь что-то печатает

  const sendMessageIsTyping = useCallback(() => {
    if(typingTimeout.current) {
      return
    }
    if(chatId !== '-1') chatsAPI.typeMessage(chatId)
    typingTimeout.current = true
    setTimeout(() => {
      typingTimeout.current = false
    }, 3000)
  }, [chatId])

  useEffect(() => {
    if(editingMessage) {
      setText(editingMessage.text)
      setEditMode(true)
      textInput.current.focus()
    } else {
      setText('')
    }
  }, [editingMessage])

  useEffect(() => {
    if(repliedMessage) {
      textInput.current.focus()
    }
  }, [repliedMessage])

  const onTextChange = e => {
    // Текст будет храниться в исходном виде, без удаления пробелов и переносов
    setText(e.target.value)
    sendMessageIsTyping()
  }
  const form = useRef(null)

  const focusTimeout = useRef(null)

  const onSendButtonClick = async (e) => {
    if(!editMode) {
      if(textInputInFocus.current) { // При нажатии на кнопку поле перестаёт быть в фокусе. Если до нажатия кнопки поле было в фокусе, нужно сфокусироваться на нём обратно
        clearTimeout(focusTimeout.current)
        textInput.current.focus()
      }
      let textCopy = text
      let trimmedAndWithoutEmptyLinesText = removeEmptyLines(textCopy.trim())
      setText('')
      onSubmit(trimmedAndWithoutEmptyLinesText, repliedMessage || null)
      onCloseReplying()
    } else {
      setIsSaving(true)
      let textCopy = text
      let trimmedAndWithoutEmptyLinesText = removeEmptyLines(textCopy.trim())
      try {
        await onEditSave(editingMessage.id, trimmedAndWithoutEmptyLinesText)
        setText('')
        setIsSaving(false)
        setEditMode(false)
      } catch (e) {
        setIsSaving(false)
      }
    }
  }

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
        style={{zIndex: 1}}
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
    <div style={{marginRight: 8}}>
      <SentimentSatisfiedRoundedIcon
        onClick={toggleEmojiPicker}
        color={showEmojiPicker ? 'action' : 'disabled'}
        style={{cursor: 'pointer', display: 'block'}}
        ref={emojiPickerPopperAnchor}
      />
      { emojiPopper }
    </div>
  )

  // const [openAttachFileTooltip, setOpenAttachFileTooltip] = React.useState(false);
  // const handleToggleAttachFileTooltip = () => {
  //   setOpenAttachFileTooltip((prevOpen) => !prevOpen);
  // };
  // const renderFileTypes = (
  //   <div>
  //     <div className={ classes.attachFileType }><PhotoCameraRoundedIcon /></div>
  //     <div className={ classes.attachFileType }><TheatersRoundedIcon /></div>
  //     <div className={ classes.attachFileType }><AudiotrackRoundedIcon /></div>
  //   </div>
  // )
  // const renderAttachIcon = <AttachFileIcon />
  // const renderAttachFileButton = (
  //   <IconButton
  //     onClick={handleToggleAttachFileTooltip}
  //     size='medium'
  //   >
  //     {renderAttachIcon}
  //   </IconButton>
  // )

  const onEnterPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !buttonIsDisabled) {
      event.preventDefault()
      onSendButtonClick()
    }
  }

  const onEditingClick = () => {
    if(editingMessage) {
      onRepliedOrEditedClick(editingMessage.id, theme.palette.divider)
    }
  }

  
  const onReplyingClick = () => {
    if(repliedMessage) {
      onRepliedOrEditedClick(repliedMessage.id, theme.palette.divider)
    }
  }

  const closeEditing = () => {
    closeEditMode()
    setEditMode(false)
  }

  const closeReplying = () => {
    onCloseReplying()
  }

  const trimmedText = text.trim() // Убираем пробелы и переносы, чтобы узнать есть ли в тексте, что-то кроме пробелов и переносов, если нет, то кнопка создания будет неактивна
  const buttonIsDisabled = isSaving || isDisabled || !trimmedText || !isInitialized

  return (
    <div style={{
      
    }}>
      { editMode && editingMessage &&
        <div className={classes.editMessage}>
          <div
            className={classes.editMessageClose}
            onClick={closeEditing}
          >
            <IconButton
              size='small'
              children={<CloseIcon style={{display: 'block'}}/>}
            />
          </div>
          <div
            className={classes.editingMessageWrapper}
            onClick={onEditingClick}
          >
            <div className={classes.editBorder}/>
            <div style={{maxWidth: '97%'}}>
              <Typography
                className={classes.editHeader}
                variant='subtitle2'
                children={t('Edit message')}
              />
              <div className={classes.editingMessageText}>
                {editingMessage.text}
              </div>
            </div>
          </div>
        </div>
      }
      { repliedMessage &&
        <div className={classes.editMessage}>
          <div
            className={classes.editMessageClose}
            onClick={closeReplying}
          >
            <IconButton
              size='small'
              children={<CloseIcon style={{display: 'block'}}/>}
            />
          </div>
          <div
            className={classes.editingMessageWrapper}
            onClick={onReplyingClick}
          >
            <div className={classes.editBorder}/>
            <div style={{maxWidth: '97%'}}>
              <Typography
                className={classes.editHeader}
                variant='subtitle2'
                children={t('Reply message')}
              />
              <div className={classes.editingMessageText}>
                {repliedMessage.text}
              </div>
            </div>
          </div>
        </div>
      }
      <div style={{ width: '100%', display: 'flex', alignItems: 'end'}}>
        <div className={classes.fieldCont}>
          <div className={classes.appendix} >
            <div/>
          </div>
          <TextField
            maxRows={6}
            inputRef={textInput}
            onKeyPress={onEnterPress}
            size='small'
            placeholder={ isInitialized ? t('New message') : '' }
            multiline
            fullWidth
            value={ text }
            onChange={ onTextChange }
            InputProps={{
              classes: {
                input: classes.font,
                underline: classes.underline,
                root: classes.field
              },
              style: {padding: 12},
              startAdornment: pickEmoji
            }}
            onFocus={ e => {
              console.log('on focus')
              textInputInFocus.current = true
              e.currentTarget.setSelectionRange(
                text.length,
                text.length
              )
            }}
            onBlur={e => {
              focusTimeout.current = setTimeout(() => {
                console.log()
                textInputInFocus.current = false
              }, 150)
              e.preventDefault()
            }}
          />
        </div>
        <div className={classes.buttonWrapper}>
          {isInitialized &&
            <IconButton
              size='medium'
              color='secondary'
              disabled={buttonIsDisabled}
              onClick={onSendButtonClick}
              children={<SendIcon />}
            />
          }
          {/* { isDisabled && <CircularProgress style={{top: 0, left: 0, position: 'absolute'}}/> } */}
        </div>
    </div>
  </div>
  )
}


// let mapStateToProps = state => {
//   return {
//   }
// }

// let functions = {
//   change
// }

export default NewMessage
// compose(
//   connect(mapStateToProps, functions),
//   withWidth()
// )(NewMessage);

