import React, { useCallback, useEffect, useRef, useState } from 'react';
import { actions, loadUserChats } from '../../redux/chats_reducer';
import {actions as appActions} from '../../redux/app_reducer';
import { chatsAPI } from '../../api/chats_api';
import { pusher } from '../../api/api';
import { connect, useDispatch, useSelector } from 'react-redux';
import { AppStateType } from '../../redux/redux_store';
import { debounce } from '../../helper/helperFunctions';
import IconButton from "@material-ui/core/IconButton";
import Close from '@material-ui/icons/Close';
import { useSnackbar } from 'notistack';
import { NavLink, Redirect, Route, Switch, useHistory, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Paper, Typography, useMediaQuery } from '@material-ui/core';
import { addUnsentMessageToStorage, createNewMessage, createNewPairChat, createUlidId, createUser, playSound, removeUnsentMessagesFromStorage } from './helperChatFunctions';
import { ActionType, ChatType, CREATE_CHAT, CREATE_MESSAGE, DELETE_HISTORY, DELETE_MESSAGE, MESSAGE_DELETED_FOR_ALL, EventType, MessageType, UPDATE_LAST_READ_MESSAGE_ID, UserType } from '../../types/chats_types';
import { usePrevious } from '../../hooks/hooks_ts';
import {useStyles} from './ChatsStyles'
import Chat from './Chat/Chat';
import ChatsPreviews from './ ChatsPreviews';
import StickyPanel from '../Common/StickyPanel';

