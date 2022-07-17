import React, { useCallback, useEffect, useRef, useState } from 'react';
import { actions, loadUserChats } from '../../redux/chats_reducer';
import { pusher } from '../../api/api';
import { useDispatch, useSelector } from 'react-redux';
import { AppStateType } from '../../redux/redux_store';
import { debounce } from '../../helper/helperFunctions';
import IconButton from "@material-ui/core/IconButton";
import Close from '@material-ui/icons/Close';
import { useSnackbar } from 'notistack';
import {
  Redirect, Route, Switch, useHistory, useLocation
} from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Paper, useMediaQuery } from '@material-ui/core';
import {
  playSound, removeUnsentMessagesFromStorage
} from '../../helper/helperChatFunctions';
import {
  ActionType, ChatType, MessageType,
  CREATE_CHAT, CREATE_MESSAGE, DELETE_HISTORY, DELETE_MESSAGE,
  MESSAGE_DELETED_FOR_ALL, UPDATE_LAST_READ_MESSAGE_ID
} from '../../types/chats_types';
import { usePrevious } from '../../hooks/hooks_ts';
import { useStyles } from './ChatsStyles'
import Chat from './Chat/Chat';
import ChatsPreviews from './ChatPreviews/ChatsPreviews';
import StickyPanel from '../Common/StickyPanel';
import Adv from '../Adv/Adv';

const playSoundDebounced = debounce(playSound, 10)

