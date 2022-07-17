import React, {
  useState, useEffect, useRef, useCallback, useLayoutEffect
} from 'react';
import {
  actions, deleteHistory, loadPrevMessages, loadNextMessages
} from '../../../redux/chats_reducer'
import Message from './Message/Message'
import NewMessage from './NewMessage/NewMessage'
import { Redirect, useHistory, useLocation, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next';
import { useStyles } from './ChatStyles';
import {
  DialogTitle, DialogContent, Button, DialogActions, FormControlLabel,
  Checkbox, Divider, Badge, CircularProgress, MenuItem, Menu
} from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog'
import { NavLink } from 'react-router-dom'
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import moment from 'moment'
import DialogTitleWithCloseButton from '../../Common/DialogTitleWithCloseButton.jsx';
import { ChatType, DayType, MessageType } from '../../../types/chats_types';
import { useSelector, useDispatch } from 'react-redux';
import { AppStateType } from '../../../redux/redux_store';
import { profileAPI } from '../../../api/profile_api';
import { AxiosError } from 'axios';
import { getPairChat } from '../../../redux/chats_selectors';
import { chatsAPI } from '../../../api/chats_api';
import { getCurrentUserData } from '../../../redux/auth_selectors';
import {
  debounce, elementsCollectionToSimpleArray
} from '../../../helper/helperFunctions';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import { withStyles } from '@material-ui/styles';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import TypographyLink from '../../Common/TypographyLink';
import { usePrevious, useTemp } from '../../../hooks/hooks_ts';
import {
  addUnsentMessageToStorage, createNewPairChat, createNewMessage, createUlidId,
  createUser, deleteDuplicates, getChatUnsentMessages, getUnsentMessageFromStorage,
  playSound, removeUnsentMessageFromStorage, sortMessages,
  removeUnsentMessagesFromStorage, getPairChatByParticipantsId
} from '../../../helper/helperChatFunctions';
import NavLinkAvatar from '../../Common/NavLinkAvatar';
import { Skeleton } from '@material-ui/lab';
import FlickeringDotBadge from '../../Common/FlickeringDotBadge';
import { useSnackbar } from 'notistack';
import NewCircularProgress from '@mui/material/CircularProgress';
import { useIntersection } from '../../../hooks/hooks';
import CloseIcon from '@material-ui/icons/Close';

type ChatPropsType = {
  chatsStubs: Array<ChatType>
  setChatsStubs: React.Dispatch<React.SetStateAction<Array<ChatType>>>
  sendingMessages: Array<MessageType>
  setSendingMessages: React.Dispatch<React.SetStateAction<Array<MessageType>>>
  creatingChats: Array<ChatType>
  setCreatingChats: React.Dispatch<React.SetStateAction<Array<ChatType>>>
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

// Чтобы не пересоздавалась при каждом ререндере
const playSoundDebounced = debounce(playSound, 10)

const Chat: React.FC<ChatPropsType> = React.memo((props: ChatPropsType) => {
  const {
    chatsStubs, setChatsStubs, sendingMessages, setSendingMessages, creatingChats,
    messagesForRestoringChats, messagesForCreatingChats, setMessagesForCreatingChats,
    readOffine, setReadOffline, lastTypingTimestamp, lastOnlineTimestamp
  } = props

  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const { t } = useTranslation();
  const classes = useStyles();
  const params: any = useParams();
  const location = useLocation()
  const history = useHistory()
  const dispatch = useDispatch()

  const isPairChat = location.pathname.split('/')[2] === 'c'

  const chatWrapperElem = useRef<HTMLDivElement>(null)
  const chatMessagesElem = useRef<HTMLDivElement>(null);
  const currentUserData = useSelector(getCurrentUserData)

  const [isInitialized, setIsInitialized] = useState<boolean>(false)
  const [rerender] = useState<number>(0)
  const [repliedMessage, setRepliedMessage] = useState<MessageType | null>(null)

  const isInitializedRef = useRef(false)
  const windowId = useSelector((state: AppStateType) => state.app.windowId)
  let currentUserId = useSelector((state: AppStateType) => state.auth.id) || "-1"
  const toBottomButton = useRef<HTMLButtonElement>(null)

  let interlocutorId: string = params.id
  const foundChat = currentUserId
    ? useSelector(getPairChat(currentUserId, interlocutorId)) : null
  let existingChat: ChatType | null = foundChat ? foundChat : null
  const existingChatRef = useRef(existingChat)

  let messages = existingChat ? existingChat.messages : []
  let chatUnreadMessagesCount = existingChat ? existingChat.unreadMessagesCount : 0
  // readOffline - это значит, что прочитан, пока не было соединения, это нужно
  // для того, чтобы мгновенно запечатлить, что пользователь видел сообщение
  const lastReadOffline = readOffine.find(ro => ro.chatId && ro.chatId === existingChat?.id)
  const lastReadOfflineId = lastReadOffline ? lastReadOffline.messageId : null
  const prevMessageCursor = existingChat ? existingChat.prevMessageCursor : null
  const nextMessageCursor = existingChat ? existingChat.nextMessageCursor : null


  if (lastReadOfflineId && existingChat) {
    // Если есть недогруженные сообщения внизу
    if (prevMessageCursor && existingChat?.lastReadMessageId
      && lastReadOfflineId > existingChat.lastReadMessageId
    ) {
      const lastReadMessageId = existingChat.lastReadMessageId
      const messagesReadOfflineLength = existingChat.messages.filter(
        m => m.id <= lastReadOfflineId && m.id > lastReadMessageId
      ).length
      chatUnreadMessagesCount = chatUnreadMessagesCount - messagesReadOfflineLength
    }
    /* Если все сообщения непрочитанные и еще есть незагруженные непрочитанные.
      Есть маленький период, пока lastReadOfflineId === null, в этот период
      будет показываться количество непрочитанных из store
      */
    else if (!prevMessageCursor && nextMessageCursor
      && existingChat.messages.length < existingChat.unreadMessagesCount
    ) {
      chatUnreadMessagesCount = existingChat.messages.filter(
        m => m.id > lastReadOfflineId
      ).length
    }
    // Если все последние непрочитанные сообщения загружены
    else if (!prevMessageCursor && existingChat
      && lastReadOfflineId > (existingChat.lastReadMessageId || '0')
    ) {
      chatUnreadMessagesCount = existingChat.messages.filter(
        m => m.id > lastReadOfflineId
      ).length
    }
  }

  const loadPrevIsIntersecting = useRef(false)
  let loadPrev = useRef(null)
  let loadNext = useRef(null)
  const setUpdateUnsent = useState(false)[1]
  const [tabInFocus, setTabInFocus] = useState(
    document.visibilityState === 'visible' ? true : false
  )
  const tabInFocusRef = useRef(true)
  const [prevMessagesLoading] = useState(false)
  const prevTabInFocus = usePrevious<boolean>(tabInFocus)
  const [anchorEl, setAnchorEl] = useState(null);
  const [showAcceptDeleteDialog, setShowAcceptDeleteDialog] = useState(false)
  const [chatIsOnline, setChatIsOnline] = useState(true)
  const [scrollPositionIsSet, setScrollPositionIsSet] = useState(false)
  const chatIsOnlineRef = useRef(chatIsOnline)
  const [showDeleteMessageDialog, setShowDeleteMessageDialog] = useState(false)
  const [
    deleteMessageForAllCheckBoxValue,
    setDeleteMessageForAllCheckBoxValue
  ] = useState(false)
  const previousMessagesLength = usePrevious<number>(messages.length)
  const prevMessages = usePrevious<Array<MessageType>>(messages)
  const firstUnread = useRef<string | null>()
  const prevExistingChat = usePrevious(existingChat)
  const onOfflineTimestamp = useRef<number | null>(null)
  const [chatNotFound, setChatNotFound] = useState(false)
  const [lastMessagesAreLoading, setLastMessagesAreLoading] = useState(false)
  const creatingChat = getPairChatByParticipantsId(
    creatingChats, currentUserId, interlocutorId
  )
  const chatStub = getPairChatByParticipantsId(
    chatsStubs, currentUserId, interlocutorId
  )
  const chat = existingChat || creatingChat || chatStub
  const chatId = chat ? chat.id : '-1'
  const chatClientId = chat ? chat.clientId : '-1'
  const prevChatId = usePrevious<string>(chatId)
  const prevChatIsOnline = usePrevious<boolean>(chatIsOnline)
  const messagesForCreatingChatsRef = useRef(messagesForCreatingChats)
  const messagesForRestoringChatsRef = useRef(messagesForRestoringChats)
  const chatMessagesHeightPrev = useRef<undefined | number>(
    chatMessagesElem.current?.getBoundingClientRect().height
  )
  const [editingMessage, setEditingMessage] = useState<MessageType | null>(null)

  const SHOW_ONLINE_TIME = 15000
  const SHOW_TYPING_TIME = 7000

  const [interlocutorIsOnline] = useTemp(lastOnlineTimestamp || 0, SHOW_ONLINE_TIME)
  const [interlocutorIsTyping] = useTemp(lastTypingTimestamp || 0, SHOW_TYPING_TIME)

  let dotsInterval: any = useRef(null)
  useEffect(() => {
    if (interlocutorIsTyping) {
      const dotsElem = document.getElementById('dots')
      if (dotsElem) {
        dotsInterval.current = setInterval(() => {
          const dots = dotsElem.innerHTML
          dotsElem.innerHTML = dots.length === 3 ? '' : dots + '.'
        }, 300)
      }
    } else {
      clearInterval(dotsInterval.current)
    }
  }, [interlocutorIsTyping])

  useLayoutEffect(() => {
    const lastMessageFromPrev = prevMessages
      ? prevMessages[prevMessages.length - 1] : null
    const lastMessage = messages ? messages[messages.length - 1] : null
    const newMessagesAreLoaded = !!lastMessageFromPrev
      && !!lastMessage && lastMessage.id > lastMessageFromPrev.id
    const currentHeight = chatMessagesElem.current?.getBoundingClientRect().height
    const prevHeight = chatMessagesHeightPrev.current

    if (newMessagesAreLoaded && scrollPositionIsSet
      && chatWrapperElem.current && currentHeight
      && prevHeight !== undefined && currentHeight > prevHeight
    ) {
      chatWrapperElem.current.scrollTop = chatWrapperElem.current.scrollTop
        - (currentHeight - prevHeight)
    }
    // const firstMessage = messages.length ? messages[0] : null
    // const prevFirstMessage = (prevMessages && prevMessages.length) ? prevMessages[0] : null
    // const prevMessagesAreLoaded = !!firstMessage && !!prevFirstMessage && prevFirstMessage.id > firstMessage.id
    // if(prevMessagesAreLoaded && scrollPositionIsSet && chatWrapperElem.current && currentHeight && prevHeight !== undefined && currentHeight > prevHeight) {
    // console.log(chatWrapperElem.current.scrollTop, currentHeight, prevHeight)
    // chatWrapperElem.current.scrollTop = chatWrapperElem.current.scrollTop + (currentHeight - prevHeight)
    // console.log(chatWrapperElem.current.scrollTop, currentHeight, prevHeight)
    // }
    chatMessagesHeightPrev.current = currentHeight
  }, [messages, messages.length, prevMessages, scrollPositionIsSet])

  const prevChatUnreadMessagesCount = usePrevious(chatUnreadMessagesCount)

  useEffect(() => {
    if (prevChatUnreadMessagesCount !== undefined
      && prevMessageCursor
      && chatUnreadMessagesCount > prevChatUnreadMessagesCount
    ) {
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
    if (existingChat && !prevExistingChat) {
      const firstUnreadMessage = existingChat.messages.slice().reverse().find(m => {
        return m.creator.id !== currentUserId && !m.readBy.includes(currentUserId)
      })
      firstUnread.current = firstUnreadMessage ? firstUnreadMessage.id : null
    }
  }, [currentUserId, existingChat, prevExistingChat])

  const sendMessageToExistingChat = useCallback(async (
    chatId: string, message: MessageType, chatWindowId: string
  ) => {
    setSendingMessages(prev => [...prev, message])
    try {
      await chatsAPI.createMessage(
        chatId, message.text, message.clientId, message.replied?.id, chatWindowId
      )
    }
    catch (e) {
      if (existingChatRef.current) {
        const existingMessage = existingChatRef.current.messages.find(
          m => m.clientId === message.clientId
        )
        if (!existingMessage) {
          // Если сообщение уже в store, то не нужно добавлять сообщение в unsent messages
          let copy = createNewMessage(
            '-1', message.clientId, chatId, message.text,
            message.replied, message.creator, true
          )
          addUnsentMessageToStorage(copy)
        }
      }
      setSendingMessages(prev => prev.filter(m => m.clientId !== message.clientId))
    }
  }, [setSendingMessages])

  useEffect(() => {
    if (chatId !== prevChatId && prevChatId === '-1') {
      const chatPendingMessages = messagesForCreatingChatsRef.current.filter(
        pm => pm.chatId === chatClientId
      )
      setMessagesForCreatingChats(prev => prev.filter(
        pm => pm.chatId !== chatClientId
      ))
      chatPendingMessages.forEach(pm => {
        sendMessageToExistingChat(chatId, pm, windowId)
      })
    }
    existingChatRef.current = existingChat
  }, [
    chatId, existingChat, chatClientId, prevChatId, windowId,
    sendMessageToExistingChat, setMessagesForCreatingChats
  ])

  const toggleToBottomButton = useCallback(debounce(() => {
    if (!toBottomButton.current || !chatWrapperElem.current) return
    const currentDisplayValue = toBottomButton.current.style.display

    const messagesWrapperBottom = chatMessagesElem.current
      ? chatMessagesElem.current.getBoundingClientRect().bottom
      : 0
    const chatWrapperBottom = chatWrapperElem.current.getBoundingClientRect().bottom
    const difference = messagesWrapperBottom - chatWrapperBottom
    // noScroll === true, если скроллбар отсутствует
    const noScroll = chatWrapperElem.current.getBoundingClientRect().height
      === chatWrapperElem.current.scrollHeight

    if (noScroll) {
      toBottomButton.current.style.display = 'none'
    }
    else if (difference < 80) {
      if (difference <= 0 || (!chatUnreadMessagesCount && currentDisplayValue !== 'none')) {
        toBottomButton.current.style.display = 'none'
      } else if (chatUnreadMessagesCount && currentDisplayValue !== 'block') {
        toBottomButton.current.style.display = 'block'
      }
    }
    else if (difference >= 80 && currentDisplayValue !== 'block') {
      toBottomButton.current.style.display = 'block'
    }
  }, 30), [chatUnreadMessagesCount])

  useEffect(() => {
    toggleToBottomButton()
  }, [toggleToBottomButton])

  useEffect(() => {
    document.title = `${t('Messenger')}${chatUnreadMessagesCount
      ? ` (${chatUnreadMessagesCount} unread messages)` : ''}`
  }, [t, chatUnreadMessagesCount, prevChatUnreadMessagesCount])

  const handleLoadPrevMessages = useCallback(() => {
    if (existingChat && nextMessageCursor && !lastMessagesAreLoading) {
      dispatch(loadPrevMessages(existingChat.id, 30, nextMessageCursor))
    }
  }, [dispatch, existingChat, nextMessageCursor, lastMessagesAreLoading])

  const handleLoadNextMessages = useCallback(() => {
    if (existingChat && prevMessageCursor && !lastMessagesAreLoading) {
      dispatch(loadNextMessages(existingChat.id, 30, prevMessageCursor))
    }
  }, [dispatch, existingChat, prevMessageCursor, lastMessagesAreLoading])

  useIntersection(scrollPositionIsSet, handleLoadPrevMessages, loadPrev)
  useIntersection(scrollPositionIsSet, handleLoadNextMessages, loadNext)

  useEffect(() => {
    (async function () {
      if (chatIsOnline && prevChatIsOnline === false && currentUserId && existingChat) {
        if (loadPrevIsIntersecting.current) {
          handleLoadPrevMessages()
        }
        const chat = existingChat
        const neededActionsCount = onOfflineTimestamp.current
          ? Number(`${onOfflineTimestamp.current}`.substring(0, 10))
          : 0
        let response = await chatsAPI.getChatActions(
          chat.id, null, '1,2,3,4', neededActionsCount
        )
        setSendingMessages(prev => prev.filter(m => m.chatId !== chat.clientId))
        const chatActions = response.data.items
        dispatch(actions.handleUpdates(chatActions, currentUserId))
      }
    }())
    chatIsOnlineRef.current = chatIsOnline
  }, [
    dispatch, chatIsOnline, prevChatIsOnline, currentUserId,
    existingChat, windowId, handleLoadPrevMessages, setSendingMessages
  ])

  const prevInterlocutorId = usePrevious(interlocutorId)

  useEffect(() => {
    if (prevInterlocutorId && prevInterlocutorId !== interlocutorId) {
      setEditingMessage(null)
      setChatNotFound(false)
      setIsInitialized(isInitializedRef.current = false)
    }
  }, [interlocutorId, prevInterlocutorId])

  useEffect(() => {
    if (!existingChat && currentUserId) {
      (async function () {
        try {
          let chatResponse = await chatsAPI.getChatsOfUser(
            currentUserId, 'pair_user_chat', interlocutorId, 1, null, null
          )
          if (chatResponse.data.items.length > 0) {
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
              if (!!error.response && error.response.status === 404) {
                setChatNotFound(true)
              }
            }
          }
          setIsInitialized(isInitializedRef.current = true)
        } catch (e) { }
      })()
    } else if (existingChat || chatStub || creatingChat) {
      setIsInitialized(isInitializedRef.current = true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interlocutorId, dispatch])

  useEffect(() => {
    if (!!existingChat) {
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

  /*
    При загрузке чата добавляем обработчик на изменение видимости документа,
    если вкладка браузера не активна, то делаем tabInFocus false, если
    активна, то true. При изменении tabInFocus отрабатывает другой useEffect.
  */
  useEffect(() => {
    function docVisibilitychange() { setTabInFocus(tabInFocusRef.current = !document.hidden) }
    document.addEventListener('visibilitychange', docVisibilitychange)
    return () => document.removeEventListener('visibilitychange', docVisibilitychange)
  }, [])

  /*Этот useEffect выполняется каждый раз, но именно весь код выполняется
  только раз, когда scrollPositionIsSet === false, чат отрисован, когда
  <NewMessage/> отрисовано и когда загружен чат, это случается только
  один раз после монтирования*/
  useEffect(() => {
    if (isInitialized && !scrollPositionIsSet) {
      // const messages = existingChat?.messages || []
      // const firstUnread = [...messages].reverse().find(
      //   m => m.creator.id !== currentUserId && !m.readBy.includes(currentUserId)
      // )
      // if (firstUnread) {
      //   const element = document.getElementById(firstUnread.id)
      //   if (element && chatWrapperElem.current && chat && chatMessagesElem.current) {
      //     const chatMessagesElemRect = chatMessagesElem.current.getBoundingClientRect()
      //     chatWrapperElem.current.scrollTop = -(chatMessagesElemRect.height - element.offsetHeight)
      //   }
      // }
      // else if (chatWrapperElem.current) {
      //   chatWrapperElem.current.scrollTop = chatWrapperElem.current.scrollHeight
      // }
      if (chatWrapperElem.current) {
        chatWrapperElem.current.scrollTop = chatWrapperElem.current.scrollHeight
      }
      setScrollPositionIsSet(true)
    }
  }, [isInitialized, existingChat, chat, currentUserId, scrollPositionIsSet])

  type LastReadOfflineType = {
    chatId: string
    messageId: string
  }

  const readOffline = (
    prev: Array<LastReadOfflineType>,
    lastVisibleUnreadId: string,
    chatId: string
  ): Array<LastReadOfflineType> => {
    const prevLastRead = prev.find(ro => ro.chatId === chatId)
    if (!prevLastRead
      || (prevLastRead && prevLastRead.messageId < lastVisibleUnreadId)
    ) {
      chatsAPI.updateChat(chatId, 'last_read_message', lastVisibleUnreadId)
      const readOfflineNew = prev.filter(pro => pro.chatId !== chatId)
      readOfflineNew.push({ chatId, messageId: lastVisibleUnreadId })
      return readOfflineNew
    }
    return prev
  }

  const readMessages = useCallback(debounce((chatId: string) => {
    const lastVisibleUnreadId = getLastUnreadAndVisibleMessageIdOfInterlocutor()
    if (lastVisibleUnreadId && chatId) {
      setReadOffline(prev => readOffline(prev, lastVisibleUnreadId, chatId))
    }
  }, 30), [])

  useEffect(() => {
    if (!scrollPositionIsSet) return

    if (chatWrapperElem.current && messages.length > previousMessagesLength) {
      let lastMessage = messages[0]
      let prevLastMessage = prevMessages[0]
      let prevLastMessageId: string | null = prevLastMessage ? prevLastMessage.id : '-1'
      let chatIsSame = chat && chat.id !== '-1' && chat.id === prevChatId
      if (chatIsSame && lastMessage
        && lastMessage.creator.id !== currentUserId
        && lastMessage.id > prevLastMessageId
      ) {
        playSoundDebounced()
      }
    }
    // if (messages.length && existingChat && tabInFocus) {
    //   readMessages(existingChat.id)
    // }
  }, [
    messages, prevMessages, messages.length, previousMessagesLength, scrollPositionIsSet,
    prevTabInFocus, chat, prevChatId, currentUserId, existingChat, readMessages
  ])

  useEffect(() => {
    if (tabInFocus && existingChat && isInitializedRef.current) {
      readMessages(existingChat.id)
    }
  }, [tabInFocus, readMessages, existingChat])

  // useEffect(() => {
  //   if (prevTabInFocus !== undefined && !prevTabInFocus && tabInFocus && existingChat && isInitializedRef.current) {
  //     readMessages(existingChat.id)
  //   }
  // }, [tabInFocus, prevTabInFocus, readMessages, existingChat])

  useEffect(() => {
    if (rerender > 0) {
      setTimeout(() => {
        if(chatWrapperElem.current) {
          scrollChatSmoothly(chatWrapperElem.current.scrollHeight)
        }
      }, 220)
    }
  }, [rerender])

  function getLastUnreadAndVisibleMessageIdOfInterlocutor(): string | null {
    const messagesCollection = document.querySelectorAll('.message')
    const messages = elementsCollectionToSimpleArray(messagesCollection)
    const reversed = messages.reverse()

    for (let i = 0; i < reversed.length; i++) {
      let mes = reversed[i]
      let isRead = !!Number(mes.dataset.isread)
      let isOwn = !!Number(mes.dataset.isown)
      if (isRead) return null

      if (!isOwn && !isRead && chatWrapperElem.current) {
        let chatRect = chatWrapperElem.current.getBoundingClientRect()
        let bottomOfChat = chatRect.top + chatRect.height
        let messageRect = mes.getBoundingClientRect()
        let ololo = messageRect.height / 2
        let messageTop = messageRect.top + ololo
        let id = mes.id

        if (messageTop < bottomOfChat) return id
      }
    }
    return null
  }

  function scrollChatSmoothly(top: number) {
    if(chatWrapperElem.current) {
      chatWrapperElem.current.scrollTo({ top, left: 0, behavior: 'smooth' })
    }
  }

  function setScrollPosition(chatId: string) {
    if (chatWrapperElem.current) {
      let oldPositions = localStorage['scroll-positions']
        ? JSON.parse(localStorage['scroll-positions']) : []
      let prevChatPosition = oldPositions.find((p: any) => p.chatId === chatId)
      if (prevChatPosition) {
        prevChatPosition.position = chatWrapperElem.current.scrollTop
        localStorage.setItem('scroll-positions', JSON.stringify(oldPositions))
      } else {
        let newPositions = [
          ...oldPositions,
          { 'chatId': chatId, position: chatWrapperElem.current.scrollTop }
        ]
        localStorage.setItem('scroll-positions', JSON.stringify(newPositions))
      }
    }
  }

  const setScrollPositionDebounced = useCallback(debounce(setScrollPosition, 200), [])

  function handleScroll() {
    if (existingChat) {
      setScrollPositionDebounced(existingChat.id)
      readMessages(existingChat.id)
    }
    toggleToBottomButton()
  }

  function handleCloseDeleteMessageDialog() {
    setShowDeleteMessageDialog(false)
    setDeleteMessageForAllCheckBoxValue(false)
  }

  const createChatAndSendMessage = useCallback(
    async (
      message: MessageType, interlocutorId: string,
      chatClientId: string, chatWindowId: string
    ) => {
      setSendingMessages(prev => [...prev, message])
      try {
        await chatsAPI.createPairChat(
          interlocutorId, message.text, chatClientId,
          message.clientId, chatWindowId
        )
      } catch (e) {
        addUnsentMessageToStorage({ ...message, sendingError: true })
        setSendingMessages(prev => prev.filter(m => m.clientId !== message.clientId))
      }
    },
    [setSendingMessages]
  )

  const handleResend = useCallback(async (messageId: string) => {
    const unsentMessage = getUnsentMessageFromStorage(messageId)
    if (!unsentMessage) return

    if (unsentMessage.replied) {
      const replied = messages.find(m => m.id === (unsentMessage?.replied?.id || '-1'))
      unsentMessage.replied = replied || null
    }
    removeUnsentMessageFromStorage(messageId)
    if (unsentMessage && !existingChat && chatStub) {
      createChatAndSendMessage(
        { ...unsentMessage, sendingError: false },
        interlocutorId, chatClientId, windowId
      )
    } else if (unsentMessage && existingChat) {
      sendMessageToExistingChat(
        existingChat.id,
        { ...unsentMessage, sendingError: false },
        windowId
      )
    }
  }, [
    existingChat, chatStub, interlocutorId, chatClientId, windowId, messages,
    createChatAndSendMessage, sendMessageToExistingChat
  ])

  const handleUnsentDelete = useCallback(async (messageId: string) => {
    removeUnsentMessageFromStorage(messageId)
    setUpdateUnsent(prev => !prev)
  }, [setUpdateUnsent])

  if (currentUserId === '-1') {
    return <Redirect to="/login" />
  }
  if (chatNotFound) {
    return (
      <div className={classes.chatNotFound} >
        Chat not found
      </div>
    )
  }

  const sendMessage = (text: string, replied: MessageType | null) => {
    let clientId = createUlidId()
    const creator = createUser(
      currentUserId || '', currentUserData.firstName || '',
      currentUserData.lastName || '', currentUserData.avatar || null
    )
    if (existingChat) {
      let message = createNewMessage(
        '-1', clientId, existingChat.id, text, replied, creator, false
      )
      sendMessageToExistingChat(existingChat.id, message, windowId)
    } else if (chatStub) {
      let message = createNewMessage(
        '-1', clientId, chatStub.clientId, text, replied, creator, false
      )
      createChatAndSendMessage(message, interlocutorId, chatClientId, windowId)
    }
  }

  const onSendMessage = async (text: string, replied: MessageType | null) => {

    if (prevMessageCursor && chat) {
      // Подгрузка крайних сообщений. Это происходит, если отправляется сообщение
      // и мы знаем, что самые крайние сообщения не загружены. Отправка сообщения
      // проматывает чат вниз, поэтому нужно сделать именно так.
      try {
        setLastMessagesAreLoading(true)
        if (chatWrapperElem.current) {
          chatWrapperElem.current.scrollTop = chatWrapperElem.current.scrollHeight
        }
        const chatId = chat.id
        const response = await chatsAPI.getMessages(chatId, 30, null, 'DESC')
        const messages = response.data.items
        dispatch(actions.setMessages(chatId, messages, null, response.data.nextCursor))
        const lastMessage = messages[0]
        if (lastMessage && chatId) {
          setReadOffline(prev => readOffline(prev, lastMessage.id, chatId))
        }
        if (toBottomButton.current) {
          toBottomButton.current.style.display = 'none'
        }
        sendMessage(text, replied)
      } catch (e) {

      } finally {
        setLastMessagesAreLoading(false)
      }
    } else {
      sendMessage(text, replied)
    }
    setTimeout(() => {
      if (chatWrapperElem.current) {
        scrollChatSmoothly(chatWrapperElem.current.scrollHeight)
      }
    }, 50)
  }

  const chatMessages = chat?.messages || []
  const filteredSendingMessages = deleteDuplicates(sendingMessages, chatMessages)
  const filteredMessagesForRestoring = deleteDuplicates(
    messagesForRestoringChats, [...chatMessages, ...filteredSendingMessages]
  )
  const filteredMessagesForCreatingChats = deleteDuplicates(
    messagesForCreatingChats, [...chatMessages, ...filteredSendingMessages]
  )
  let unsentMessages = chat
    ? getChatUnsentMessages(
      chat.id, chat.clientId, chat.prevMessageCursor, currentUserId
    )
    : []
  unsentMessages.forEach(um => {
    if (um.replied) {
      let replied = chatMessages.find(m => m.id === um?.replied?.id)
      um.replied = replied || null
    }
  })

  let allMessages = [
    ...unsentMessages, ...filteredSendingMessages, ...chatMessages,
    ...filteredMessagesForRestoring, ...filteredMessagesForCreatingChats
  ]
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
    if (!dialogueDay) {
      dialogueDay = {
        dayId: `${day}${month}${year}`,
        date: dayDate, messages: [], groups: [], timestamp: newTimestamp
      }
      days.push(dialogueDay)
    }
    dialogueDay.messages.push(message)
  })

  let header = null
  if (isPairChat) {
    let interlocutor = chat && chat.participants.find(p => p.id !== currentUserId)
    let interlocutorName = interlocutor?.firstName && interlocutor?.lastName
      ? `${interlocutor.firstName} ${interlocutor.lastName}` : ''

    let interlocutorAvatar = interlocutor?.picture
    const handleClose = () => setShowAcceptDeleteDialog(false)
    const handleDeleteDialog = async () => {
      if (chat) {
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
          <Button onClick={handleClose} children={t('Cancel')} />
          <Button onClick={handleDeleteDialog} children={t('Yes')} />
        </DialogActions>
      </Dialog>
    )
    const handleOpenMenu = (event: any) => setAnchorEl(event.currentTarget)
    const handleCloseMenu = () => setAnchorEl(null)

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
          children={
            <Typography variant='body2' >
              {t('Delete chat')}
            </Typography>
          }
        />
      </Menu>
    )

    let interlocutorStatus = null
    if (interlocutorIsTyping && chatIsOnline) {
      interlocutorStatus = <>
        <Typography variant='body2' color='textSecondary' >
          {t('is typing')}
        </Typography>
        <div id='dots' className={classes.dots} />
      </>
    }
    else if (interlocutorIsOnline && chatIsOnline) {
      interlocutorStatus = (
        <Typography variant='body2' color='textSecondary'>
          {t('interlocutor is online')}
        </Typography>
      )
    }
    else if (!chatIsOnline) {
      interlocutorStatus = <span>
        <Typography variant="body2" color='textSecondary' >
          {t('No internet connection')}
        </Typography>
        <CircularProgress size='16' disableShrink={true} />
      </span>
    }
    else {
      interlocutorStatus = (
        <Typography variant='body2' color='textSecondary' >
          {t('last seen recently')}
        </Typography>
      )
    }

    header = (
      <header className={classes.header} >
        <IconButton
          className={classes.toChatsPreviewsButton}
          component={NavLink} to={`/chats`}
          size='small'
          children={<KeyboardArrowLeftIcon fontSize='large' />}
        />

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
            {!!interlocutor
              ?
              <NavLinkAvatar
                width={40}
                picture={interlocutorAvatar || null}
                name={interlocutorName}
                to={`/i/${interlocutorId}`}
              />
              :
              <Skeleton variant="circle" width={40} height={40} />
            }
          </FlickeringDotBadge>
        </div>

        {chat &&
          <div className={classes.interlocutorNameAndConnectionStatus} >
            <div className={classes.interlocutorName} >
              <TypographyLink
                variant='body1'
                to={`/i/${interlocutorId}`}
                children={interlocutorName}
              />
            </div>

            <div className={classes.interlocutorName} >
              {interlocutorStatus}
            </div>
          </div>
        }
        <div className={'grow'} />

        {chat &&
          <div className={classes.chatMenu}>
            <div>
              {menu}
              <IconButton
                size='small'
                onClick={handleOpenMenu}
                children={<MoreVertIcon />}
              />
            </div>

            {deleteDialog}
          </div>
        }
        {prevMessagesLoading &&
          <div className={classes.moreMessagesProgress}>
            <CircularProgress disableShrink={true} />
          </div>
        }
      </header>
    )
  }

  const onDelete = () => {
    setEditingMessage(null)
  }

  const onEditClick = (message: MessageType) => {
    setEditingMessage(message)
  }

  const onReplyClick = (message: MessageType) => {
    setRepliedMessage(message)
  }

  const body = (
    <div
      className={classes.chatBody}
      id='chat-body'
      ref={chatWrapperElem}
      onScroll={handleScroll}
    >
      <div className={classes.loadMoreWrapper}>
        <div
          id='load-next' ref={loadNext}
          className={classes.loadNext}
        />
      </div>

      <section ref={chatMessagesElem} className={classes.messagesSection} >
        <List className={classes.messages} subheader={<li />}>
          {days.map(day => {
            let timestamp = day.timestamp
            const messageDate = new Date(timestamp)
            let dateFormat = new Date().getFullYear() === messageDate.getFullYear()
              ? "DD MMMM" : "DD MMMM YYYY"

            const dayMessages = day.messages.map((message, index) => {
              let isFirst = false
              let isLast = false
              let prevMessage = index > 0 ? day.messages[index - 1] : null
              let nextMessage = day.messages[index + 1]
              if (!nextMessage || (nextMessage && nextMessage.creator.id !== message.creator.id)) {
                isLast = true
              }
              if (!prevMessage || (prevMessage && prevMessage.creator.id !== message.creator.id)) {
                isFirst = true
              }
              prevMessage = message
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
                  <ListSubheader className={classes.dayContainer}  >
                    <div className={classes.dayDateWrapper} >
                      <div className={classes.dayDate} >
                        <Typography variant='body2' >
                          {isToday(messageDate)
                            ? t('Today')
                            : moment(timestamp).format(dateFormat)
                          }
                        </Typography>
                      </div>
                    </div>
                  </ListSubheader>

                  {dayMessages}
                </ul>
              </li>
            )
          })}
        </List>
      </section>

      <div style={{ position: 'relative' }}>
        <div
          id='load-prev'
          ref={loadPrev}
          className={classes.loadPrev}
        />
      </div>

      {(!chat || lastMessagesAreLoading || !scrollPositionIsSet) &&
        <div className={classes.loading}>
          <NewCircularProgress size={80} />
        </div>
      }
    </div>
  )

  const handleToBottomButtonClick = async () => {
    if (prevMessageCursor && chat) {
      try {
        setLastMessagesAreLoading(true)
        if (chatWrapperElem.current) {
          chatWrapperElem.current.scrollTop = chatWrapperElem.current.scrollHeight
        }
        const chatId = chat.id
        const response = await chatsAPI.getMessages(chatId, 30, null, 'DESC')
        const messages = response.data.items
        dispatch(actions.setMessages(chatId, messages, null, response.data.nextCursor))
        const lastMessage = messages[0]
        if (lastMessage && chatId) {
          setReadOffline(prev => readOffline(prev, lastMessage.id, chatId))
        }
        if (toBottomButton.current) {
          toBottomButton.current.style.display = 'none'
        }
        setLastMessagesAreLoading(false)
      } catch (e) {
        setLastMessagesAreLoading(false)
      }
    } else {
      scrollChatSmoothly(chatWrapperElem.current
        ? chatWrapperElem.current.scrollHeight : 9999999999
      )
    }
  }

  const handleCloseReplying = () => {
    setRepliedMessage(null)
  }

  const handleCloseEditMode = () => {
    setEditingMessage(null)
  }

  const handleEditSave = async (messageId: string, newText: string) => {
    const chatId = chat?.id
    if (!chatId) return

    const currentText = editingMessage?.text || ''
    setEditingMessage(null)
    dispatch(actions.updateMessage(chatId, messageId, newText))
    try {
      await chatsAPI.updateMessage(messageId, 'text', newText, windowId)
    } catch (e) {
      dispatch(actions.updateMessage(chatId, messageId, currentText))
      const action = (key: any) => (
        <IconButton
          size='small'
          onClick={() => closeSnackbar(key)}
          children={<CloseIcon />}
        />
      )
      enqueueSnackbar(
        'Message was not edited',
        { action, variant: 'error' }
      )
    }
  }

  const handleDeleteForAllCheckBoxChange = () => {
    setDeleteMessageForAllCheckBoxValue(prev => !prev)
  }

  return (
    <>
      <Paper className={classes.chat} >
        {header}
        <Divider />
        {body}

        <div style={{ position: 'relative' }} >
          <ColorButton
            ref={toBottomButton}
            className={classes.toBottom}
            disableRipple
            onClick={handleToBottomButtonClick}
          >
            {chatUnreadMessagesCount
              ?
              <Badge
                badgeContent={chatUnreadMessagesCount}
                color="secondary"
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                children={<ArrowDownwardIcon />}
              />
              :
              <ArrowDownwardIcon />
            }
          </ColorButton>

          <Divider />

          <section className={classes.newMessageSection}>
            <NewMessage
              isDisabled={lastMessagesAreLoading}
              onSubmit={onSendMessage}
              isAcceptsMessages={true}
              chatId={chat ? chat.id : '-1'}
              isInitialized={isInitialized}
              editingMessage={editingMessage}
              closeEditMode={handleCloseEditMode}
              onEditSave={handleEditSave}
              repliedMesage={repliedMessage}
              onCloseReplying={handleCloseReplying}
            />
          </section>
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
                  onChange={handleDeleteForAllCheckBoxChange}
                />
              }
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
      backgroundColor: isLight
        ? theme.palette.grey[300]
        : theme.palette.grey[700],
      '&:hover': {
        backgroundColor: isLight
        ? theme.palette.grey[200]
        : theme.palette.grey[600],
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

  return day === currentDay
    && month === currentMonth
    && year === currentYear
}

export const onRepliedOrEditedClick = (id: string, color: string) => {
  const messageElement = document.getElementById(id)
  if (messageElement) {
    const parent = messageElement.parentElement
    if (!parent) return

    parent.style.background = color
    parent.scrollIntoView({ behavior: 'smooth' })
    setTimeout(() => {
      parent.style.background = 'inherit'
    }, 1000)
  }
}

export default Chat