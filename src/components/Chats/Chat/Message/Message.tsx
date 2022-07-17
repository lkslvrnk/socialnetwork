import React, { useRef, useState } from 'react';
import cn from 'classnames'
import { useStyles } from './MessageStyles';
import moment from 'moment'
import {
  Button, Checkbox, ClickAwayListener, Dialog, DialogActions, DialogContent,
  DialogTitle, Fade, FormControlLabel, IconButton, MenuItem, Typography, useTheme
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { MessageType } from '../../../../types/chats_types';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import PopperMenu from '../../../Common/PopperMenu';
import { useSelector } from 'react-redux';
import { chatsAPI } from '../../../../api/chats_api';
import MenuItemWithProgress from '../../../Common/MenuItemWithProgress';
import LoopIcon from '@material-ui/icons/Loop';
import { AppStateType } from '../../../../redux/redux_store';
import ErrorIcon from '@material-ui/icons/Error';
import CheckIcon from '@material-ui/icons/Check';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import QueryBuilderIcon from '@material-ui/icons/QueryBuilder';
// @ts-ignore
import Linkify from 'react-linkify'
// @ts-ignore
import removeEmptyLines from "remove-blank-lines"
import { onRepliedOrEditedClick } from '../Chat';
import { CircularProgress } from '@mui/material';
import { useSnackbar } from 'notistack'
import CloseIcon from '@material-ui/icons/Close';

type MessagePropsType = {
  message: MessageType,
  currentUserId: string | null,
  chatId: string | null,
  onResend: Function,
  onUnsentDelete: Function
  lastReadOfflineId: string | null
  isFirst: boolean,
  isLast: boolean,
  onEditClick: Function
  onDelete: Function
  onReplyClick: Function
}

const Message: React.FC<MessagePropsType> = React.memo((props: MessagePropsType) => {
  const {
    isFirst, isLast, onResend, onUnsentDelete, chatId, currentUserId,
    message, lastReadOfflineId, onEditClick, onDelete, onReplyClick
  } = props

  const side = message.creator.id === currentUserId ? 'right' : 'left'
  const isSingle = isFirst && isLast
  const creationTime = moment(message.createdAt).format("HH:mm")
  const isOwn = message.creator.id === currentUserId
  const isUnsentMessage = message.id === '-1' && message.sendingError
  const isSendingMessage = message.id === '-1' && !message.sendingError
  let readByAnotherParticipants = message.readBy.length > 1

  const isReadByInterlocutor = isOwn && readByAnotherParticipants
  const isRead = (!isOwn && message.readBy.includes(currentUserId || '-1'))
    || (lastReadOfflineId || '0') >= message.id

  const text = message.text
  const trimmedText = removeEmptyLines(text.trim())
  const unreadByCurrentUser = !isRead && !isOwn

  const [isDeleting, setIsDeleting] = useState(false)
  const [showAcceptDeleteDialog, setShowAcceptDeleteDialog] = useState(false)
  const [checked, setChecked] = useState(false)
  const [menuAnchor, setMenuAnchor] = useState(null)

  const classes = useStyles({ side, isFirst, isLast, isSingle })
  const windowId = useSelector((state: AppStateType) => state.app.windowId)
  const theme = useTheme()
  const { t } = useTranslation();
  let actionsAnchor = useRef(null)
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  const onRepliedClick = () => {
    if (message.replied) {
      onRepliedOrEditedClick(message.replied.id, theme.palette.divider)
    }
  }

  const unreadDotClasses = cn(
    classes.messageLabel,
    isOwn
      ? classes.rightMessageLabel
      : classes.leftMessageLabel
  )

  const renderUnreadDot = (
    <Fade
      timeout={unreadByCurrentUser ? 0 : 2199}
      in={unreadByCurrentUser}
    >
      <div className={unreadDotClasses} />
    </Fade>
  )

  const messageClasses = cn(
    'message',
    classes.message,
    isOwn ? classes.rightMessage : classes.leftMessage,
    isOwn && isFirst ? classes.firstRightMessage : '',
    isOwn && isLast ? classes.lastRightMessage : '',
    isOwn && isSingle ? classes.singleRightMessage : '',
    !isOwn && isFirst ? classes.firstLeftMessage : '',
    !isOwn && isLast ? classes.lastLeftMessage : '',
    !isOwn && isSingle ? classes.singleLeftMessage : '',
  )

  const replied = message.replied

  const renderReplied = !!replied &&
    <div
      className={classes.repliedWrapper}
      onClick={onRepliedClick}
    >
      <div className={classes.repliedBorder} />
      <div className={classes.replied} >
        <Typography
          className={classes.repliedHeader}
          variant='subtitle2'
          children={
            replied.creator.firstName + ' ' + replied.creator.lastName
          }
        />
        <div className={classes.repliedMessageText}>
          {replied.text}
        </div>
      </div>
    </div>

  const renderMessage = (
    <div
      id={message.id}
      data-isown={isOwn ? 1 : 0}
      data-isread={isRead ? 1 : 0}
      data-isreadbyinterlocutor={isReadByInterlocutor ? 1 : 0}
      className={messageClasses}
    >
      {renderUnreadDot}

      <div className={classes.messageContent} >
        {renderReplied}
        <div className={classes.textAndInfo}>
          <Linkify
            componentDecorator={(decoratedHref: any, decoratedText: string, key: any) => (
              // componentDecorator нужен для открытия ссылки в новом окне
              <a target="blank" href={decoratedHref} key={key}>{decoratedText}</a>
            )}
            children={trimmedText}
          />
          <span className={classes.messageInfo}>
            <Typography
              variant='caption'
              color='textSecondary'
              children={creationTime}
            />
            {message.isEdited &&
              <Typography
                component='span'
                variant='caption'
                color='textSecondary'
                style={{ marginLeft: 5, }}
                children={t('chat message edited')}
              />
            }
            {message.sendingError &&
              <div className={cn(classes.statusIcon, classes.errorStatusIcon)} >
                <ErrorIcon fontSize='small' color='error' />
              </div>
            }
            {isSendingMessage &&
              <QueryBuilderIcon className={classes.statusIcon} fontSize={'small'} />
            }
            {!isUnsentMessage && !isSendingMessage && isOwn && !isReadByInterlocutor &&
              <CheckIcon className={classes.statusIcon} fontSize={'small'} />
            }
            {isReadByInterlocutor && isOwn &&
              <DoneAllIcon className={classes.statusIcon} fontSize={'small'} />
            }
          </span>
        </div>
      </div>

      {isDeleting &&
        <div
          className={cn(
            classes.deleting,
            side === 'left' ? classes.deletingLeft : classes.deletingRight)
          }
          children={<CircularProgress size={28} />}
        />
      }
    </div>
  )

  const openMenu = (e: any) => {
    setMenuAnchor(actionsAnchor.current)
  }

  const handleClickAwayMenu = (e: any) => {
    menuAnchor && setMenuAnchor(null)
  }

  const handleDelete = async () => {
    if (!chatId || !currentUserId) return
    try {
      setIsDeleting(true)
      if (checked) {
        await chatsAPI.updateMessage(message.id, 'is_deleted', 1, windowId)
        onDelete()
      } else {
        await chatsAPI.deleteMessage(chatId, message.id)
        onDelete()
      }
    } catch (e) {
      const snackbarActions = (key: any) => (
        <IconButton
          size='small'
          onClick={() => closeSnackbar(key)}
          children={<CloseIcon />}
        />
      )
      enqueueSnackbar(
        t('Chat message deleting error'),
        { action: snackbarActions, variant: 'error' }
      )
      setIsDeleting(false)
    }
  }

  const handleAcceptDeleteDialogClose = () => {
    setShowAcceptDeleteDialog(false)
  }

  const handleDialogOnYesClick = () => {
    message.sendingError
      ? onUnsentDelete(message.clientId) : handleDelete()
    setShowAcceptDeleteDialog(false)
    setMenuAnchor(null)
  }

  const handleCheckDeleteForAll = (e: any) => {
    setChecked(e.target.checked)
  }

  const renderAcceptDeleteDialog = (
    <Dialog
      onClose={handleAcceptDeleteDialogClose}
      aria-labelledby="simple-dialog-title"
      open={showAcceptDeleteDialog}
    >
      <DialogTitle
        children={t('Delete message?')}
      />

      {!message.sendingError && currentUserId === message.creator.id &&
        <DialogContent >
          <FormControlLabel
            control={
              <Checkbox
                checked={checked}
                name="checkedC"
                onChange={handleCheckDeleteForAll}
              />
            }
            label={t('Delete for all')}
          />
        </DialogContent>
      }

      <DialogActions>
        <Button
          onClick={handleAcceptDeleteDialogClose}
          children={t('Cancel')}
        />
        <Button
          onClick={handleDialogOnYesClick}
          children={t('Yes')}
        />
      </DialogActions>
    </Dialog>
  )

  const handleEditClick = () => {
    setMenuAnchor(null)
    onEditClick(message)
  }

  const handleReplyClick = () => {
    setMenuAnchor(null)
    onReplyClick(message)
  }

  const handleOpenAcceptDeleteDialog = () => {
    setShowAcceptDeleteDialog(true)
  }

  const renderMenu = (
    <ClickAwayListener onClickAway={handleClickAwayMenu} >
      <div>
        <PopperMenu
          style={{ zIndex: 1 }}
          placement={side === 'left' ? 'top-start' : 'top-end'}
          open={!!menuAnchor}
          anchorEl={menuAnchor}
          dense
        >
          {!isUnsentMessage && isOwn &&
            <MenuItem
              onClick={handleEditClick}
              children={t('Edit')}
              disabled={isDeleting}
            />
          }
          {!isUnsentMessage &&
            <MenuItem
              onClick={handleReplyClick}
              children={t('Reply')}
              disabled={isDeleting}
            />
          }
          <MenuItemWithProgress
            children={t('Delete')}
            onClick={handleOpenAcceptDeleteDialog}
            disabled={isDeleting}
            enableProgress={isDeleting}
            progressSize={32}
          />
          {renderAcceptDeleteDialog}
        </PopperMenu>
      </div>
    </ClickAwayListener>
  )

  const handleMessageResend = () => {
    onResend(message.id === '-1' ? message.clientId : message.id)
  }

  const actionsClasses = cn(
    classes.actions,
    !!menuAnchor ? classes.visible : classes.hidden
  )

  const moreActionsButtonClasses = cn(
    classes.moreActionButton,
    !!menuAnchor ? classes.moreActionsButtonActive : ''
  )

  const renderActions = (
    <div
      ref={actionsAnchor}
      className={actionsClasses}
    >
      <div className={classes.actionsButtonCont}>
        <IconButton
          size='small'
          onClick={openMenu}
          className={moreActionsButtonClasses}
          disableRipple
          children={<MoreHorizIcon />}
        />
        <div className={classes.underActionsButton} />
      </div>
      {message.sendingError &&
        <IconButton
          onClick={handleMessageResend}
          size='small'
          children={<LoopIcon />}
        />
      }
    </div>
  )

  const containerClasses = cn(
    classes.container,
    isOwn
      ? classes.rightMessageContainer
      : classes.leftMessageContainer
  )

  return (
    <div className={containerClasses}>
      {!isDeleting && renderActions}
      {renderMessage}
      {!isDeleting && !!menuAnchor && renderMenu}
    </div>
  );
})

export default Message