const Chats = React.memo((props) => {

  const chatsPreviewsList = useSelector((state: AppStateType) => state.chats.chatsPreviews)
  const chats = useSelector((state: AppStateType) => state.chats.chats)
  const currentUserId = useSelector((state: AppStateType) => state.auth.id)
  const currentUserIdRef = useRef(currentUserId)
  const dispatch = useDispatch()
  const events = useRef<Array<ActionType>>([])
  const [newEventReceived, setNewEventReceived] = useState(false)
  const prevNewMessageReceived = usePrevious<boolean>(newEventReceived)
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const location = useLocation()
  const { t } = useTranslation();
  const history = useHistory()
  const isOnline = useSelector((state: AppStateType) => state.app.isOnline)
  const isOnlineRef = useRef(isOnline)
  const splittedPathName = location.pathname.split('/')
  const chatsIsOpen = splittedPathName[1] === 'chats'
  const chatIsOpen = splittedPathName[1] === 'chats' && splittedPathName[2] === 'c'
  const chatIsOpenRef = useRef(chatIsOpen)
  const interlocutorId = chatIsOpen ? splittedPathName[3] : null
  const windowId = useSelector((state: AppStateType) => state.app.windowId)
  const classes = useStyles({ dialogueIsOpen: true })
  const mobile = useMediaQuery('(max-width: 860px)')
  const [sendingMessages, setSendingMessages] = useState<Array<MessageType>>([])
  const sendingMessagesRef = useRef<Array<MessageType>>([])
  const [creatingChats, setCreatingChats] = useState<Array<ChatType>>([])
  const [messagesForCreatingChats, setMessagesForCreatingChats] = useState<Array<MessageType>>([])
  const [messagesForRestoringChats, setMessagesForRestoringChats] = useState<Array<MessageType>>([])
  const [pendingMessages, setPendingMessages] = useState<Array<MessageType>>([])
  /*
  Сообщения, которые были отложены до создания чата или до окончания восстановления
    Когда чат создан, приходит событие через вебсокет, после чего он добавляется
    в список чатов, после чего из этого массива берутся все сообщения, которые нужно
    создать в этом чате
  */
  const [chatsStubs, setChatsStubs] = useState<Array<ChatType>>([])
  const [readOffine, setReadOffline] = useState<Array<any>>([])
  const [onlineChats, setOnlineChats] = useState<Array<any>>([])
  const [typingChats, setTypingChats] = useState<Array<any>>([])

  const chatIsRestoring = useRef<boolean>(false)

  const openedChat = findChatByParticipantsIds(currentUserId || "", interlocutorId || "", chats)
  const openedChatId = openedChat?.id
  const openedChatIdRef = useRef(openedChat?.id)

  useEffect(() => {
    currentUserIdRef.current = currentUserId
  }, [currentUserId])

  useEffect(() => {
    if (chatsIsOpen && !chatIsOpen) {
      document.title = t('Messenger')
    }
  }, [t, chatsIsOpen, chatIsOpen])

  useEffect(() => {
    openedChatIdRef.current = openedChat?.id
  }, [openedChat])

  useEffect(() => {
    sendingMessagesRef.current = sendingMessages
  }, [sendingMessages])

  useEffect(() => {
    if (chatsIsOpen && currentUserId && !chatsPreviewsList) {
      dispatch(loadUserChats(currentUserId, 20, null, true))
    }
  }, [chatsIsOpen, currentUserId, chatsPreviewsList, dispatch])

  function findChatByParticipantsIds(
    firstId: string, secondId: string, chats: Array<ChatType>
  ): ChatType | undefined {
    return chats.find(c => {
      return ((c.participants[0].id === firstId && c.participants[1].id === secondId)
        || (c.participants[1].id === firstId && c.participants[0].id === secondId))
    })
  }

  useEffect(() => {
    isOnlineRef.current = isOnline
  }, [isOnline])

  useEffect(() => {
    chatIsOpenRef.current = chatIsOpen
  }, [chatIsOpen])

  const onAddMessage = async (action: ActionType) => {
    const message = action.extraProps.message
    const createdByCurrentUser = message.creator.id === currentUserId
    message.createdInCurrentWindow = action.placeId === windowId
    dispatch(actions.addMessageToChat(action.chatId, message, createdByCurrentUser))
    dispatch(actions.addMessageToPreview(action.extraProps.chat, message, currentUserId || '-1'))
    setSendingMessages(prev => prev.filter(psm => psm.clientId !== message.clientId))
  }

  const onCreateChat = async (action: ActionType) => {
    const actionFirstMessage = action.extraProps.firstMessage
    let stub = chatsStubs.find(cc => cc.clientId === action.chatClientId)
    // Если найден, то чат создан в этом окне
    if (stub) {
      stub.creatingError = false
      stub.id = action.chatId
      const creatingChatClientId = stub.clientId
      const firstMessage = sendingMessages.find(sm => sm.clientId === actionFirstMessage.clientId)
      if (firstMessage) {
        firstMessage.id = actionFirstMessage.id
        stub.messages = [firstMessage, ...stub.messages]
        stub.lastMessage = firstMessage
        setSendingMessages(prev => prev.filter(sm => sm.clientId !== firstMessage.clientId))
      }
      dispatch(actions.addChat(stub))
      const chatPreview = { ...stub, messages: [] }
      dispatch(actions.addPreview(chatPreview, currentUserId || ''))
      setChatsStubs(prev => prev.filter(stub => stub.clientId !== creatingChatClientId))
    } else {
      const chat = action.extraProps.chat
      const firstMessage = action.extraProps.firstMessage
      firstMessage.createdInCurrentWindow = action.placeId === windowId
      chat.messages.push(firstMessage)
      chat.nextMessageCursor = null
      chat.prevMessageCursor = null
      dispatch(actions.addChat(chat))
      dispatch(actions.addPreview(chat, currentUserId || ''))
      setChatsStubs(prev => prev.filter(stub => stub.clientId !== action.chatClientId))
    }
  }

  const onDeleteMessage = (action: ActionType) => {
    if (currentUserId) {
      dispatch(actions.deleteMessage(
        action.chatId,
        action.extraProps.messageId,
        action.extraProps.messageCreatorId,
        currentUserId,
        action.extraProps.lastMessage
      ))
    }
  }

  const onAddMessageRef = useRef(onAddMessage)
  const onDeleteMessageRef = useRef(onDeleteMessage)
  const onCreateChatRef = useRef(onCreateChat)

  useEffect(() => {
    onAddMessageRef.current = onAddMessage
    onDeleteMessageRef.current = onDeleteMessage
    onCreateChatRef.current = onCreateChat
  })

  const executeEvents = useCallback((events: Array<ActionType>) => {
    while (events.length) {
      let action = events.shift()
      if (action) {
        if (action.type === CREATE_CHAT) {
          onCreateChatRef.current(action)
        } else if (action.type === CREATE_MESSAGE) {
          onAddMessageRef.current(action)
        } else if (action.type === DELETE_MESSAGE) {
          onDeleteMessageRef.current(action)
        } else if (action.type === MESSAGE_DELETED_FOR_ALL) {
          onDeleteMessageRef.current(action)
        } else if (action.type === UPDATE_LAST_READ_MESSAGE_ID) {
          dispatch(actions.setPreviewLastReadMessageId(
            action.chatId,
            action.extraProps.messageId,
            action.extraProps.unreadMessagesCount,
            action.initiatorId,
            currentUserId || ''
          ))
          dispatch(actions.setChatLastReadMessageId(
            action.chatId,
            action.extraProps.messageId,
            action.extraProps.unreadMessagesCount,
            action.initiatorId,
            currentUserId || ''
          ))
        } else if (action.type === DELETE_HISTORY) {
          dispatch(actions.deleteHistory(action.chatId))
          removeUnsentMessagesFromStorage(action.chatId)
          if (openedChatIdRef.current === action.chatId) {
            history.push(`/chats`)
          }
        }
      }
    }
  }, [currentUserId, dispatch, history])

  const prevChatsPreviewsList = usePrevious(chatsPreviewsList)

  useEffect(() => {
    if (chatsPreviewsList && prevChatsPreviewsList === null) {
      executeEvents(events.current) // Выполняется при начальной загрузке чатов
    }
  }, [chatsPreviewsList, prevChatsPreviewsList, executeEvents])

  useEffect(() => {
    if (prevNewMessageReceived !== undefined) {
      executeEvents(events.current)
    }
  }, [newEventReceived, prevNewMessageReceived, executeEvents])

  const createNewMessageSnackBar = (message: any) => {
    if (!isOnlineRef.current) return

    if (!chatIsOpenRef.current && message.creator.id !== currentUserIdRef.current) {
      const action = function (key: any) {
        const onButtonClick = () => {
          history.push(`/chats/c/${message.creator.id}`)
          closeSnackbar(key)
        }
        return (
          <div style={{ display: 'flex' }}>
            <Button
              onClick={onButtonClick}
              style={{ marginRight: 8 }}
              children={t('Watch')}
            />
            <IconButton
              size='small'
              onClick={() => { closeSnackbar(key) }}
              children={<Close />}
            />
          </div>
        )
      }
      const creator = message.creator
      const senderName = `${creator.firstName} ${creator.lastName}`
      const text = `${senderName} ${t('sent you private message')}`
      enqueueSnackbar(text, { action, variant: 'info' })
      playSoundDebounced()
    }
  }

  const addEvent = (event: ActionType) => {
    if (isOnlineRef.current) {
      events.current.push(event)
      setNewEventReceived(prev => !prev)
    }
  }

  const handleInterlocutorOnlineAction = (chatId: string) => {
    setOnlineChats(prev => {
      const same = prev.find(p => p.chatId === chatId)
      if (same) {
        const copy = [...prev]
        copy[prev.indexOf(same)] = { chatId: chatId, timestamp: Date.now() }
        return copy
      } else {
        return [...prev, { chatId: chatId, timestamp: Date.now() }]
      }
    })
  }

  useEffect(() => {
    if (currentUserId) { // && currentUserId !== prevCurrentUserId) {
      let chatsChannel = pusher.subscribe(`chat_${currentUserId}`)
      chatsChannel.bind(CREATE_MESSAGE, function (data: ActionType) {
        if (data.initiatorId !== currentUserId) {
          handleInterlocutorOnlineAction(data.chatId)
        }
        addEvent(data)
        createNewMessageSnackBar(data.extraProps.message)
        setTypingChats(prev => prev.filter(p => p.chatId !== data.chatId))
      })
      chatsChannel.bind(CREATE_CHAT, function (data: ActionType) {
        addEvent(data)
        createNewMessageSnackBar(data.extraProps.firstMessage)
        setTypingChats(prev => prev.filter(p => p.chatId !== data.chatId))
      })
      chatsChannel.bind(DELETE_MESSAGE, function (data: ActionType) {
        addEvent(data)
      })
      chatsChannel.bind(MESSAGE_DELETED_FOR_ALL, function (data: ActionType) {
        addEvent(data)
      })
      chatsChannel.bind(UPDATE_LAST_READ_MESSAGE_ID, function (data: ActionType) {
        addEvent(data)
      })
      chatsChannel.bind(DELETE_HISTORY, function (data: ActionType) {
        addEvent(data)
      })
      chatsChannel.bind('typing-message', function (data: any) {
        setTypingChats(prev => {
          const same = prev.find(p => p.chatId === data.chat_id)
          if (same) {
            const copy = [...prev]
            copy[prev.indexOf(same)] = { chatId: data.chat_id, timestamp: data.timestamp }
            return copy
          } else {
            return [...prev, { chatId: data.chat_id, timestamp: data.timestamp }]
          }
        })
        handleInterlocutorOnlineAction(data.chat_id)
      })
      return () => {
        chatsChannel.unsubscribe()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId])

  if (!currentUserId) {
    return <Redirect to="/login" />
  }

  const renderPreviews = <ChatsPreviews
    chatsStubs={chatsStubs}
    sendingMessages={sendingMessages}
    pendingMessages={pendingMessages}
    messagesForRestoringChats={messagesForRestoringChats}
    messagesForCreatingChats={messagesForCreatingChats}
    readOffine={readOffine}
    onlineChats={onlineChats}
    typingChats={typingChats}
  />

  return (
    <Route
      path='/chats'
      render={() => (
        <div className={classes.chats}>
          <main className={classes.root}>
            <Switch>
              <Route
                exact path='/chats/c/:id'
                render={() => <Chat
                  chatsStubs={chatsStubs}
                  setChatsStubs={setChatsStubs}
                  sendingMessages={sendingMessages}
                  setSendingMessages={setSendingMessages}
                  creatingChats={creatingChats}
                  setCreatingChats={setCreatingChats}
                  pendingMessages={pendingMessages}
                  setPendingMessages={setPendingMessages}
                  chatIsRestoring={chatIsRestoring.current}
                  messagesForRestoringChats={messagesForRestoringChats}
                  setMessagesForRestoringChats={setMessagesForRestoringChats}
                  messagesForCreatingChats={messagesForCreatingChats}
                  setMessagesForCreatingChats={setMessagesForCreatingChats}
                  readOffine={readOffine}
                  setReadOffline={setReadOffline}
                  lastTypingTimestamp={typingChats.find(tc => tc.chatId === openedChatId)?.timestamp}
                  lastOnlineTimestamp={onlineChats.find(tc => tc.chatId === openedChatId)?.timestamp}
                />}
              />
              <Route
                exact path='/chats'
                render={() => (
                  <div className={classes.widePreviews}>
                    {renderPreviews}
                  </div>
                )}
              />
            </Switch>
          </main>

          {!mobile && chatIsOpen &&
            <div className={classes.asideChatsPreviewsWrapper}>
              <Paper className={classes.rightChatsList}>
                {renderPreviews}
              </Paper>
            </div>
          }
          {!mobile && !chatIsOpen &&
            <div className={'aside-content'}>
              <StickyPanel top={55} >
                <Adv imageSrc={'/images/rekl/222.jpeg'} />
              </StickyPanel>
            </div>
          }
        </div>
      )}
    />
  )
})

export default Chats