const Chats = React.memo((props) => {

  // console.log('render chats')

  const chatsPreviewsList = useSelector((state: AppStateType) => state.chats.chatsPreviews)
  const chats = useSelector((state: AppStateType) => state.chats.chats)
  const currentUserId = useSelector((state: AppStateType) => state.auth.id)
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
  const prevIsOnline = usePrevious<boolean>(isOnline)
  const splittedPathName = location.pathname.split('/')
  const chatsIsOpen = splittedPathName[1] === 'chats' 
  const chatIsOpen = splittedPathName[1] === 'chats' && splittedPathName[2] === 'c'
  const chatIsOpenRef = useRef(chatIsOpen)
  const interlocutorId = chatIsOpen ? splittedPathName[3] : null
  // Пока isRestoringAfterReconnect === true, сообщения из веб сокета принимаются, но не выполняются
  // const isRestoringAfterReconnect = useSelector((state: AppStateType) => state.chats.isRestoringAfterReconnect)
  const windowId = useSelector((state: AppStateType) => state.app.windowId)
  const classes = useStyles({dialogueIsOpen: true})
  const mobile = useMediaQuery('(max-width: 860px)')
  const [sendingMessages, setSendingMessages] = useState<Array<MessageType>>([])
  const sendingMessagesRef = useRef<Array<MessageType>>([])
  const [creatingChats, setCreatingChats] = useState<Array<ChatType>>([])
  const [messagesForCreatingChats, setMessagesForCreatingChats] = useState<Array<MessageType>>([])
  const [messagesForRestoringChats, setMessagesForRestoringChats] = useState<Array<MessageType>>([])
  const [pendingMessages, setPendingMessages] = useState<Array<MessageType>>([]) // Сообщения, которые были отложены до создания чата или до окончания восстановления
  // Когда чат создан, приходит событие через вебсокет, после чего он добавляется в список чатов, после чего из этого массива берутся все сообщения, которые нужно
  // создать в этом чате
  const [kek, setKek] = useState<boolean>(false)
  const [chatsStubs, setChatsStubs] = useState<Array<ChatType>>([])
  const [ololo, setOlolo] = useState(0)
  const loadingChatsIds = useRef<Array<string>>([])
  const [notRestoredChatsIds, setNotRestoredChatsIds] = useState<Array<string> | null>(null)
  const [readOffine, setReadOffline] = useState<Array<any>>([])
  const [onlineChats, setOnlineChats] = useState<Array<any>>([])
  const [typingChats, setTypingChats] = useState<Array<any>>([])

  const chatIsRestoring = useRef<boolean>(false)
  const previewsAreRestoring = useRef<boolean>(false)

  const openedChat = findChatByParticipantsIds(currentUserId || "", interlocutorId || "", chats)
  const openedChatId = openedChat?.id
  const openedChatIdRef = useRef(openedChat?.id)

  useEffect(() => {
    // console.log('chats unmount')
  }, [])

  useEffect(() => {
    if(chatsIsOpen && !chatIsOpen) {
      document.title = t('Messenger')
    }
  }, [chatsIsOpen, chatIsOpen])

  useEffect(() => {
    openedChatIdRef.current = openedChat?.id
  }, [openedChatId])

  useEffect(() => {
    if(!isOnline && prevIsOnline) {
      const ids: Array<string> = []
      chats.forEach(chat => ids.push(chat.id))
      setNotRestoredChatsIds(ids) // Когда соединение пропадает, то в notRestoredChatsIds попадают ID всех чатов(полноценных), которые есть в redux store
    }
  }, [isOnline, chats])

  useEffect(() => {
    sendingMessagesRef.current = sendingMessages
  }, [sendingMessages])

  useEffect(() => {
    if(chatsIsOpen && currentUserId && !chatsPreviewsList) {
      dispatch(loadUserChats(currentUserId, 13, null, true))
    }
  }, [chatsIsOpen, currentUserId, chatsPreviewsList])

  function findChatByParticipantsIds(firstId: string, secondId: string, chats: Array<ChatType>): ChatType | undefined {
    return chats.find(c => {
      return ((c.participants[0].id === firstId && c.participants[1].id === secondId)
        || (c.participants[1].id === firstId && c.participants[0].id === secondId))
    })
  }

  useEffect(() => {
    /*
      Обновление списка чатов и открытого чата после восстановления интернет соединения
      Есть сценарий, когда чата не существует и показывается заглушка, затем пропадает интернет и пока интернета нет, происходит создание чата. В таком случае
      нужно также откладывать сообщения в pendingMessages и веб сокет сообщения для этого чата.
    */
    // (async function() {
    //   // console.log(isOnline, prevIsOnline)
    //   if(isOnline && prevIsOnline !== undefined && !prevIsOnline) {
    //     previewsAreRestoring.current = true
    //     if(currentUserId && chatsPreviewsList) {
    //       console.log('restore previews')
    //       await dispatch(loadUserChats(currentUserId, chatsPreviewsList.length, null, true))
    //       console.log('previews restored')
    //       previewsAreRestoring.current = false
    //     }
    //   }
    // }())
    isOnlineRef.current = isOnline
  }, [isOnline, prevIsOnline, currentUserId, chatsPreviewsList])

  useEffect(() => {
    chatIsOpenRef.current = chatIsOpen
  }, [chatIsOpen])

  const playSoundDebounced = useCallback(debounce(playSound, 10), [])

  const onAddMessage = async (action: ActionType) => {
    // console.log(action)
    const message = action.extraProps.message
    const createdByCurrentUser = message.creator.id === currentUserId
    message.createdInCurrentWindow = action.placeId === windowId
    // const sendingMessage = sendingMessages.find(sm => sm.clientId === message.clientId)
    // if(sendingMessage) {
    //   message.createdAt = sendingMessage.createdAt
    // }
    dispatch(actions.addMessageToChat(action.chatId, message, createdByCurrentUser))
    dispatch(actions.addMessageToPreview(action.extraProps.chat, message, currentUserId || '-1'))
    setSendingMessages(prev => prev.filter(psm => psm.clientId !== message.clientId))
    /*
    Здесь сообщение добавляется в чат из списка и в полный чат
     если чатов нет, то сообщение туда не будет добавлено. Но важно, что после нового сообщения чат должен быть вверху списка, если его вообще нет в списке, то его нужно
     загрузить, что и делается далее*/
    // if(previewsAreRestoring.current) {
    //   return
    // }
    // let chat = chatsPreviewsList ? chatsPreviewsList.find(c => c.id === action.chatId) : null
    // if(!chat) {
    //   const chatId = action.chatId
    //   if(!loadingChatsIds.current.includes(chatId)) {
    //     try {
    //       /*
    //       Когда чата нет в списке, нужно загрузить его, чтобы поместить его вверх списка. Пока он загружается, нужно сделать так, чтобы сообщения из веб сокета, которые связаны
    //       с этим чатом, не были "выполнены", пока чат грузится. Но это касается только СПИСКА чатов, то есть тех, которые находятся в chatsList 
    //       Мне кажется, что всё-таки нужен массив, где будут находиться ID чатов, которые загружаются, чтобы не было множественной загрузки одного и того же чата, 
    //       в случае, если пришло несколько сообщений подряд очень быстро. Также можно присылать чат сразу в событи, чтобы не загружать его.
    //       */
    //       loadingChatsIds.current.push(chatId)
    //       let chatResponse = await chatsAPI.getChat(chatId, 0)
    //       dispatch(actions.addPreview(chatResponse.data.chat, currentUserId || ''))
    //       loadingChatsIds.current = loadingChatsIds.current.filter(id => id !== chatId)
    //     } catch(e) {}
    //   }
    // }
  }

  const onCreateChat = async (action: ActionType) => {
    const actionFirstMessage = action.extraProps.firstMessage
    console.log('CREATE CHAT')
    // console.log(creatingChats)
    let stub = chatsStubs.find(cc => cc.clientId === action.chatClientId) // Если найден, то чат создан в этом окне
    // console.log(stub)
    if(stub) {
      stub.creatingError = false
      stub.id = action.chatId
      const creatingChatClientId = stub.clientId
      const firstMessage = sendingMessages.find(sm => sm.clientId === actionFirstMessage.clientId)
      // console.log(firstMessage)
      if(firstMessage) {
        firstMessage.id = actionFirstMessage.id
        stub.messages = [firstMessage, ...stub.messages]
        stub.lastMessage = firstMessage
        setSendingMessages(prev => prev.filter(sm => sm.clientId !== firstMessage.clientId))
      }
      dispatch(actions.addChat(stub))
      const chatPreview = {...stub, messages: []}
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
    // console.log(action)
    if(currentUserId) {
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

  const executeEvents = (events: Array<ActionType>) => {
    while(events.length) {
      let action = events.shift()
      if(action) {
        if(action.type === CREATE_CHAT) {
          onCreateChatRef.current(action)
        } else if(action.type === CREATE_MESSAGE) {
          onAddMessageRef.current(action)
        } else if(action.type === DELETE_MESSAGE) {
          onDeleteMessageRef.current(action)
        } else if(action.type === MESSAGE_DELETED_FOR_ALL) {
          onDeleteMessageRef.current(action)
        } else if(action.type === UPDATE_LAST_READ_MESSAGE_ID) {
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
        } else if(action.type === DELETE_HISTORY) {
          dispatch(actions.deleteHistory(action.chatId))
          removeUnsentMessagesFromStorage(action.chatId)
          if(openedChatIdRef.current === action.chatId) {
            history.push(`/chats`)
          }
        }
      }
    }
  }

  const prevChatsPreviewsList = usePrevious(chatsPreviewsList)

  useEffect(() => {
    if(chatsPreviewsList && prevChatsPreviewsList === null) {
      executeEvents(events.current) // Выполняется при начальной загрузке чатов
    } 
  }, [chatsPreviewsList])

  useEffect(() => {
    if(prevNewMessageReceived !== undefined) {
      executeEvents(events.current)
    }
  }, [newEventReceived])

  const createSnackBar = (message: any) => {
    if(!isOnlineRef.current) {
      return
    }
    if(!chatIsOpenRef.current && message.creator.id !== currentUserId) {
      const actions = function(key: any) {
        const onButtonClick = () => {
          history.push(`/chats/c/${message.creator.id}`)
          closeSnackbar(key)
        }
        return (
          <div style={{display: 'flex'}}>
            <Button
              onClick={onButtonClick}
              style={{marginRight: 8}}
              children={t('To watch')}
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
      enqueueSnackbar(text, {action: actions, variant: 'info'})
      playSoundDebounced()
    }
  }

  const addEvent = useCallback((event: ActionType) => {
    if(isOnlineRef.current) {
      events.current.push(event)
      setNewEventReceived(prev => !prev) 
    }
  }, [])

  const handleInterlocutorOnlineAction = (chatId: string) => {
    setOnlineChats(prev => {
      const same = prev.find(p => p.chatId === chatId)
      if(same) {
        const copy = [...prev]
        copy[prev.indexOf(same)] = {chatId: chatId, timestamp: Date.now()}
        return copy
      } else {
        return [...prev, {chatId: chatId, timestamp: Date.now()}]
      }
    })
  }

  useEffect(() => {
    if(currentUserId) {
      let chatsChannel = pusher.subscribe(`chat_${currentUserId}`)
      chatsChannel.bind(CREATE_MESSAGE, function(data: ActionType) {
        // console.log(data)
        if(data.initiatorId !== currentUserId) {
          handleInterlocutorOnlineAction(data.chatId)
        }
        addEvent(data)
        createSnackBar(data.extraProps.message)
        setTypingChats(prev => prev.filter(p => p.chatId !== data.chatId))
      })
      chatsChannel.bind(CREATE_CHAT, function(data: ActionType) {
        // console.log(data)
        addEvent(data)
        createSnackBar(data.extraProps.firstMessage)
        setTypingChats(prev => prev.filter(p => p.chatId !== data.chatId))
      })
      chatsChannel.bind(DELETE_MESSAGE, function(data: ActionType) {
        // console.log(data)
        addEvent(data)
      })
      chatsChannel.bind(MESSAGE_DELETED_FOR_ALL, function(data: ActionType) {
        addEvent(data)
      })
      chatsChannel.bind(UPDATE_LAST_READ_MESSAGE_ID, function(data: ActionType) {
        // console.log(data)
        addEvent(data)
      })
      chatsChannel.bind(DELETE_HISTORY, function(data: ActionType) {
        addEvent(data)
      })
      chatsChannel.bind('typing-message', function(data: any) {
        console.log(data)
        setTypingChats(prev => {
          const same = prev.find(p => p.chatId === data.chat_id)
          if(same) {
            const copy = [...prev]
            copy[prev.indexOf(same)] = {chatId: data.chat_id, timestamp: data.timestamp}
            return copy
          } else {
            return [...prev, {chatId: data.chat_id, timestamp: data.timestamp}]
          }
        })
        handleInterlocutorOnlineAction(data.chat_id)
      })
      return () => chatsChannel.unsubscribe()
    }
  }, [currentUserId])

  const [counter, setCounter] = useState(0)

  if(!currentUserId) {
    return <Redirect to="/login"/>
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

  const renderRightPanel = !mobile && !chatIsOpen
    ? <div className={classes.rightPanel}>
      <StickyPanel top={55} >
        <Paper style={{padding: 16}}>
          <Typography variant='body2' color='textSecondary' style={{marginBottom: 8}}>Реклама</Typography>
          <NavLink to='/kek' ><img style={{width: '100%'}} src='/images/rekl/222.jpeg' /></NavLink>
        </Paper>
      </StickyPanel>
    </div>
    : null

  return (
    <Route
      path='/chats'
      render={() => {
        return (
          <div style={{ display: 'flex', height: '100%' }}>
            <main className={classes.root}>
              {/* <div onClick={() => setCounter(prev => prev + 1)}>click</div>
              <div>{counter}</div> */}
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
                    notRestoredChatsIds={notRestoredChatsIds}
                    setNotRestoredChatsIds={setNotRestoredChatsIds}
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
                  render={() => <div style={{paddingBottom: 16}}>
                    {renderPreviews}
                  </div>}
                />
              </Switch>
            </main>
            { !mobile && chatIsOpen &&
                <div style={{borderRadius: 4, overflow: 'hidden', marginLeft: 16, minWidth: 300}}>
                  <Paper
                    style={{overflowY: 'scroll', height: '100%'}}
                    className={chatsPreviewsList ? classes.rightChatsList : classes.rightChatsListLoading}
                  >
                    {renderPreviews}
                  </Paper>
                </div>
            }
            { renderRightPanel }
          </div>
        )
      }}
    />
  )
})

export default Chats