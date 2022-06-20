import { ulid } from "ulid"
import { ChatType, DayType, MessageType, UserType } from "../../types/chats_types"

export const playSound = function() {
  // console.log('play sound')
  const audio = new Audio('/mixkit-software-interface-start-2574.wav')
  audio.volume = 0.2
  audio.play()
}

export const createUser = (id: string, firstName: string, lastName: string, picture: string | null = null): UserType => {
  return {
    id: id,
    firstName: firstName,
    lastName: lastName,
    picture: picture
  }
}
  
export const createNewMessage = (
  id: string,
  clientId: string,
  chatId: string,
  text: string,
  replied: MessageType | null,
  creator: UserType,
  sendingError: boolean,
): MessageType => {
  return {
    id,
    clientId,
    chatId,
    text,
    replied,
    creator,
    createdAt: Date.now(),
    sendingError,
    readBy: [],
    createdInCurrentWindow: true,
    isEdited: false
  }
}
  
export const createNewPairChat = (
  id: string,
  clientId: string,
  startedBy: string | null,
  participants: Array<UserType>
): ChatType => {
  return {
    id,
    clientId,
    createdInCurrentWindow: true,
    messages: [],
    totalMessagesCount: 0,
    startedBy,
    lastMessage: null,
    prevMessageCursor: null,
    nextMessageCursor: null,
    type: 'pair_user_chat',
    // scrollPosition: undefined,
    lastReadMessageId: null,
    participants,
    unreadMessagesCount: 0,
    createdAt: Date.now(),
    creatingError: false
  }
}

export const getChatUnsentMessages = (chatId: string, chatClientId: string | null = null, cursor: string | null = null): Array<MessageType> => {
  let unsentMessages: Array<MessageType> = []
  if(localStorage['unsent-messages']) {
    unsentMessages = JSON.parse(localStorage['unsent-messages'])
  }
  unsentMessages = unsentMessages.filter((message: any) => {
    const afterCursor = cursor ? message.clientId > cursor : true
    return afterCursor && (
      (chatId === '-1' ? null : message.chatId === chatId)
      || message.chatId === chatClientId
    )
  })
  return unsentMessages
}

export const addUnsentMessageToStorage = (message: MessageType) => {
  // console.log(message)
  if(localStorage['unsent-messages']) {
    let unsentMessages = JSON.parse(localStorage['unsent-messages'])
    localStorage.setItem('unsent-messages', JSON.stringify([...unsentMessages, message]))
  } else {
    localStorage.setItem('unsent-messages', JSON.stringify([message]))
  }
}

export const removeUnsentMessageFromStorage = (messageClientId: string): void => {
  const unsentMessages = JSON.parse(localStorage['unsent-messages'])
  let filtered = unsentMessages.filter((m: MessageType) => m.clientId !== messageClientId)
  localStorage.setItem('unsent-messages', JSON.stringify(filtered))
}

export const removeUnsentMessagesFromStorage = (chatId: string): void => {
  const unsentMessages = JSON.parse(localStorage['unsent-messages'])
  let filtered = unsentMessages.filter((m: MessageType) => m.chatId !== chatId)
  localStorage.setItem('unsent-messages', JSON.stringify(filtered))
}

export const getUnsentMessageFromStorage = (messageClientId: string): MessageType | undefined => {
  const unsentMessages = JSON.parse(localStorage['unsent-messages'])
  return unsentMessages.find((m: MessageType) => m.clientId === messageClientId)
}

export const sortMessages = (messages: Array<MessageType>) => {
  const copy = [...messages]
  copy.sort((a, b) => {
    const aId = a.createdInCurrentWindow ? a.clientId : a.id
    const bId = b.createdInCurrentWindow ? b.clientId : b.id
    if(aId < bId) return 1
    if(aId > bId) return -1
    return 0
  })
  return copy
}

export const deleteDuplicates = (sendingMessages: Array<MessageType>, existingMessages: Array<MessageType>) => {
  let filteredCopy = [...sendingMessages].filter(sm => {
    let found = false
    for (let index = 0; index < existingMessages.length; index++) {
      const em = existingMessages[index]
      if(em.clientId && sm.clientId === em.clientId) {
        found = true
        break
      }
    }
    return !found
  })
  return filteredCopy
}

export const createUlidId = (): string => {
  return ulid().toLowerCase()
}

export const getMessageContainerFormType = (
  message: MessageType,
  prevMessage: MessageType | null,
  nextMessage: MessageType | null
): 'top' | 'bottom' | 'medium' | 'single' => { 
  let type: 'top' | 'bottom' | 'medium' | 'single' = 'top'
  let prevMessageAuthorId = prevMessage ? prevMessage.creator.id : null
  let nextMessageAuthorId = nextMessage ? nextMessage.creator.id : null

  if(prevMessage === null) type = 'top' 
  if(prevMessageAuthorId === message.creator.id) type = 'medium'
  if(!nextMessage || nextMessageAuthorId !== message.creator.id) type = 'bottom'
  if(
    (!nextMessage || nextMessageAuthorId !== message.creator.id)
    && (!prevMessage || prevMessageAuthorId !== message.creator.id)
  ) {
    type = 'single'
  }
  return type
}

export const getPairChatByParticipantsId = (chats: Array<ChatType>, participant1Id: string, participant2Id: string): ChatType | null => {
  const chat = chats.find(chat => {
    const participant1 = chat.participants[0]
    const participant2 = chat.participants[1]
    return (participant1.id === participant1Id && participant2.id === participant2Id)
      || (participant1.id === participant2Id && participant2.id === participant1Id)
  })
  return chat || null
}