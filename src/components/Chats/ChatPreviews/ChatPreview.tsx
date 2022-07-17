import React, { useEffect } from 'react';
import { Link } from 'react-router-dom'
import { useStyles } from './ChatsPreviewsStyles'
import {
  ListItem, Typography, CircularProgress
} from '@material-ui/core';
import FlickeringDotBadge from '../../Common/FlickeringDotBadge';

import CheckIcon from '@material-ui/icons/Check';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import { MessageType } from '../../../types/chats_types';
import ErrorIcon from '@material-ui/icons/Error';
import {
  useDots, usePrevious, useTemp
} from '../../../hooks/hooks_ts';
import SimpleAvatar from '../../Common/SimpleAvatar';

type ChatPreviewPropsType = {
  to: string,
  chatId: string,
  interlocutorId: string,
  interlocutorName: string,
  interlocutorAvatar: string,
  lastMessage: MessageType | null,
  lastMessageText: string,
  lastMessageDate: string,
  currentUserId: string,
  chatUnreadMessagesCount: number,
  onlineTimestamp: number | null
  typingTimestamp: number | null
  selected: boolean
}

const ChatPreview: React.FC<ChatPreviewPropsType> = React.memo((props: ChatPreviewPropsType) => {
  const {
    to,
    chatId,
    interlocutorId,
    interlocutorName,
    interlocutorAvatar,
    lastMessage,
    lastMessageText,
    currentUserId,
    chatUnreadMessagesCount,
    onlineTimestamp,
    typingTimestamp,
    lastMessageDate,
    selected
  } = props

  const [isOnline] = useTemp(onlineTimestamp || 0, 15000)
  const [interlocutorIsTyping, setInterlocutorIsTyping] = useTemp(typingTimestamp || 0, 4000)
  const dots = useDots(interlocutorIsTyping)
  const classes = useStyles()

  const prevLastMessage = usePrevious(lastMessage)

  useEffect(() => {
    if (lastMessage && lastMessage.id > (prevLastMessage ? prevLastMessage.id : '0')) {
      setInterlocutorIsTyping(false)
    }
  }, [lastMessage, prevLastMessage, setInterlocutorIsTyping])

  return <ListItem
    key={chatId}
    disableRipple
    button
    selected={selected}
    component={Link}
    to={to}
  >
    <FlickeringDotBadge
      invisible={!isOnline}
      overlap="circular"
      variant="dot"
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
    >
      <SimpleAvatar
        width={56}
        picture={interlocutorAvatar}
        name={interlocutorName}
      />
    </FlickeringDotBadge>

    <div className={classes.chatInfo}>

      <div className={classes.interlocutorNameAndDate}>
        <Typography
          component='div'
          variant='subtitle2'
          children={interlocutorName}
          className={classes.interlocutorName}
        />
        <Typography
          component='span'
          variant='caption'
          color='textSecondary'
          children={lastMessageDate}
          className={classes.lastMessageDate}
        />
      </div>

      <div className={classes.lastMessage}>
        {lastMessage && !interlocutorIsTyping &&
          <Typography
            variant='body2'
            component='div'
            color='textSecondary'
            children={lastMessageText}
            className={classes.lastMessageText}
          />
        }
        {interlocutorIsTyping &&
          <Typography variant='body2' children={`is typing ${dots}`} />
        }
        {!lastMessage && !interlocutorIsTyping && '=Empty='}
        {!!lastMessage && lastMessage.creator.id === currentUserId &&
          <div>
            {!lastMessage.sendingError
              ? (lastMessage.id === '-1'
                ? <CircularProgress size={17} />
                : (lastMessage.readBy.includes(interlocutorId)
                  ? <DoneAllIcon color='inherit' />
                  : <CheckIcon color='inherit' />
                )
              )
              : <ErrorIcon color='error' />
            }
          </div>
        }
        {chatUnreadMessagesCount > 0 &&
          <div className={classes.unreadCount} >
            {chatUnreadMessagesCount}
          </div>
        }
      </div>
    </div>

  </ListItem>
})

export default ChatPreview