import React, {useState, useEffect, useRef, useCallback, useLayoutEffect} from 'react';
import { actions, deleteHistory, loadPrevMessages, loadNextMessages } from '../../../redux/chats_reducer'
import Message from './Message/Message'
import NewMessage  from './NewMessage/NewMessage'
import { Redirect, useHistory, useLocation, useParams} from 'react-router-dom'
import Avatar from '@material-ui/core/Avatar';
import {useTranslation} from 'react-i18next';
import { useStyles } from './ChatStyles';
import { DialogTitle, DialogContent, Button,  DialogActions,  FormControlLabel,  Checkbox,  Divider,  Badge, CircularProgress, MenuItem, Menu } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog'
import {NavLink, Link} from 'react-router-dom'
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import moment from 'moment'
import { pusher2} from '../../../api/api'
import DialogTitleWithCloseButton from '../../Common/DialogTitleWithCloseButton.jsx';
import { ChatType, DayType, MessageType } from '../../../types/chats_types';
import { useSelector, useDispatch } from 'react-redux';
import { AppStateType } from '../../../redux/redux_store';
import { profileAPI } from '../../../api/profile_api';
import { AxiosError } from 'axios';
import { getPairChat } from '../../../redux/chats_selectors';
import { chatsAPI } from '../../../api/chats_api';
import { getCurrentUserData } from '../../../redux/auth_selectors';
import {debounce, elementsCollectionToSimpleArray} from '../../../helper/helperFunctions';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import { withStyles } from '@material-ui/styles';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import TypographyLink from '../../Common/TypographyLink';
import { useDots, usePrevious, useTemp } from '../../../hooks/hooks_ts';
import { addUnsentMessageToStorage, createNewPairChat, createNewMessage, createUlidId, createUser, deleteDuplicates, getChatUnsentMessages, getUnsentMessageFromStorage, playSound, removeUnsentMessageFromStorage, sortMessages, getMessageContainerFormType, removeUnsentMessagesFromStorage, getPairChatByParticipantsId } from '../helperChatFunctions';
import ChatSkeleton from './ChatSkeleton';
import cn from 'classnames'
import NavLinkAvatar from '../../Common/NavLinkAvatar';
import { Skeleton } from '@material-ui/lab';
import FlickeringDotBadge from '../../Common/FlickeringDotBadge';
import { useSnackbar } from 'notistack';
import NewCircularProgress from '@mui/material/CircularProgress';

type ChatPropsType = {
  chatsStubs: Array<ChatType>
  setChatsStubs: React.Dispatch<React.SetStateAction<Array<ChatType>>>
  sendingMessages: Array<MessageType>
  setSendingMessages: React.Dispatch<React.SetStateAction<Array<MessageType>>>
  creatingChats: Array<ChatType>
  setCreatingChats: React.Dispatch<React.SetStateAction<Array<ChatType>>>
  notRestoredChatsIds: Array<string> | null
  setNotRestoredChatsIds: React.Dispatch<React.SetStateAction<Array<string> | null>>
  pendingMessages: Array<MessageType>
  setPendingMessages: React.Dispatch<React.SetStateAction<Array<MessageType>>>
  chatIsRestoring: boolean
  messagesForRestoringChats: Array<MessageType>
  setMessagesForRestoringChats: React.Dispatch<React.SetStateAction<Array<MessageType>>>
  messagesForCreatingChats: Array<MessageType>
  setMessagesForCreatingChats: React.Dispatch<React.SetStateAction<Array<MessageType>>>
  readOffine: Array<any>
  setReadOffline: React.Dispatch<React.SetStateAction<Array<any>>>
  lastTypingTimestamp: number | undefined
  lastOnlineTimestamp: number | undefined
}

