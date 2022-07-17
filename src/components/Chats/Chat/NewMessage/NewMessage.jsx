import React, { useCallback, useEffect, useRef, useState } from 'react'
import IconButton from '@material-ui/core/IconButton';
import { useTranslation } from 'react-i18next';
import SendIcon from '@material-ui/icons/Send';
import { useTheme } from '@material-ui/core/styles'
import { TextField, Typography } from '@material-ui/core';
// import AttachFileIcon from '@material-ui/icons/AttachFile';
// import PhotoCameraRoundedIcon from '@material-ui/icons/PhotoCameraRounded';
// import TheatersRoundedIcon from '@material-ui/icons/TheatersRounded';
// import AudiotrackRoundedIcon from '@material-ui/icons/AudiotrackRounded';
import { chatsAPI } from '../../../../api/chats_api';
import removeEmptyLines from "remove-blank-lines"
import { useStyles } from "./NewMessageStyles"
import SentimentSatisfiedRoundedIcon from '@material-ui/icons/SentimentSatisfiedRounded'
import CloseIcon from '@material-ui/icons/Close';
import { onRepliedOrEditedClick } from '../Chat';
import EmojiPicker2 from '../../../Common/EmojiPicker2.jsx';

const NewMessage = ({
  isDisabled, onSubmit, isAcceptsMessages, chatId, isInitialized, editingMessage,
  closeEditMode, onEditSave, repliedMesage: repliedMessage, onCloseReplying
}) => {
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
    if (typingTimeout.current) return
  
    if (chatId !== '-1') {
      chatsAPI.typeMessage(chatId)
    }
    typingTimeout.current = true
    setTimeout(() => {
      typingTimeout.current = false
    }, 3000)
  }, [chatId])

  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.text)
      setEditMode(true)
      textInput.current.focus()
    } else {
      setText('')
    }
  }, [editingMessage])

  useEffect(() => {
    if (repliedMessage) {
      textInput.current.focus()
    }
  }, [repliedMessage])

  const onTextChange = e => {
    // Текст будет храниться в исходном виде, без удаления пробелов и переносов
    setText(e.target.value)
    sendMessageIsTyping()
  }
  const focusTimeout = useRef(null)

  const onSendButtonClick = async (e) => {
    if (!editMode) {
      if (textInputInFocus.current) {
        // При нажатии на кнопку поле перестаёт быть в фокусе. Если до нажатия
        // кнопки поле было в фокусе, нужно сфокусироваться на нём обратно
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

  const handleEmojiSelect = e => {
    setText(prev => prev += e.native)
  }

  const handleToggleEmojiPicker = () => {
    setShowEmojiPicker((prev) => !prev)
  }

  const handleEmojiPickerClose = () => {
    setShowEmojiPicker(false)
  }

  let pickEmoji = (
    <SentimentSatisfiedRoundedIcon
      onClick={handleToggleEmojiPicker}
      color={showEmojiPicker ? 'primary' : 'disabled'}
      disabled={showEmojiPicker}
      style={{ cursor: 'pointer', display: 'block' }}
      ref={emojiPickerPopperAnchor}
    />
  )

  let emojiPopper = (
    <EmojiPicker2
      isOpened={showEmojiPicker}
      onSelect={handleEmojiSelect}
      onClose={handleEmojiPickerClose}
      button={pickEmoji}
      buttonWrapperStyles={{
        marginRight: 8
      }}
    />
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

  const handleEnterPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !buttonIsDisabled) {
      event.preventDefault()
      onSendButtonClick()
    }
  }

  const handleOnEditingMessageClick = () => {
    if (editingMessage) {
      onRepliedOrEditedClick(editingMessage.id, theme.palette.divider)
    }
  }


  const handleOnReplyingMessageClick = () => {
    if (repliedMessage) {
      onRepliedOrEditedClick(repliedMessage.id, theme.palette.divider)
    }
  }

  const handleDisableEditing = () => {
    closeEditMode()
    setEditMode(false)
  }

  const handleCloseReplying = () => {
    onCloseReplying()
  }

  const trimmedText = text.trim()
  // Убираем пробелы и переносы, чтобы узнать есть ли в тексте, что-то кроме
  // пробелов и переносов, если нет, то кнопка создания будет неактивна

  const handleTextFieldFocus = e => {
    textInputInFocus.current = true
    e.currentTarget.setSelectionRange(
      text.length,
      text.length
    )
  }

  const handleTextFieldBlur = e => {
    focusTimeout.current = setTimeout(() => {
      textInputInFocus.current = false
    }, 150)
    e.preventDefault()
  }

  const buttonIsDisabled = isSaving || isDisabled || !trimmedText || !isInitialized

  return (
    <div>
      {editMode && editingMessage &&
        <div className={classes.editMessage}>
          <div
            className={classes.editMessageClose}
            onClick={handleDisableEditing}
          >
            <IconButton
              size='small'
              children={
                <CloseIcon style={{ display: 'block' }} />
              }
            />
          </div>
          <div
            className={classes.editingMessageWrapper}
            onClick={handleOnEditingMessageClick}
          >
            <div className={classes.editBorder} />
            <div style={{ maxWidth: '97%' }}>
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

      {repliedMessage &&
        <div className={classes.editMessage}>
          <div
            className={classes.editMessageClose}
            onClick={handleCloseReplying}
          >
            <IconButton
              size='small'
              children={<CloseIcon style={{ display: 'block' }} />}
            />
          </div>
          <div
            className={classes.editingMessageWrapper}
            onClick={handleOnReplyingMessageClick}
          >
            <div className={classes.editBorder} />
            <div style={{ maxWidth: '97%' }}>
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

      <div className={classes.newMessageForm}>
        <div className={classes.fieldCont}>
          <div className={classes.appendix} >
            <div />
          </div>

          <TextField
            maxRows={6}
            inputRef={textInput}
            onKeyPress={handleEnterPress}
            size='small'
            placeholder={isInitialized ? t('New message') : ''}
            multiline
            fullWidth
            value={text}
            onChange={onTextChange}
            InputProps={{
              classes: {
                input: classes.font,
                underline: classes.underline,
                root: classes.field
              },
              style: { padding: 12 },
              startAdornment: emojiPopper
            }}
            onFocus={handleTextFieldFocus}
            onBlur={handleTextFieldBlur}
          />
        </div>

        <div className={classes.sendButtonWrapper}>
          <IconButton
            size='medium'
            color='secondary'
            disabled={buttonIsDisabled}
            onClick={onSendButtonClick}
            children={<SendIcon />}
          />
        </div>
      </div>
    </div>
  )
}

export default NewMessage

