export const CREATE_CHAT = 'create-chat'
export const CREATE_MESSAGE = 'create-message'
export const DELETE_MESSAGE = 'delete-message'
export const MESSAGE_DELETED_FOR_ALL = 'delete-message-for-all'
export const UPDATE_LAST_READ_MESSAGE_ID = 'read-message'
export const DELETE_HISTORY = 'delete-history'

export type MessageType = {
  id: string
  clientId: string
  chatId: string
  text: string
  replied: MessageType | null
  creator: UserType
  createdAt: number
  sendingError: boolean
  readBy: Array<string>
  createdInCurrentWindow: boolean
  isEdited: boolean
}

export type ChatPreviewType = {
  id: string
  interlocutors: Array<UserType>
  type: string
  lastMessage: MessageType | null
  unreadMessagesCount: number
  lastReadMessageId: string | null
}

export type ChatType = {
  id: string
  clientId: string
  createdInCurrentWindow: boolean
  participants: Array<UserType>
  messages: Array<MessageType>
  totalMessagesCount: number
  prevMessageCursor: null | string
  nextMessageCursor: null | string
  lastMessage: MessageType | null
  lastReadMessageId: string | null
  startedBy: string | null
  type: string
  unreadMessagesCount: number
  createdAt: number
  creatingError: boolean
  // lastMessageTimestamp: number | null
}

export type PartialChatType = {
  id: string
  clientId: string
  createdInCurrentWindow: boolean | undefined
  participants: Array<UserType> | undefined
  messages: Array<MessageType> | undefined
  totalMessagesCount: number | undefined
  prevMessageCursor: null | string | undefined
  nextMessageCursor: null | string | undefined
  lastMessage: MessageType | null | undefined
  lastReadMessageId: string | null | undefined
  startedBy: string | null | undefined
  type: string | undefined
  unreadMessagesCount: number | undefined
  createdAt: number | undefined
  creatingError: boolean | undefined
}

export type ActionType = {
  chatId: string
  chatClientId: string
  type: string
  createdAt: number
  initiatorId: string
  extraProps: any
  placeId: string | undefined
}

export type UserType = {
  id: string
  picture: string | null
  firstName: string
  lastName: string
}

export type DayType = {
  dayId: string,
  date: string,
  messages: Array<MessageType>,
  groups: [],
  timestamp: number
}

export type EventType = {
  action: ActionType
  placeId: string | undefined
}