const Chat: React.FC<ChatPropsType> = React.memo((props: ChatPropsType) => {
  const {
    chatsStubs, setChatsStubs, sendingMessages, setSendingMessages, creatingChats,
    messagesForRestoringChats, messagesForCreatingChats, setMessagesForCreatingChats,
    readOffine, setReadOffline, lastTypingTimestamp, lastOnlineTimestamp
  } = props

  const { t } = useTranslation();
  const classes = useStyles();
  const params: any = useParams();
  const location = useLocation()
  const history = useHistory()
  const isPairChat = location.pathname.split('/')[2] === 'c'
  const chatWrapperElem = useRef<HTMLDivElement>(null)
  const chatMessagesElem = useRef<HTMLDivElement>(null);
  const currentUserData = useSelector(getCurrentUserData)
  const dispatch = useDispatch()
  const [isInitialized, setIsInitialized] = useState<boolean>(false)
  const isInitializedRef = useRef(false)
  const windowId = useSelector((state: AppStateType) => state.app.windowId)
  let prevSendingMessages = usePrevious<Array<MessageType>>(sendingMessages)
  let currentUserId = useSelector((state: AppStateType) => state.auth.id) || "-1"
  const toBottomButton = useRef<HTMLButtonElement>(null)
  const [rerender] = useState<number>(0)
  let interlocutorId: string = params.id
  const foundChat = currentUserId // TypeScript не понимает, что currentUserId не может быть null, если этот компонент смонтирован, поэтому нужны дурацкие проверки. Возможно можно сделать это иначе,
    ? useSelector(getPairChat(currentUserId, interlocutorId)) : null // но пока так
  let existingChat: ChatType | null = foundChat ? foundChat : null
  const existingChatRef = useRef(existingChat)
  let messages = existingChat ? existingChat.messages : []
  let chatUnreadMessagesCount = existingChat ? existingChat.unreadMessagesCount : 0
  // readOffline - это значит, что прочитан, пока не было соединения, это нужно для того, чтобы мгновенно запечатлить, что пользователь видел сообщение
  const lastReadOffline = readOffine.find(ro => ro.chatId && ro.chatId === existingChat?.id)
  const lastReadOfflineId = lastReadOffline ? lastReadOffline.messageId : null
  const prevMessageCursor = existingChat ? existingChat.prevMessageCursor : null
  const nextMessageCursor = existingChat ? existingChat.nextMessageCursor : null
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()

  const [showSpinner, setShowSpinner] = useState(true)

  // useEffect(() => {
  //   setInterval(() => {
  //     setShowSpinner(prev => !prev)
  //   }, 100)
  // }, [])

  // console.log('rerender')

  if(lastReadOfflineId && existingChat) {
    // Если есть недогруженные сообщения внизу
    if(prevMessageCursor && existingChat?.lastReadMessageId && lastReadOfflineId > existingChat.lastReadMessageId) {
      const lastReadMessageId = existingChat.lastReadMessageId
      const messagesReadOfflineLength = existingChat.messages.filter(m => m.id <= lastReadOfflineId && m.id > lastReadMessageId).length
      chatUnreadMessagesCount = chatUnreadMessagesCount - messagesReadOfflineLength
    }
    // Если все сообщения непрочитанные и еще есть незагруженные непрочитанные.
    // Есть маленький период, пока lastReadOfflineId === null, в этот период будет показываться количество непрочитанных из store
    else if(!prevMessageCursor && nextMessageCursor && existingChat.messages.length < existingChat.unreadMessagesCount) {
      chatUnreadMessagesCount = existingChat.messages.filter(m => m.id > lastReadOfflineId).length
    }
    // Если все последние непрочитанные сообщения загружены
    else if(!prevMessageCursor && existingChat && lastReadOfflineId > (existingChat.lastReadMessageId || '0')) {
      chatUnreadMessagesCount = existingChat.messages.filter(m => m.id > lastReadOfflineId).length
    }
  }
  const chatUnreadMessagesCountRef = useRef(chatUnreadMessagesCount)
  
  const loadPrevIsIntersecting = useRef(false)
  let loadPrev = useRef(null)
  let loadNext = useRef(null)
  const [updateUnsent, setUpdateUnsent] = useState(false)
  const [tabInFocus, setTabInFocus] = useState(document.visibilityState === 'visible' ? true : false)
  const tabInFocusRef = useRef(true)
  const [prevMessagesLoading] = useState(false)
  const prevTabInFocus = usePrevious<boolean>(tabInFocus)
  const newMessage = useRef(null)
  const [anchorEl, setAnchorEl] = useState(null);
  const [showAcceptDeleteDialog, setShowAcceptDeleteDialog] = useState(false)
  const [chatIsOnline, setChatIsOnline] = useState(true)
  const [scrollPositionIsSet, setScrollPositionIsSet] = useState(false)
  const chatIsOnlineRef = useRef(chatIsOnline)
  const isTypingTimeoutRef = useRef<any>(null)
  const [showDeleteMessageDialog, setShowDeleteMessageDialog] = useState(false)
  const [deleteMessageForAllCheckBoxValue, setDeleteMessageForAllCheckBoxValue] = useState(false)
  const previousMessagesLength = usePrevious<number>(messages.length)
  const prevMessages = usePrevious<Array<MessageType>>(messages)
  const playSoundDebounced = useCallback(debounce(playSound, 10), [])
  const firstUnread = useRef<string | null>()
  const prevExistingChat = usePrevious(existingChat)
  const onOfflineTimestamp = useRef<number | null>(null)
  const [chatNotFound, setChatNotFound] = useState(false)
  const [lastMessagesAreLoading, setLastMessagesAreLoading] = useState(false)
  const creatingChat = getPairChatByParticipantsId(creatingChats, currentUserId, interlocutorId)
  const chatStub = getPairChatByParticipantsId(chatsStubs, currentUserId, interlocutorId)
  const chat = existingChat || creatingChat || chatStub
  const chatId = chat ? chat.id : '-1'
  const chatClientId = chat ? chat.clientId : '-1'
  const prevChatId = usePrevious<string>(chatId)
  const prevChatIsOnline = usePrevious<boolean>(chatIsOnline)
  const messagesForCreatingChatsRef = useRef(messagesForCreatingChats)
  const messagesForRestoringChatsRef = useRef(messagesForRestoringChats)
  const chatMessagesHeightPrev = useRef<undefined | number>(chatMessagesElem.current?.getBoundingClientRect().height)

  const SHOW_ONLINE_TIME = 15000
  const SHOW_TYPING_TIME = 7000

  const [interlocutorIsOnline] = useTemp(lastOnlineTimestamp || 0, SHOW_ONLINE_TIME)
  const [interlocutorIsTyping, setInterlocutorIsTyping] = useTemp(lastTypingTimestamp || 0, SHOW_TYPING_TIME)

  let dotsInterval: any = useRef(null)
  useEffect(() => {
    if(interlocutorIsTyping) {
      const dotsElem = document.getElementById('dots')
      if(dotsElem) {
        dotsInterval.current = setInterval(() => {
          const dots = dotsElem.innerHTML
          console.log(dots)
          dotsElem.innerHTML = dots.length === 3 ? '' : dots + '.'
        }, 300)
      }
    } else {
      clearInterval(dotsInterval.current)
    }
  }, [interlocutorIsTyping])

  useLayoutEffect(() => {
    const lastMessageFromPrev = prevMessages ? prevMessages[prevMessages.length - 1] : null
    const lastMessage = messages ? messages[messages.length - 1] : null
    const newMessagesAreLoaded = !!lastMessageFromPrev && !!lastMessage && lastMessage.id > lastMessageFromPrev.id
    const currentHeight = chatMessagesElem.current?.getBoundingClientRect().height
    const prevHeight = chatMessagesHeightPrev.current

    if(newMessagesAreLoaded && scrollPositionIsSet && chatWrapperElem.current && currentHeight && prevHeight !== undefined && currentHeight > prevHeight) {
      chatWrapperElem.current.scrollTop = chatWrapperElem.current.scrollTop - (currentHeight - prevHeight)
    }

    const firstMessage = messages.length ? messages[0] : null
    const prevFirstMessage = (prevMessages && prevMessages.length) ? prevMessages[0] : null

    const prevMessagesAreLoaded = !!firstMessage && !!prevFirstMessage && prevFirstMessage.id > firstMessage.id

    if(prevMessagesAreLoaded && scrollPositionIsSet && chatWrapperElem.current && currentHeight && prevHeight !== undefined && currentHeight > prevHeight) {
      // console.log(chatWrapperElem.current.scrollTop, currentHeight, prevHeight)
      // chatWrapperElem.current.scrollTop = chatWrapperElem.current.scrollTop + (currentHeight - prevHeight)
      // console.log(chatWrapperElem.current.scrollTop, currentHeight, prevHeight)
    }
    chatMessagesHeightPrev.current = currentHeight
  }, [messages.length, prevMessages, scrollPositionIsSet])

  const prevChatUnreadMessagesCount = usePrevious(chatUnreadMessagesCount)

  useEffect(() => {
    if(prevChatUnreadMessagesCount !== undefined
      && prevMessageCursor
      && chatUnreadMessagesCount > prevChatUnreadMessagesCount
    ) {
      console.log('PLAY SOUND')
      playSound()
    }
  }, [prevMessageCursor, chatUnreadMessagesCount, prevChatUnreadMessagesCount])

  useEffect(() => {
    chatMessagesHeightPrev.current = chatMessagesElem.current?.getBoundingClientRect().height
  }, [scrollPositionIsSet])

  useEffect(() => {
    messagesForCreatingChatsRef.current = messagesForCreatingChats
  }, [messagesForCreatingChats])

  useEffect(() => {
    messagesForRestoringChatsRef.current = messagesForRestoringChats
  }, [messagesForRestoringChats])

  useEffect(() => {
    if(existingChat && !prevExistingChat) {
      const firstUnreadMessage = existingChat.messages.slice().reverse().find(m => {
        return m.creator.id !== currentUserId && !m.readBy.includes(currentUserId)
      })
      firstUnread.current = firstUnreadMessage ? firstUnreadMessage.id : null
    }
  }, [existingChat, prevExistingChat])

  useEffect(() => {
    if(chatId !== prevChatId && prevChatId === '-1') {
      const chatPendingMessages = messagesForCreatingChatsRef.current.filter(pm => pm.chatId === chatClientId)
      setMessagesForCreatingChats(prev => prev.filter(pm => pm.chatId !== chatClientId))
      chatPendingMessages.forEach(pm => {
        sendMessageToExistingChat(chatId, pm, windowId)
      })
    }
    existingChatRef.current = existingChat
  }, [chatId, existingChat, chatClientId])

  useEffect(() => {
    document.title = `${t('Messenger')}${chatUnreadMessagesCount
      ? ` (${chatUnreadMessagesCount} unread message)` : ''}`
      toggleToBottomButton()
  }, [chatUnreadMessagesCount])

  useEffect(() => {
    (async function() {
      if(chatIsOnline && prevChatIsOnline === false && currentUserId && existingChat) {
        if(loadPrevIsIntersecting.current) {
          handleLoadPrevMessages.current()
        }
        const chat = existingChat
        let response = await chatsAPI.getChatActions(
          chat.id, null, '1,2,3,4',
          onOfflineTimestamp.current
            ? Number(`${onOfflineTimestamp.current}`.substring(0, 10)) : 0
        )
        setSendingMessages(prev =>  prev.filter(m => m.chatId !== chat.clientId))
        const chatActions = response.data.items
        dispatch(actions.handleUpdates(chatActions, currentUserId))
      }
    }())
    chatIsOnlineRef.current = chatIsOnline
  }, [chatIsOnline, prevChatIsOnline, currentUserId, existingChat, windowId])

  const prevInterlocutorId = usePrevious(interlocutorId)

  useEffect(() => {
    if(prevInterlocutorId && prevInterlocutorId !== interlocutorId) {
      setEditingMessage(null)
      setChatNotFound(false)
      setIsInitialized(isInitializedRef.current = false)
    }
  }, [interlocutorId, prevInterlocutorId])

  useEffect(() => {
    if(!existingChat && currentUserId) {
      (async function() {
        try {
          let chatResponse = await chatsAPI.getChatsOfUser(
            currentUserId, 'pair_user_chat', interlocutorId, 1, null, null
          )
          if(chatResponse.data.items.length > 0) {
            let chat = chatResponse.data.items[0]
            dispatch(actions.addChat(chat))
          } else if (!chatStub) {
            try {
              const userResponse = await profileAPI.getUser(interlocutorId)
              const interlocutorData = userResponse.data
              const currentUser = createUser(
                currentUserId || "user_id",
                currentUserData.firstName || "User",
                currentUserData.lastName || "User",
                currentUserData.avatar
              )
              const interlocutor = createUser(
                interlocutorData.id,
                interlocutorData.firstName,
                interlocutorData.lastName,
              )
              const chatParticipants = [currentUser, interlocutor]
              const chatStub = createNewPairChat('-1', createUlidId(), null, chatParticipants)
              setChatsStubs(prev => [...prev, chatStub])
            } catch (e) {
              const error = e as AxiosError
              if(!!error.response && error.response.status === 404) {
                setChatNotFound(true)
              }
            }
          }
          setIsInitialized(isInitializedRef.current = true)
        } catch (e) {
          // const error = e as AxiosError
          // setChatNotFound(true)
        }
      })()
    } else if(existingChat || chatStub || creatingChat) {
      // console.log('some chat found')
      setIsInitialized(isInitializedRef.current = true)
    }
  }, [interlocutorId])

  useEffect(() => {
    if(!!existingChat) {
      const onOffline = () => {
        onOfflineTimestamp.current = Date.now()
        setChatIsOnline(chatIsOnlineRef.current = false)
      }
      const onOnline = () => setChatIsOnline(chatIsOnlineRef.current = true)
      window.addEventListener('online', onOnline);
      window.addEventListener('offline', onOffline);
      return () => {
        window.removeEventListener('online', onOnline);
        window.removeEventListener('offline', onOffline);
      }
    }
  }, [existingChat])

  useEffect(() => { // При загрузке чата добавляем обработчик на изменение видимости документа, если вкладка браузера не активна, то делаем tabInFocus false, если активна, то true. При изменении tabInFocus отрабатывает другой useEffect. 
    function docVisibilitychange() { setTabInFocus(tabInFocusRef.current = !document.hidden) }
    document.addEventListener('visibilitychange', docVisibilitychange)
    return () => document.removeEventListener('visibilitychange', docVisibilitychange)
  }, [])

  useEffect(() => { // Этот useEffect выполняется каждый раз, но именно весь код выполняется только раз, когда scrollPositionIsSet === false, чат отрисован, когда <NewMessage/> отрисовано и когда загружен чат, это случается только один раз после монтирования
    if(isInitialized && !scrollPositionIsSet) {
      const messages = existingChat?.messages || []
      const firstUnread = [...messages].reverse().find(m => m.creator.id !== currentUserId && !m.readBy.includes(currentUserId))
      // // let positions = localStorage['scroll-positions'] ? JSON.parse(localStorage['scroll-positions']) : []
      // //@ts-ignore
      // // let chatPosition = positions.find((p: any) => p.chatId === existingChat.id)
      if(firstUnread) {
        const element = document.getElementById(firstUnread.id)
        if(element && chatWrapperElem.current && chat && chatMessagesElem.current) {
          // console.log(element.offsetTop)
          console.log(chatWrapperElem.current.getBoundingClientRect().height - element.offsetHeight)
          console.log(chatWrapperElem.current.getBoundingClientRect(), chatMessagesElem.current.getBoundingClientRect())
          // console.log(chatWrapperElem.current.getBoundingClientRect())
          chatWrapperElem.current.scrollTop = -(chatMessagesElem.current.getBoundingClientRect().height - element.offsetHeight)
          console.log(chatWrapperElem.current.scrollTop)
        }
      }
      else if(chatWrapperElem.current) {
        chatWrapperElem.current.scrollTop = chatWrapperElem.current.scrollHeight
      }
      setScrollPositionIsSet(true)
    }
  }, [isInitialized])

  const handleLoadPrevMessages = useRef(() => {})
  useEffect(() => {
    handleLoadPrevMessages.current = () => {
      if(existingChat && nextMessageCursor && !lastMessagesAreLoading) {
        dispatch(loadPrevMessages(existingChat.id, 30, nextMessageCursor))
      }
    }
  }, [existingChat, nextMessageCursor, lastMessagesAreLoading] )

  const handleLoadNextMessages = useRef(() => {})
  useEffect(() => {
    handleLoadNextMessages.current = () => {
      if(existingChat && prevMessageCursor && !lastMessagesAreLoading) {
        dispatch(loadNextMessages(existingChat.id, 30, prevMessageCursor))
      }
    }
  }, [existingChat, prevMessageCursor, lastMessagesAreLoading] )

  useEffect(() => {
    if(scrollPositionIsSet) {
      var options = {root: null, rootMargin: '0px', threshold: 0.1}
      var callback = function(entries: any, observer: any) {
        entries.forEach((entry: any) => {
          loadPrevIsIntersecting.current = entry.isIntersecting
          if(entry.target.id === 'load-prev' && entry.isIntersecting && handleLoadPrevMessages.current) {
            handleLoadPrevMessages.current()
          } else if(entry.target.id === 'load-next' && entry.isIntersecting && handleLoadNextMessages.current) {
            handleLoadNextMessages.current()
          }
        })
      };
      var observer = new IntersectionObserver(callback, options)
      let loadPrevDiv = loadPrev.current
      let loadNextDiv = loadNext.current
      if(loadPrevDiv) observer.observe(loadPrevDiv);
      if(loadNextDiv) observer.observe(loadNextDiv);
      return () => observer.disconnect()
    }
  }, [scrollPositionIsSet]);

  const readMessages = useCallback(debounce((chatId: string) => {
    const messagesCollection = document.querySelectorAll('.message')
    const messages = elementsCollectionToSimpleArray(messagesCollection)

    const lastVisibleUnreadId = getLastUnreadAndVisibleMessageIdOfInterlocutor()
    if(lastVisibleUnreadId) {
      setReadOffline(prev => {
        const prevLastRead = prev.find(ro => ro.chatId === existingChatRef.current?.id)
        if(!prevLastRead || (prevLastRead && prevLastRead.messageId < lastVisibleUnreadId)) {
          chatsAPI.updateChat(chatId, 'last_read_message', lastVisibleUnreadId)
          const readOfflineNew = prev.filter(pro => pro.chatId !== existingChatRef.current?.id)
          readOfflineNew.push({chatId: existingChatRef.current?.id, messageId: lastVisibleUnreadId})
          return readOfflineNew
        }
        return prev
      })
    }
  }, 30), [])

  useEffect(() => {
    if(scrollPositionIsSet) {
      let prevLength: any = 0
      if(previousMessagesLength !== undefined) prevLength = previousMessagesLength
      if(chatWrapperElem.current && messages.length > prevLength) {
        let lastMessage = messages[0]
        let prevLastMessage = prevMessages[0]
        let prevLastMessageId: string | null = prevLastMessage ? prevLastMessage.id : '-1'
        let chatIsSame = chat && chat.id !== '-1' && chat.id === prevChatId
        if(chatIsSame && lastMessage && lastMessage.creator.id !== currentUserId && lastMessage.id > prevLastMessageId) {
          playSoundDebounced()
        }
      }
      if(messages.length && existingChat && tabInFocusRef.current) {
        readMessages(existingChat.id)
      }
    }
  }, [messages.length, previousMessagesLength, scrollPositionIsSet])

  useEffect(() => {
    if(prevTabInFocus !== undefined && tabInFocus && existingChat && isInitializedRef.current) {
      readMessages(existingChat.id)
    }
  }, [tabInFocus, prevTabInFocus, readMessages, existingChat])

  // useEffect(() => { // Когда создаётся сообщение, происходит прокрутка вниз, но после того как сообщение полностью появится, а появляется оно через 200 мс из-за Collapse анимации, поэтому прокрутка откладывается минимум на 220мс
  //   const chatSendingMessages = sendingMessages.filter(sm => sm.chatId === chat?.id)
  //   const chatPrevSendingMessages = prevSendingMessages !== undefined
  //     ? prevSendingMessages.filter(sm => sm.chatId === chat?.id) : []
    
  //   if(chatWrapperElem.current && chatPrevSendingMessages
  //     && chatSendingMessages.length > chatPrevSendingMessages.length
  //   ) {
  //     scrollChatSmoothly(chatWrapperElem.current.scrollHeight)
  //   }
  // }, [sendingMessages, prevSendingMessages, chat])

  useEffect(() => {
    if(rerender > 0) {
      setTimeout(() => {
        chatWrapperElem.current && scrollChatSmoothly(chatWrapperElem.current.scrollHeight)
      }, 220)
    }
  }, [rerender])

  function getLastUnreadAndVisibleMessageIdOfInterlocutor(): string | null {
    const messagesCollection = document.querySelectorAll('.message')
    const messages = elementsCollectionToSimpleArray(messagesCollection)
    const reversed = messages.reverse()

    for(let i = 0; i < reversed.length; i++) {
      let mes = reversed[i]
      let isRead = !!Number(mes.dataset.isread)
      let isOwn = !!Number(mes.dataset.isown)
      if(isRead) return null

      if(!isOwn && !isRead && chatWrapperElem.current) {
        let chatRect = chatWrapperElem.current.getBoundingClientRect()
        let bottomOfChat = chatRect.top + chatRect.height
        let messageRect = mes.getBoundingClientRect()
        let ololo = messageRect.height / 2
        let messageTop = messageRect.top + ololo
        let id = mes.id

        if(messageTop < bottomOfChat) return id
      }
    }
    return null
  }

  function scrollChatSmoothly (top: number) {
    chatWrapperElem.current && chatWrapperElem.current.scrollTo({top, left: 0, behavior: 'smooth'})
  }

  function setScrollPosition(chatId: string) {
    if(chatWrapperElem.current) {
      let oldPositions = localStorage['scroll-positions']
        ? JSON.parse(localStorage['scroll-positions']) : []
      let prevChatPosition = oldPositions.find((p: any) => p.chatId === chatId)
      if(prevChatPosition) {
        prevChatPosition.position = chatWrapperElem.current.scrollTop
        localStorage.setItem('scroll-positions', JSON.stringify(oldPositions))
      } else {
        let newPositions = [...oldPositions, {'chatId': chatId, position: chatWrapperElem.current.scrollTop}]
        localStorage.setItem('scroll-positions', JSON.stringify(newPositions))
      }
    }
  }

  const setScrollPositionDebounced = useCallback(debounce(setScrollPosition, 200), [])

  const toggleToBottomButton = useCallback(debounce(() => {
    if(!toBottomButton.current || !chatWrapperElem.current) return
    const currentDisplayValue = toBottomButton.current.style.display

    const messagesWrapperBottom = chatMessagesElem.current
      ? chatMessagesElem.current.getBoundingClientRect().bottom
      : 0
    const chatWrapperBottom = chatWrapperElem.current.getBoundingClientRect().bottom
    const difference = messagesWrapperBottom - chatWrapperBottom
    const noScroll = chatWrapperElem.current.getBoundingClientRect().height === chatWrapperElem.current.scrollHeight

    if(noScroll) {
      toBottomButton.current.style.display = 'none'
    }
    else if(difference < 80) {
      if(!chatUnreadMessagesCount && currentDisplayValue !== 'none') {
        toBottomButton.current.style.display = 'none'
      } else if(chatUnreadMessagesCount && currentDisplayValue !== 'block') {
        // console.log('1')
        toBottomButton.current.style.display = 'block'
      }
    }
    else if(difference >= 80 && currentDisplayValue !== 'block') {
      // console.log('2')
      toBottomButton.current.style.display = 'block'
    }
  }, 30), [chatUnreadMessagesCount])

  function handleScroll() {
    if(existingChat) {
      setScrollPositionDebounced(existingChat.id)
      readMessages(existingChat.id)
    }
    toggleToBottomButton()
  }
  
  function handleCloseDeleteMessageDialog() {
    setShowDeleteMessageDialog(false)
    setDeleteMessageForAllCheckBoxValue(false)
  }

  const handleResend = useCallback(async (messageId: string) => {
    const unsentMessage = getUnsentMessageFromStorage(messageId)
    if(!unsentMessage) {
      return
    }
    if(unsentMessage.replied) {
      const replied = messages.find(m => m.id === (unsentMessage?.replied?.id || '-1'))
      if(replied) {
        unsentMessage.replied = replied
      } else {
        unsentMessage.replied = null
      }
    }
    removeUnsentMessageFromStorage(messageId)
    if(unsentMessage && !existingChat && chatStub) {
      createChatAndSendMessage({...unsentMessage, sendingError: false}, interlocutorId, chatClientId, windowId)
    } else if(unsentMessage && existingChat) {
      sendMessageToExistingChat(existingChat.id, {...unsentMessage, sendingError: false}, windowId)
    }
  }, [existingChat, chatStub, interlocutorId, chatClientId, windowId, messages])

  const handleUnsentDelete = useCallback(async (messageId: string) => {
    removeUnsentMessageFromStorage(messageId)
    setUpdateUnsent(prev => !prev)
  }, [])

  if(currentUserId === '-1') {
    return <Redirect to="/login"/>
  }
  if(chatNotFound) {
    return <div style={{fontSize: 30}}>Chat not found</div>
  }

  async function sendMessageToExistingChat(chatId: string, message: MessageType, chatWindowId: string) {
    setSendingMessages(prev => [...prev, message])
    try {
      let response = await chatsAPI.createMessage(chatId, message.text, message.clientId, message.replied?.id, chatWindowId)
      const messageId = response.data.id
      message = {...message, id: messageId} // Сообщению добавляется ID реальный ID с сервера
      dispatch(actions.addMessage(chatId, message, true))
    }
    catch(e) {
      if(existingChatRef.current) {
        const existingMessage = existingChatRef.current.messages.find(m => m.clientId === message.clientId)
        if(!existingMessage) { // Если сообщение уже в store, то не нужно добавлять сообщение в unsent messages
          let copy = createNewMessage('-1', message.clientId, chatId, message.text, message.replied, message.creator, true)
          addUnsentMessageToStorage(copy)
        }
      }
      setSendingMessages(prev => prev.filter(m => m.clientId !== message.clientId))
    }
  }

  async function createChatAndSendMessage(message: MessageType, interlocutorId: string, chatClientId: string, chatWindowId: string) {
    setSendingMessages(prev => [...prev, message])
    try {
      await chatsAPI.createPairChat(interlocutorId, message.text, chatClientId, message.clientId, chatWindowId)
    } catch(e) {
      addUnsentMessageToStorage({...message, sendingError: true})
      setSendingMessages(prev => prev.filter(m => m.clientId !== message.clientId))
    }
  }

  const sendMessage = (text: string, replied: MessageType | null) => {
    let clientId = createUlidId()
    const creator = createUser(
      currentUserId || '', currentUserData.firstName || '',
      currentUserData.lastName || '', currentUserData.avatar || null
    )
    if(existingChat) {
      let message = createNewMessage('-1', clientId, existingChat.id, text, replied, creator, false)
        sendMessageToExistingChat(existingChat.id, message, windowId)
    } else if(chatStub) {
      let message = createNewMessage('-1', clientId, chatStub.clientId, text, replied, creator, false)
      createChatAndSendMessage(message, interlocutorId, chatClientId, windowId)
    }
  }

  const onSendMessage = async (text: string, replied: MessageType | null) => {
    if(prevMessageCursor && chat) {
      // console.log('yes')
      try {
        setLastMessagesAreLoading(true)
        if(chatWrapperElem.current) {
          chatWrapperElem.current.scrollTop = chatWrapperElem.current.scrollHeight
        }
        const chatId = chat.id
        const response = await chatsAPI.getMessages(chatId, 30, null, 'DESC')
        const messages = response.data.items
        dispatch(actions.setMessages(chatId, messages, null, response.data.nextCursor))
        const lastMessage = messages[0]
        if(lastMessage) {
          setReadOffline(prev => {
            const prevLastRead = prev.find(ro => ro.chatId === existingChatRef.current?.id)
            if(!prevLastRead || (prevLastRead && prevLastRead.messageId < lastMessage.id)) {
              chatsAPI.updateChat(chatId, 'last_read_message', lastMessage.id)
              const readOfflineNew = prev.filter(pro => pro.chatId !== existingChatRef.current?.id)
              readOfflineNew.push({chatId: existingChatRef.current?.id, messageId: lastMessage.id})
              return readOfflineNew
            }
            return prev
          })
        }
        if(toBottomButton.current) {
          toBottomButton.current.style.display = 'none'
        }
        sendMessage(text, replied)
      } catch(e) {

      } finally {
        setLastMessagesAreLoading(false)
      }
    } else {
      console.log('else')
      sendMessage(text, replied)
    }
    setTimeout(() => {
      if(chatWrapperElem.current) {
        scrollChatSmoothly(chatWrapperElem.current.scrollHeight)
      }
    }, 50)
  }

  const chatMessages = chat?.messages || []
  const filteredSendingMessages = deleteDuplicates(sendingMessages, chatMessages)
  const filteredMessagesForRestoring = deleteDuplicates(messagesForRestoringChats, [...chatMessages, ...filteredSendingMessages])
  const filteredMessagesForCreatingChats = deleteDuplicates(messagesForCreatingChats, [...chatMessages, ...filteredSendingMessages])
  let unsentMessages = chat ? getChatUnsentMessages(chat.id, chat.clientId, chat.prevMessageCursor) : []
  unsentMessages.forEach(um => {
    if(um.replied) {
      let replied = chatMessages.find(m => m.id === um?.replied?.id)
      if(replied) {
        um.replied = replied
      } else {
        um.replied = null
      }
    }
  })

  let allMessages = [...unsentMessages, ...filteredSendingMessages, ...chatMessages, ...filteredMessagesForRestoring, ...filteredMessagesForCreatingChats]
  allMessages = sortMessages(allMessages)
  let allMessagesReversed = [...allMessages].reverse()

  let days: Array<DayType> = []
  allMessagesReversed.forEach((message) => {
    const timestamp = message.createdAt
    let messageCreationDate = new Date(timestamp)
    const day = messageCreationDate.getDate()
    const month = messageCreationDate.getMonth()
    const year = messageCreationDate.getFullYear()
    let dayDate = `${day} ${month} ${year}`

    let newDate = new Date(year, month, day)
    const newTimestamp = newDate.getTime()
    let dialogueDay = days.find((day: any) => day.date === dayDate)
    if(!dialogueDay) {
      dialogueDay = {
        dayId: `${day}${month}${year}`,
        date: dayDate, messages: [], groups: [], timestamp: newTimestamp
      }
      days.push(dialogueDay)
    }
    dialogueDay.messages.push(message)
  })

  let header = null
  if(isPairChat) {
    let interlocutor = chat && chat.participants.find(p => p.id !== currentUserId)
    let interlocutorName = interlocutor?.firstName && interlocutor?.lastName
      ? `${interlocutor.firstName} ${interlocutor.lastName}` : ''

    let interlocutorAvatar = interlocutor?.picture
    const handleClose = () => setShowAcceptDeleteDialog(false)
    const onDeleteDialog = async () => {
      if(chat) {
        await dispatch(deleteHistory(chat.id))
        removeUnsentMessagesFromStorage(chat.id)
        history.push(`/chats`)
      }
    }
    const deleteDialog = (
      <Dialog
        onClose={handleClose}
        aria-labelledby="simple-dialog-title"
        open={showAcceptDeleteDialog}
      >
        <DialogTitle children={t('Delete chat history?')} />
        <DialogActions>
          <Button onClick={handleClose} children={t('Cancel')}/>
          <Button onClick={onDeleteDialog} children={t('Yes')}/>
        </DialogActions>
      </Dialog>
    )
    const handleOpenMenu = (event: any) => setAnchorEl(event.currentTarget)
    const handleCloseMenu = () => setAnchorEl(null);
    const menu = (
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MenuItem
          onClick={() => setShowAcceptDeleteDialog(true)}
          children={<Typography variant='body2' >{t('Delete chat')}</Typography>}
        />
      </Menu>
    )

    let underName = null
    if(interlocutorIsTyping && chatIsOnline) {
      underName = <>
        <Typography variant='body2' color='textSecondary' >
          {t('is typing')}
        </Typography>
        <div id='dots' style={{width: 10}}/>
      </>
    }
    else if(interlocutorIsOnline && chatIsOnline) {
      underName = <Typography variant='body2' color='textSecondary'>
        {t('interlocutor is online')}
      </Typography>
    }
    else if(!chatIsOnline) {
      underName = <span>
        <Typography variant="body2" color='textSecondary' >
          {t('No internet connection')}
        </Typography>
        <CircularProgress size='16' disableShrink={true} />
      </span>
    }
    else {
      underName = <Typography variant='body2' color='textSecondary' >
        {t('last seen recently')}
      </Typography>
    }

    header = (
      <header className={classes.header} >
        <IconButton
          className={classes.toChatsPreviewsButton}
          component={NavLink} to={`/chats`}
          size='small'
          children={<KeyboardArrowLeftIcon fontSize='large' />}
        />
        {/* <div
          className={cn(
            interlocutorIsOnline ? classes.avatarBorderOnline : classes.avatarBorderOffline,
            classes.avatarBorder
          )}
        > */}
        <div className={classes.avatarBorder}>
        <FlickeringDotBadge
          invisible={!interlocutorIsOnline}
          overlap="circular"
          variant="dot"
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
        >
          { !!interlocutor ?
            <NavLinkAvatar
              width={40}
              picture={interlocutorAvatar || null}
              name={interlocutorName}
              to={`/i/${interlocutorId}`}
            />
            :
            <Skeleton variant="circle" width={40} height={40}/>
          }
        </FlickeringDotBadge>
        </div>
        {chat &&
        <div className={classes.interlocutorNameAndConnectionStatus} >
          <div style={{height: 20}}>
            <TypographyLink
              variant='body1'
              to={`/i/${interlocutorId}`}
              children={interlocutorName}
            />
          </div>

          <div style={{display: 'flex', height: 20}}>
            {underName}
          </div>
        </div>
        }
        <div style={{flexGrow: 1}}></div>

        <div className={classes.chatMenuAndInterlocutorAvatar}>
          <div style={{marginRight: 8}}>
            {menu}
            {chat &&
              <IconButton
                size='small'
                onClick={handleOpenMenu}
                children={<MoreVertIcon />}
              />
            }
          </div>
          {deleteDialog}
        </div>
        { prevMessagesLoading &&
          <div className={classes.moreMessagesProgress}>
            <CircularProgress disableShrink={true} />
          </div> }
      </header>
    )
  }

  const [editingMessage, setEditingMessage] = useState<MessageType | null>(null)

  const onDelete = () => {
    console.log('on delete')
    setEditingMessage(null)
  }

  const onEditClick = (message: MessageType) => {
    setEditingMessage(message)
  }

  const onReplyClick = (message: MessageType) => {
    setRepliedMessage(message)
  }

  console.log((!chat || lastMessagesAreLoading || !scrollPositionIsSet))

  const body = (
    <div
      className={classes.dialogueBody}
      id='chat-body'
      ref={chatWrapperElem}
      onScroll={handleScroll}
    >
      {/* <div style={{flexGrow: allMessagesReversed.length > 0 ? 1 : 0, flexShrink: 1,}} /> Для заполнения пустоты, чтобы чат начинался сверху, а не снизу */}

      <div style={{position: 'relative'}}>
        <div
          id='load-next' ref={loadNext}
          className={classes.loadNext}
        />
      </div>
      <div ref={chatMessagesElem} className={classes.root} >
        <List style={{paddingBottom: 0, }} subheader={<li/>}>
          {days.map(day => {
            // let prevMessage: MessageType | null = null
            // let messageNumberInDay = 0 // порядковый номер сообщения из конкретного дня, первое сообщение дня имеет номер 0
            let timestamp = day.timestamp
            const messageDate = new Date(timestamp) 
            let dateFormat = new Date().getFullYear() === messageDate.getFullYear() ? "DD MMMM" : "DD MMMM YYYY"

            const subheader = (
              <ListSubheader className={classes.dayContainer}  >
                <div className={classes.day} >
                  <div style={{position: 'relative', padding: '4px 16px'}} >
                    <Typography variant='body2' >
                      { isToday(messageDate)
                        ? t('Today')
                        : moment(timestamp).format(dateFormat)}
                    </Typography>
                    <div style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}></div>
                  </div>
                </div>
              </ListSubheader>
            )

            const firstDayMessage = day.messages[0]
            const firstDayMessageId = firstDayMessage.createdInCurrentWindow ? firstDayMessage.clientId : firstDayMessage.id
            const lastDayMessage = day.messages[day.messages.length - 1]
            const lastDayMessageId = lastDayMessage.createdInCurrentWindow ? lastDayMessage.clientId : lastDayMessage.id

            const dayMessages = day.messages.map((message, index) => {
              // let type = getMessageContainerFormType(message, prevMessage, day.messages[messageNumberInDay + 1])
              let isFirst = false
              let isLast = false
              let prevMessage = index > 0 ? day.messages[index - 1] : null
              let nextMessage = day.messages[index + 1]
              if(!nextMessage || (nextMessage && nextMessage.creator.id !== message.creator.id)) {
                isLast = true
              }
              if(!prevMessage || (prevMessage && prevMessage.creator.id !== message.creator.id)) {
                isFirst = true
              } 
              // console.log(isFirst, isLast)
              prevMessage = message
              // messageNumberInDay++
              const key = message.createdInCurrentWindow ? message.clientId : message.id

              return (
                <div key={key}>
                  <Message
                    isFirst={isFirst}
                    isLast={isLast}
                    chatId={chat?.id || ''}
                    message={message}
                    currentUserId={currentUserId}
                    onResend={handleResend}
                    onDelete={onDelete}
                    onUnsentDelete={handleUnsentDelete}
                    lastReadOfflineId={lastReadOfflineId}
                    onEditClick={onEditClick}
                    onReplyClick={onReplyClick}
                  />
                </div>
              )
            })

            return (
              <li className={classes.listSection} key={day.dayId}>
                <ul className={classes.ul} >
                  {subheader}
                  {dayMessages}
                </ul>
              </li>
            )
          })}
        </List>
      </div>
      <div style={{position: 'relative', }}>
        <div
          // style={{border: '1px solid yellow'}}
          id='load-prev' ref={loadPrev}
          className={classes.loadPrev}
        />
      </div>
      { (!chat || lastMessagesAreLoading || !scrollPositionIsSet) &&
      <div className={classes.loading}>
          <NewCircularProgress size={80}/>
      </div>}
      
    </div>
  )

  const onToBottomButtonClick = async () => {
    if(prevMessageCursor && chat) {
      try {
        setLastMessagesAreLoading(true)
        chatWrapperElem.current && (chatWrapperElem.current.scrollTop = chatWrapperElem.current.scrollHeight)
        const chatId = chat.id
        const response = await chatsAPI.getMessages(chatId, 30, null, 'DESC')
        const messages = response.data.items
        dispatch(actions.setMessages(chatId, messages, null, response.data.nextCursor))
        const lastMessage = messages[0]
        if(lastMessage) {
          setReadOffline(prev => {
            const prevLastRead = prev.find(ro => ro.chatId === existingChatRef.current?.id)
            if(!prevLastRead || (prevLastRead && prevLastRead.messageId < lastMessage.id)) {
              chatsAPI.updateChat(chatId, 'last_read_message', lastMessage.id)
              const readOfflineNew = prev.filter(pro => pro.chatId !== existingChatRef.current?.id)
              readOfflineNew.push({chatId: existingChatRef.current?.id, messageId: lastMessage.id})
              return readOfflineNew
            }
            return prev
          })
        }
        if(toBottomButton.current) {
          toBottomButton.current.style.display = 'none'
        }
        setLastMessagesAreLoading(false)
      } catch(e) {
        setLastMessagesAreLoading(false)
      }
    } else {
      scrollChatSmoothly(chatWrapperElem.current ? chatWrapperElem.current.scrollHeight : 9999999999)
    }
  }

  const [repliedMessage, setRepliedMessage] = useState<MessageType | null>(null)

  const onCloseReplying = () => {
    setRepliedMessage(null)
  }

  const onCloseEditMode = () => {
    setEditingMessage(null)
  }

  const onEditSave = async (messageId: string, newText: string) => {
    const chatId = chat?.id
    if(!chatId) {
      return
    }
    const currentText = editingMessage?.text || ''
    setEditingMessage(null)
    dispatch(actions.updateMessage(chatId, messageId, newText))
    try {
      await chatsAPI.updateMessage(messageId, 'text', newText, windowId)
    } catch (e) {
      dispatch(actions.updateMessage(chatId, messageId, currentText))
      enqueueSnackbar('Message was not edited', {variant: 'error'})
    }
  }

  return (
    <>
    <Paper className={classes.container} >
      {header}
      <Divider />
      {body}
      <div style={{position: 'relative'}} >
        <ColorButton
          ref={toBottomButton}
          className={classes.toBottom}
          disableRipple
          onClick={onToBottomButtonClick}
        >
          {chatUnreadMessagesCount
            ? <Badge
                badgeContent={chatUnreadMessagesCount}
                color="secondary"
                anchorOrigin={{ vertical: 'top', horizontal: 'right'}}
                children={<ArrowDownwardIcon  />}
              />
            : <ArrowDownwardIcon  />
          }
        </ColorButton>
        <Divider />
        <div style={{minHeight: 54}}>
          <NewMessage
            isDisabled={lastMessagesAreLoading}
            onSubmit={onSendMessage}
            isAcceptsMessages={true}
            chatId={chat ? chat.id : '-1'}
            isInitialized={isInitialized}
            editingMessage={editingMessage}
            closeEditMode={onCloseEditMode}
            onEditSave={onEditSave}
            repliedMesage={repliedMessage}
            onCloseReplying={onCloseReplying}
          />
        </div>
      </div>
      <Dialog
        onClose={handleCloseDeleteMessageDialog}
        open={showDeleteMessageDialog}
      >
        <DialogTitleWithCloseButton
          onClose={handleCloseDeleteMessageDialog}
          children={t('Delete message')}
        />
        <DialogContent>
        <FormControlLabel
          control={
            <Checkbox
              checked={deleteMessageForAllCheckBoxValue}
              onChange={() => setDeleteMessageForAllCheckBoxValue(prev => !prev)}
            />}
          label={t('Delete for all?')}
        />
        </DialogContent>
        <DialogActions>
          <Button>{t('Yes')}</Button>
          <Button>{t('No')}</Button>
        </DialogActions>
      </Dialog>
    </Paper>
    </>
  );
})

const ColorButton = withStyles((theme) => {
  const isLight = theme.palette.type === 'light'
  return {
    root: {
      backgroundColor: isLight ? theme.palette.grey[300] : theme.palette.grey[700],
      '&:hover': {
        backgroundColor: isLight ? theme.palette.grey[200] : theme.palette.grey[600],
      },
    },
  }
})(IconButton);

function isToday(date: Date): boolean {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentDay = currentDate.getDate()
  const currentMonth = currentDate.getMonth()

  const day = date.getDate()
  const month = date.getMonth()
  const year = date.getFullYear()

  return day === currentDay && month === currentMonth && year === currentYear
}

export const onRepliedOrEditedClick = (id: string, color: string) => {
  const messageElement = document.getElementById(id)
  if(messageElement) {
    const parent = messageElement.parentElement
    if(!parent) {
      return
    }
    parent.style.background = color
    parent.scrollIntoView({
      behavior: 'smooth'
    })
    setTimeout(() => {
      parent.style.background = 'inherit'
    }, 1000)
  }
}

export default Chat