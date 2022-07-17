import React, { useCallback, useEffect, useRef, useState } from 'react';
import {useDispatch, useSelector} from 'react-redux'
import {Redirect, useLocation} from 'react-router-dom'
import {useStyles} from './ChatsPreviewsStyles'
import { AppStateType } from '../../../redux/redux_store.js';
import { Card, CircularProgress, List, Paper } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { copyChat, copyPreview, createPreviewFromChat, loadMorePreviews } from '../../../redux/chats_reducer';
import EmptyListStub from '../../Common/EmptyListStub';
// import AnimatedListItem from '../Common/AnimatedListItem';
import ChatPreview from './ChatPreview';
import { ChatPreviewType, ChatType, MessageType } from '../../../types/chats_types';
import { getChatUnsentMessages } from '../../../helper/helperChatFunctions';
import { useIntersection } from '../../../hooks/hooks';

type ChatsPreviewsPropsType = {
  sendingMessages: Array<MessageType>
  pendingMessages: Array<MessageType>
  chatsStubs: Array<ChatType>
  messagesForRestoringChats: Array<MessageType>
  messagesForCreatingChats: Array<MessageType>
  readOffine: Array<any>
  onlineChats: Array<any>
  typingChats: Array<any>
}

const ChatsPreviews: React.FC<ChatsPreviewsPropsType> = React.memo((props: ChatsPreviewsPropsType) => {
  const {
    sendingMessages, chatsStubs,
    readOffine, onlineChats, typingChats
  } = props
  const chatsPreviews = useSelector((state: AppStateType) => state.chats.chatsPreviews)
  const chats = useSelector((state: AppStateType) => state.chats.chats)
  const chatsListCursor = useSelector((state: AppStateType) => state.chats.previewsCursor)
  const currentUserId = useSelector((state: AppStateType) => state.auth.id)
  const classes = useStyles({dialogueIsOpen: true})
  const { t } = useTranslation();
  const dispatch = useDispatch()
  const [moreLoading, setMoreLoading] = useState(false)
  const moreChatsLoading = useRef(false)
  const location = useLocation()
  const splittedPathName = location.pathname.split('/')
  const chatIsOpen = splittedPathName[1] === 'chats' && splittedPathName[2] === 'c'
  const openedChatInterlocutorId = chatIsOpen ? splittedPathName[3] : null
  const loadMoreElem = useRef(null)

  useEffect(() => {
    // return () => console.log('chats previews unmount')
  }, [])

  const handleLoadMore = useCallback(async () => {
    if(currentUserId && chatsListCursor) {
      setMoreLoading(moreChatsLoading.current = true)
      await dispatch(loadMorePreviews(currentUserId, 10, chatsListCursor))
      setMoreLoading(moreChatsLoading.current = false)
    }
  }, [dispatch, currentUserId, chatsListCursor])

  useIntersection(!!chatsPreviews, handleLoadMore, loadMoreElem)

  if(!currentUserId) {
    return <Redirect to="/login"/>
  }

  let chatItemSkeleton = (
    <div
      style={{
        height: 60,
        padding: `4px 16px`,
        display: 'flex'
      }}
    >
      <Skeleton style={{}} variant='circle' height={48} width={48} />
      <div style={{marginLeft: 8}}>
        <Skeleton variant='text' height={20} width={150} />
        <Skeleton variant='text' height={20} width={200} />
      </div>
    </div>
  )

  const withSendingAndUnsentMessages: ChatPreviewType[] = []
  chatsPreviews?.forEach(cp => {
    const lastSending = [...sendingMessages].reverse().find(sm => sm.chatId === cp.id)
    const unsentMessages = getChatUnsentMessages(cp.id, null)
    const lastUnsent: MessageType | null = unsentMessages.length
      ? unsentMessages[unsentMessages.length - 1] : null

    const copy = copyPreview(cp)
    if(lastSending && lastSending.createdAt > (copy?.lastMessage?.createdAt || 1)) {
      copy.lastMessage = lastSending
    }
    if(lastUnsent && lastUnsent.createdAt > (copy?.lastMessage?.createdAt || 1)) {
      copy.lastMessage = lastUnsent
    }
    withSendingAndUnsentMessages.push(copy)
  })

  const stubsPreviews: Array<ChatPreviewType> = []
  chatsStubs.forEach(chatStub => {
    const lastSending = [...sendingMessages].reverse().find(sm => sm.chatId === chatStub.clientId)
    const unsentMessages = getChatUnsentMessages(chatStub.id, chatStub.clientId)
    const lastUnsent: MessageType | null = unsentMessages.length
      ? unsentMessages[unsentMessages.length - 1] : null

    if(lastSending || lastUnsent) {
      const lastMessage = (lastSending?.createdAt || "0") > (lastUnsent?.createdAt || "0") ? lastSending : lastUnsent
      const copy = copyChat(chatStub)
      copy.lastMessage = lastMessage || null
      stubsPreviews.push(createPreviewFromChat(copy, currentUserId))
    }
  })

  const withStubs = [...(withSendingAndUnsentMessages || []), ...stubsPreviews]

  // Будет такой момент где есть не заглушка и заглушка с одинаковым ID или clientId, в таком случае нужно убрать заглушку

  if(!chatsPreviews) {
    return (
      <Card style={{padding: '8px 0'}}>
        {chatItemSkeleton}
        {chatItemSkeleton}
        {chatItemSkeleton}
      </Card>
    )
  }

  if(!withStubs.length) {
    return (
      <EmptyListStub
        imageSrc='/images/animals/dolphin.png'
        containerWidth={150}
        containerHeight={150}
        text={t("You have no chats")}
      />
    )
  }

  withStubs.sort((a, b) => {
    const aChatLastMessage = a.lastMessage
    const bChatLastMessage = b.lastMessage

    const aChatLastMessageId = aChatLastMessage
      ? (aChatLastMessage.id === '-1' ? aChatLastMessage.clientId : aChatLastMessage.id)
      : "-1"
    const bChatLastMessageId = bChatLastMessage
      ? (bChatLastMessage.id === '-1' ? bChatLastMessage.clientId : bChatLastMessage.id)
      : "-1"
    if(aChatLastMessageId > bChatLastMessageId) return -1
    if(aChatLastMessageId < bChatLastMessageId) return 1
    return 0
  })

  let chatsPreviewsList = withStubs.map((preview) => {
    const lastMessage = preview.lastMessage
    let lastMessageText = '';
    let lastMessageDate = '';
    if(lastMessage) {
      lastMessageText = (lastMessage.text || '==empty==').length > 25
        ? lastMessage.text //`${lastMessage.text.substring(0, 25)}...`
        : lastMessage.text
      lastMessageDate = moment(lastMessage.createdAt).format("DD.MM.YYYY")
    }

    let unreadMessagesCount = preview.unreadMessagesCount

    const chat = chats.find(c => c.id === preview.id)

    if(chat) {
      const lastReadOffline = readOffine.find(ro => ro.chatId && ro.chatId === chat.id)
      const lastReadOfflineId = lastReadOffline?.messageId
      if(chat.lastReadMessageId && lastReadOfflineId && lastReadOfflineId > chat.lastReadMessageId) {
        const lastReadMessageId = chat.lastReadMessageId
        const messagesReadOfflineLength = chat.messages.filter(m => m.id <= lastReadOfflineId && m.id > lastReadMessageId).length
        unreadMessagesCount = unreadMessagesCount - messagesReadOfflineLength
      }
    }
    const onlineTimestamp = onlineChats.find(oc => oc.chatId === preview.id)?.timestamp || null
    const typingTimestamp = typingChats.find(tc => tc.chatId === preview.id)?.timestamp || null

    // if(preview.type === 'pair_user_chat') {
      let interlocutor = preview.interlocutors[0]
      if(!interlocutor) return null
      return (
        // @ts-ignore
        // <AnimatedListItem
        //   ref={createRef()}
        // >
          <ChatPreview
            key={preview.id}
            to={`/chats/c/${interlocutor.id}`}
            chatId={preview.id}
            interlocutorId={interlocutor.id}
            interlocutorName={`${interlocutor.firstName} ${interlocutor.lastName}`}
            interlocutorAvatar={interlocutor.picture || ''}
            lastMessage={lastMessage}
            lastMessageText={lastMessageText}
            lastMessageDate={lastMessageDate}
            currentUserId={currentUserId}
            chatUnreadMessagesCount={unreadMessagesCount}
            onlineTimestamp={onlineTimestamp}
            typingTimestamp={typingTimestamp}
            selected={interlocutor.id === openedChatInterlocutorId}
          />
        // </AnimatedListItem>
      )
    // }
  })

  return (
    <div>
      <Paper>
        <List >
          {/* <AnimatedList> */}
            {chatsPreviewsList}
          {/* </AnimatedList> */}
        </List>
      </Paper>
      <div
        ref={loadMoreElem}
        id='load-more-previews'
        style={{
          padding: chatsListCursor ? 8 : 0,
          height: chatsListCursor ? 40 : 0,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        { moreLoading && <CircularProgress size={24} /> }
      </div>
    </div>
  )
})

export default ChatsPreviews