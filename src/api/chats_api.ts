import { ActionType, ChatType, MessageType } from '../types/chats_types'
import { instance } from './api'

type GetChatsResponseType = {
  items: Array<ChatType>
  allCount: number
  cursor: string | null
}

type GetChatsActionsResponseType = {
  items: Array<ActionType>
  cursor: number | null
}

type GetChatResponseType = {
  chat: ChatType
}

type CreateMessageResponseType = {
  id: string
}

type GetMessageResponseType = {
  message: MessageType
}

type GetMessagesResponseType = {
  items: Array<MessageType>
  prevCursor: string | null
  nextCursor: string | null
}

export const chatsAPI = {
  // getChat: (user1Id: string, user2Id: string) => instance.get(`chats/`),
  // getPairChatByUsersIds: (user1Id: string, user2Id: string) => instance.get<GetChatsResponseType>(`chats?is-group=0&users-ids=${user1Id},${user2Id}`),
  getPairChatsOfUser: (userId: string, interlocutorId: string | null) => {
    const interlocutorParam = interlocutorId ? `&interlocutor-id=${interlocutorId}` : ''
    return instance.get<GetChatsResponseType>(`users/${userId}/pair-chats?${interlocutorParam}`)
  },
  getChatsOfUser: (
    userId: string,
    type: string | null, 
    interlocutorId: string | null, 
    count: number | null, 
    cursor: string | null, 
    messagesCount: number | null, 
    onlyUnread: boolean | null = null,
    fields: string | null = null,
    hideEmpty: boolean | null = null
  ) => {
    const countParam = count ? `&count=${count}` : ''
    const typeParam = type ? `&type=${type}` : ''
    const messagesCountParam = messagesCount ? `&messages-count=${messagesCount}` : ''
    const cursorParam = cursor ? `&cursor=${cursor}` : ''
    const interlocutorParam = interlocutorId ? `&interlocutor-id=${interlocutorId}` : ''
    const onlyUnreadParam = onlyUnread !== null ? `&only-unread=${onlyUnread ? 1 : 0}` : ''
    const fieldsParam = fields ? `&fields=${fields}` : ''
    const hideEmptyParam = hideEmpty !== null ? `&hide-empty=${hideEmpty ? 1 : 0}` : ''
    const address = `users/${userId}/chats?${interlocutorParam}${typeParam}${countParam}${cursorParam}${messagesCountParam}${onlyUnreadParam}${fieldsParam}${hideEmptyParam}`
    return instance.get<GetChatsResponseType>(address)
  },
  getChat: (chatId: string, messagesCount: number) => {
    const messagesCountParam = messagesCount ? `&messages-count=${messagesCount}` : ''
    const address = `chats/${chatId}?${messagesCountParam}`
    return instance.get<GetChatResponseType>(address)
  },
  getChatActions: (chatId: string, count: number | null, types: string | null, cursor: number | null) => {
    const typesParam = types ? `&types=${types}` : ''
    const cursorParam = cursor ? `&cursor=${cursor}` : ''
    const countParam = count ? `&count=${count}` : ''
    const address = `chats/${chatId}/actions?${typesParam}${cursorParam}${countParam}`
    return instance.get<GetChatsActionsResponseType>(address)
  },
  createPairChat: (interlocutorId: string, firstMessage: string, clientId: string, messageClientId: string, placeId: string) => {
    let payload: any = {
      client_id: clientId,
      message_client_id: messageClientId,
      participants: [interlocutorId],
      type: 'pair_user_chat',
      first_message: firstMessage,
      place_id: placeId
    }
    if(firstMessage) {
      payload.first_message = firstMessage
    }
    return instance.post('chats', payload)
  },
  createMessage: (chatId: string, text: string, clientId: string, repliedId: string | undefined, chatWindowId: string) => {
    return instance.post<CreateMessageResponseType>(`chats/${chatId}/messages`, {text, client_id: clientId, replied_id: repliedId || null, place_id: chatWindowId})
  },
  updateChat: (chatId: string, property: string, value: any) => {
    return instance.patch<CreateMessageResponseType>(`chats/${chatId}`, {property, value})
  },
  deleteHistory: (chatId: string) => {
    return instance.delete(`chats/${chatId}/messages`)
  },
  getMessages: (chatId: string, count: number | null, cursor: string | null, order: string | null = 'DESC') => {
    const countParam = count ? `&count=${count}` : ''
    const cursorParam = cursor ? `&cursor=${cursor}` : ''
    return instance.get<GetMessagesResponseType>(`chats/${chatId}/messages?order=${order}${countParam}${cursorParam}`)
  },
  updateMessage: (messageId: string, property: string, value: any, chatWindowId: string) => {
    return instance.patch(`messages/${messageId}`, {property, value, place_id: chatWindowId})
  },
  deleteMessage: (chatId: string, messageId: string) => instance.delete(`chats/${chatId}/messages/${messageId}`),
  getMessagesHistories: (ids: string) => instance.get(`messages-histories?ids=${ids}`),
  getMessagesHistoryMessages: (historyId: string) => instance.get(`messages-histories/${historyId}/messages?count=10`),
  getMessage: (messageId: string) => instance.get<GetMessageResponseType>(`messages/${messageId}`),
  deleteMessageFromHistory: (historyId: string, messageId: string) => instance.delete(`messages-histories/${historyId}/messages/${messageId}`),
  typeMessage: (chatId: string) => instance.post(`typing-message`, {chat_id: chatId})
}