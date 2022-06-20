import React, { forwardRef, useEffect, useRef, useState } from 'react';
import {NavLink, Link} from 'react-router-dom'
import {useStyles} from './ChatsStyles'
import { AppStateType } from '../../redux/redux_store.js';
import { Card, List, ListItem, ListItemAvatar, Avatar, ListItemText, Typography, Paper, CircularProgress } from '@material-ui/core';
import FlickeringDotBadge from '../Common/FlickeringDotBadge';
import Skeleton from '@material-ui/lab/Skeleton';
import moment from 'moment';
import LoadMore from '../Common/LoadMore';
import { useTranslation } from 'react-i18next';
import { loadMorePreviews } from '../../redux/chats_reducer';
import { imagesStorage } from '../../api/api';
import CheckIcon from '@material-ui/icons/Check';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import EmptyListStub from '../Common/EmptyListStub';
import EmptyListStub2 from '../Common/EmptyListStub2';
import FlipMove from 'react-flip-move';
import { MessageType } from '../../types/chats_types';
import ErrorIcon from '@material-ui/icons/Error';
import { getChatById } from '../../redux/chats_selectors';
import { useDots, useTemp } from '../../hooks/hooks_ts';
import SimpleAvatar from '../Common/SimpleAvatar';

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

  useEffect(() => {
    setInterlocutorIsTyping(false)
  }, [lastMessage])
  
  return <ListItem
      key={chatId}
      disableRipple
      button
      selected={selected}
      component={Link}
      to={to}
    >
      <div style={{display: 'flex', width: '100%'}}>

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

          {/* <Avatar
            className={classes.avatar} 
            src={interlocutorAvatar}
          /> */}
        </FlickeringDotBadge>

        <div style={{flexGrow: 1, marginLeft: 8, minWidth: 0}}>
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 2}}>
            <Typography
              component='div'
              variant='subtitle2'
              children={interlocutorName}
              style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: 12}}
            />
            <Typography
              style={{marginLeft: 'auto'}}
              component='span'
              variant='caption'
              color='textSecondary'
              children={lastMessageDate}
            />
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            { lastMessage && !interlocutorIsTyping &&
              <Typography
                variant='body2'
                component='div'
                color='textSecondary'
                children={lastMessageText}
                style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: 12}}
              />
            }
            { interlocutorIsTyping &&
              <Typography variant='body2' children={`is typing ${dots}`} />
            }
            { !lastMessage && !interlocutorIsTyping && '=Empty='}
            { !!lastMessage && lastMessage.creator.id === currentUserId &&
              <div>
                { !lastMessage.sendingError
                  ? ( lastMessage.id === '-1'
                      ? <CircularProgress size={17} />
                      : (lastMessage.readBy.includes(interlocutorId)
                        ? <DoneAllIcon style={{display: 'block'}} color='inherit' />
                        : <CheckIcon style={{display: 'block'}} color='inherit' />
                      )
                  )
                  : <ErrorIcon color='error' style={{display: 'block'}} />
                }
              </div>
            }
            { chatUnreadMessagesCount > 0 &&
              <div className={classes.unreadCount} >
                {chatUnreadMessagesCount}
              </div>
            }
          </div>
        </div>
      </div>

  </ListItem>
})

export default ChatPreview