import { AppStateType, InferActionsTypes } from './redux_store';
import { ThunkAction } from 'redux-thunk';
import {
  ActionType, ChatPreviewType, ChatType, CREATE_CHAT, CREATE_MESSAGE,
  MessageType, PartialChatType, UPDATE_LAST_READ_MESSAGE_ID
} from '../types/chats_types';
import { chatsAPI } from '../api/chats_api';

const DELETE_MESSAGE = 'chats/DELETE-MESSAGE'
const SET_CHATS_PREVIEWS = 'chats/SET-CHATS-PREVIEWS'
const ADD_CHAT = 'chats/ADD-CHAT'
const ADD_CHATS = 'chats/ADD-CHATS'
const SET_CHAT_IS_LOADING = 'chats/SET-CHAT-IS-LOADING'
const ADD_MESSAGE = 'chats/ADD-MESSAGE'
const ADD_MESSAGES = 'chats/ADD-MESSAGES'
const ADD_CHAT_PREVIEW = 'chats/ADD-CHAT-PREVIEW'
const ADD_CHATS_PREVIEWS = 'chats/ADD-CHATS-PREVIEWS'
const SET_LAST_MESSAGE = 'chats/SET-LAST-MESSAGE'
const SET_SCROLL_POSITION = 'chats/SET-SCROLL-POSITION'
const SET_LAST_READ_MESSAGE_ID = 'chats/SET-LAST-READ-MESSAGE-ID'
// const SET_UNREAD_CHATS_COUNT = 'chats/SET-UNREAD-CHATS-COUNT'
const UPDATE_CHAT_PREVIEW = 'chats/UPDATE-CHAT-PREVIEW'
const SET_UNREAD_CHATS_IDS = 'chats/SET-UNREAD-CHATS-IDS'
const CLEAN = 'chats/CLEAN'
const DELETE_HISTORY = 'chats/DELETE-HISTORY'
const SET_LOADED_CHATS = 'chats/SET-LOADED-CHATS'
const SET_LOADED_CHAT = 'chats/SET-LOADED-CHAT'
const SET_IS_RESTORING_AFTER_RECONNECT = "chats/SET-IS-RESTORING-AFTER-RECONNECT"
const ADD_CREATING_CHAT_KEY = "chats/ADD-CREATING-CHAT-KEY"
const DELETE_CREATING_CHAT_KEY = "chats/DELETE-CREATING-CHAT-KEY"
const READ_CHAT_MESSAGE = "chats/READ-CHAT-MESSAGE"
const ADD_NEXT_MESSAGES = "chats/ADD-NEXT-MESSAGES"
const SET_CHAT_LAST_READ_MESSAGE_ID = "chats/SET-CHAT-LAST-READ-MESSAGE-ID"
const SET_PREVIEW_LAST_READ_MESSAGE_ID = 'chats/SET-PREVIEW-LAST-READ-MESSAGE-ID'
// const SET_PREVIEW_UNREAD_COUNT = "chats/SET-PREVIEW-UNREAD-COUNT"
const ADD_MESSAGE_TO_CHAT = "chats/ADD-MESSAGE-TO-CHAT"
const HANDLE_UPDATES = "chats/HANDLE-UPDATES"
const ADD_MESSAGE_TO_PREVIEW = "chats/ADD-MESSAGE-TO-PREVIEW"
const SET_MESSAGES = 'chats/SET-MESSAGES'
const UPDATE_MESSAGE = 'chats/UPDATE-MESSAGE'

let initialState = {
  chatsPreviews: null as null | Array<ChatPreviewType>, // Это чаты для составления списка чатов
  chats: [] as Array<ChatType>, // Это массив с чатами, которые загружены полноценно, то есть когда чат открывается, он загружается и добавляется в этот массив
  chatsListAreLoaded: false as boolean,
  previewsCursor: null as string | null,
  chatsAreLoaded: false as boolean,
  chatIsLoading: false as boolean,
  unreadChatsCount: 0 as number,
  unreadChatsIds: [] as Array<string>,
  isRestoringAfterReconnect: false as boolean,
  creatingChatsKeys: [] as Array<string>,
}

const chatsReducer = (state = initialState, action: ActionsType): InitialStateType => {
  switch (action.type) {
    case HANDLE_UPDATES: {
      /*
      Создаётся копия state, оригинальный state модифицирован не будет. Затем обрабатываются все события и действия, обрабатываются они в chatsReducer,
      все изменения, вызваные обработкой, происходят в stateCopy и не используется dispatch, поэтому перерисовок не будет, до обработки всех событий и действий,
      после их обработки будет возвращен state copy и тогда уже произойдёт реальное изменение state и произойдёт перерисовка.
      */
      let stateCopy = { ...state }
      const currentUserId = action.currentUserId
      action.updates.forEach(u => {
        if (u.type === CREATE_MESSAGE) {
          const message = u.extraProps.message
          const chat = u.extraProps.chat
          stateCopy = chatsReducer(
            stateCopy,
            actions.addMessageToChat(
              u.chatId, message, currentUserId === message.creator.id
            )
          )
          stateCopy = chatsReducer(
            stateCopy,
            actions.addMessageToPreview(chat, message, currentUserId)
          )
        } else if (u.type === CREATE_CHAT) {
          const chat = u.extraProps.chat
          const firstMessage = u.extraProps.firstMessage
          chat.message.push(firstMessage)
          stateCopy = chatsReducer(stateCopy, actions.addChat(chat))
          stateCopy = chatsReducer(
            stateCopy, actions.addPreview(chat, currentUserId)
          )
        }
        else if (u.type === 'delete-message'
          || u.type === 'delete-message-for-all'
        ) {
          /*
          Событие об удалении сообщения у себя приходит через вебсокет только к тому, кто удалил сообщение. Но эти actions(update) не приходят через вебсокет, они извлекаются из БД
           поэтому нужно сделать так чтобы такое действие извлекалось только для того, кто удалил сообщение */
          const messageId = u.extraProps.messageId
          const messageCreatorId = u.extraProps.messageCreatorId
          const lastMessage = u.extraProps.lastMessage
          stateCopy = chatsReducer(
            stateCopy,
            actions.deleteMessage(
              u.chatId, messageId, messageCreatorId, currentUserId, lastMessage
            )
          )
        }
        // else if(u.type === 'delete-message-for-all') {
        //   const messageId = u.extraProps.messageId
        //   const messageCreatorId = u.extraProps.messageCreatorId
        //   const lastMessage = u.extraProps.lastMessage
        //   stateCopy = chatsReducer(
        //     stateCopy,
        //     actions.deleteMessage(
        //       u.chatId, messageId, messageCreatorId, currentUserId, lastMessage
        //     )
        //   )
        // }
        else if (u.type === UPDATE_LAST_READ_MESSAGE_ID) {
          const chatId = u.chatId
          const messageId = u.extraProps.messageId
          const unreadMessagesCount = u.extraProps.unreadMessagesCount
          stateCopy = chatsReducer(
            stateCopy,
            actions.setChatLastReadMessageId(
              chatId, messageId, unreadMessagesCount,
              u.initiatorId, currentUserId
            )
          )
        } else if (u.type === 'delete-history') {
          stateCopy = chatsReducer(stateCopy, actions.deleteHistory(u.chatId))
        }
      })
      return stateCopy
    }
    case CLEAN: {
      return {
        chatsPreviews: null,
        chats: [],
        chatsListAreLoaded: false,
        previewsCursor: null,
        chatsAreLoaded: false,
        chatIsLoading: false,
        unreadChatsCount: 0,
        unreadChatsIds: [],
        isRestoringAfterReconnect: false,
        creatingChatsKeys: []
      }
    }
    case SET_CHAT_IS_LOADING: {
      return {
        ...state,
        chatIsLoading: action.isLoading
      }
    }
    case ADD_CREATING_CHAT_KEY: {
      return {
        ...state,
        creatingChatsKeys: [...state.creatingChatsKeys, action.key]
      }
    }
    case DELETE_CREATING_CHAT_KEY: {
      return {
        ...state,
        creatingChatsKeys: state.creatingChatsKeys.filter(cck => cck !== action.key)
      }
    }
    case SET_IS_RESTORING_AFTER_RECONNECT: {
      return {
        ...state,
        isRestoringAfterReconnect: action.isRestoringAfterReconnect
      }
    }
    case SET_LOADED_CHAT: {
      const chat = state.chats.find(c => c.id === action.chat.id)
      if (chat) {
        const indexOfChat = state.chats.indexOf(chat)
        const loadedChatsCopy = [...state.chats]
        loadedChatsCopy[indexOfChat] = action.chat
        return {
          ...state,
          chats: loadedChatsCopy
        }
      }
      return { ...state }
    }
    case SET_LOADED_CHATS: {
      return {
        ...state,
        chats: action.chats
      }
    }
    case SET_UNREAD_CHATS_IDS: {
      return {
        ...state,
        unreadChatsIds: action.ids
      }
    }
    // case SET_SCROLL_POSITION: {
    //   if(state.chats) {
    //     const chat = state.chats.find(chat => chat.id === action.chatId)

    //     if(!!chat) {
    //       const chatCopy = copyChat(chat)
    //       chatCopy.scrollPosition = action.scrollPosition
    //       const chatsCopy = [...state.chats]
    //       chatsCopy[chatsCopy.indexOf(chat)] = chatCopy
    //       return {
    //         ...state,
    //         chats: chatsCopy
    //       }
    //     }
    //   }
    //   return {...state}
    // }
    case SET_CHATS_PREVIEWS: {
      const previews: Array<ChatPreviewType> = []
      action.chats.forEach(c => {
        previews.push(createPreviewFromChat(c, action.currentUserId))
      })
      return {
        ...state,
        chatsPreviews: previews,
        chatsListAreLoaded: true,
        previewsCursor: action.cursor
      }
    }
    case ADD_MESSAGE: {
      let stateCopy = { ...state }

      const chat = state.chats.find(chat => chat.id === action.chatId)
      if (chat) {
        let message = chat.messages.find(m => m.id === action.message.id)
        if (!message) {
          let chatCopy = copyChat(chat)
          chatCopy.messages = [action.message, ...chatCopy.messages]
          chatCopy.lastMessage = action.message
          if (!action.isOwnMessage) {
            chatCopy.unreadMessagesCount++
            const messagesCopy: Array<MessageType> = []
            chatCopy.messages.forEach(m => {
              const messageCopy = copyMessage(m)
              if (!messageCopy.readBy.includes(action.message.creator.id)) {
                messageCopy.readBy = [
                  ...messageCopy.readBy, action.message.creator.id
                ]
                messagesCopy.push(messageCopy)
              } else {
                messagesCopy.push(m)
              }
            })
            chatCopy.messages = messagesCopy
          } else {
            chatCopy.lastReadMessageId = action.message.id
            chatCopy.unreadMessagesCount = 0
          }
          let chatsCopy = [...state.chats]
          chatsCopy[chatsCopy.indexOf(chat)] = chatCopy

          stateCopy.chats = chatsCopy
        }
      }

      if (state.chatsPreviews) {
        let preview = state.chatsPreviews.find(c => c.id === action.chatId)
        if (!!preview) {
          let previewsCopy = [...state.chatsPreviews]
          let previewCopy = copyPreview(preview)
          previewCopy.lastMessage = action.message
          if (!action.isOwnMessage) {
            previewCopy.unreadMessagesCount++
          }
          // else {
          //   preview.lastReadMessageId = action.message.id
          // }
          previewsCopy.splice(previewsCopy.indexOf(preview), 1)
          previewsCopy = [previewCopy, ...previewsCopy]
          stateCopy.chatsPreviews = previewsCopy
        }
        // else {
        //   let loadedChat = state.chats.find(c => c.id === action.chatId)
        //   if(!!loadedChat) {
        //     let chatsListCopy = [...state.chatsPreviews]
        //     let copy = copyChat(loadedChat)
        //     copy.messages = []
        //     copy.lastMessage = action.message
        //     if(!action.isOwnMessage) {
        //       copy.unreadMessagesCount++
        //     }
        //     chatsListCopy = [copy, ...state.chatsPreviews]
        //     stateCopy.chatsPreviews = chatsListCopy
        //   }
        // }
      }

      if (!action.isOwnMessage
        && !stateCopy.unreadChatsIds.includes(action.chatId)
      ) {
        stateCopy.unreadChatsIds = [...state.unreadChatsIds, action.chatId]
      }

      return stateCopy
    }
    case UPDATE_MESSAGE: {
      const chat = state.chats.find(chat => chat.id === action.chatId)
      if (chat) {
        const message = chat.messages.find(m => m.id === action.messageId)
        if (message) {
          let chatCopy = copyChat(chat)
          const messageCopy = copyMessage(message)
          messageCopy.text = action.text
          messageCopy.isEdited = true
          chatCopy.messages[chatCopy.messages.indexOf(message)] = messageCopy
          const chatsCopy = [...state.chats]
          chatsCopy[chatsCopy.indexOf(chat)] = chatCopy
          return { ...state, chats: chatsCopy }
        }
      }
      return { ...state }
    }
    case DELETE_MESSAGE: {
      let stateCopy = { ...state }

      let isChanged = false
      if (state.chatsPreviews) {
        const chatPreview = state.chatsPreviews.find(
          chat => chat.id === action.chatId
        )
        if (chatPreview) {
          let previewCopy = copyPreview(chatPreview)
          // Если lastChatMessage === null, то значит, что чат теперь пустой
          // и его можно удалить
          if (!action.lastChatMessage) {
            stateCopy.chatsPreviews = [...state.chatsPreviews].filter(
              c => c.id !== action.chatId
            )
          }
          else {
            const isOwnMessage = action.currentUserId === action.messageCreatorId
            const isUnread = action.messageId > (previewCopy.lastReadMessageId || '0')
            /*
              Если удаляемое сообщение - это последнее сообщение, то нужно
              установить другое последнее сообщение (предыдущее)
            */
            if (previewCopy.lastMessage
              && action.messageId === previewCopy.lastMessage.id
            ) {
              previewCopy.lastMessage = action.lastChatMessage
            }
            // Если чат опустился ниже курсора, то его нужно удалить
            let sortId = previewCopy.lastMessage
              ? previewCopy.lastMessage.id : previewCopy.id
            if (state.previewsCursor && sortId <= state.previewsCursor) {
              stateCopy.chatsPreviews = state.chatsPreviews.filter(
                c => c.id !== previewCopy.id
              )
            }
            else if (!isOwnMessage && isUnread) {
              // Если удаленное сообщение создано собеседником и не было
              // прочитано, нужно уменьшить количество непрочитанных сообщений
              const prevUnreadCount = previewCopy.unreadMessagesCount
              previewCopy.unreadMessagesCount--
              // Если удаленное сообщение было последним непрочитанным,
              // то уменьшаем количество непрочитанных чатов
              if (prevUnreadCount && previewCopy.unreadMessagesCount === 0
                && stateCopy.unreadChatsIds.includes(previewCopy.id)
              ) {
                stateCopy.unreadChatsIds = stateCopy.unreadChatsIds.filter(
                  cid => cid !== previewCopy.id
                )
              }
              let previewsCopy = [...state.chatsPreviews]
              previewsCopy[previewsCopy.indexOf(chatPreview)] = previewCopy
              stateCopy.chatsPreviews = previewsCopy
            }
          }
        }
        isChanged = true
      }

      const chat = state.chats.find(chat => chat.id === action.chatId)
      if (chat) {
        let chatCopy = copyChat(chat)
        chatCopy.messages = chatCopy.messages.filter(m => m.id !== action.messageId)
        const isOwnMessage = action.currentUserId === action.messageCreatorId
        const isUnread = action.messageId > (chatCopy.lastReadMessageId || '0')
        if (!isOwnMessage && isUnread) {
          chatCopy.unreadMessagesCount--
        }
        let chatsCopy = [...state.chats]
        chatsCopy[chatsCopy.indexOf(chat)] = chatCopy
        stateCopy.chats = chatsCopy
        isChanged = true
      }

      return isChanged ? stateCopy : state
    }
    case ADD_MESSAGE_TO_CHAT: {
      /*
      Добавление сообщения в чат обрабатываем отдельно, здесь сообщение не добавляется в превью и здесь чат не добавляется в список
      непрочитанных сообщений и не удаляется оттуда, эти действия происходят в другом месте. Здесь же происходят изменения только в чате.
      Это разделение нужно для того, чтобы при восстановлении чата изменения в чате не затрагивали превью и список ID непрочитанных чатов, потому что
      восстановления чата происходят иначе */
      const chat = state.chats.find(chat => chat.id === action.chatId)
      if (chat) {
        let message = chat.messages.find(m => m.id === action.message.id)
        if (!message) {
          let stateCopy = { ...state }
          let chatCopy = copyChat(chat)
          const message = action.message
          chatCopy.messages = [action.message, ...chatCopy.messages]
          // если это своё сообщение, оно становится последним прочитанным,
          // поэтому нужно сделать прочитанными все более ранние сообщение
          if (action.isOwnMessage) {
            chatCopy.lastReadMessageId = action.message.id
            const readMessages: Array<MessageType> = []
            chatCopy.messages.forEach(m => {
              const messageCopy = copyMessage(m)
              if (!messageCopy.readBy.includes(message.creator.id)) {
                // Если сообщение не прочитано текущим пользователем, то "читаем" его
                messageCopy.readBy = [
                  ...messageCopy.readBy, action.message.creator.id
                ]
                readMessages.push(messageCopy)
              } else {
                readMessages.push(m)
              }
            })
          } else {
            // Если сообщение создано собеседником, то увеличиваем
            // количество непрочитанных сообщений
            chatCopy.unreadMessagesCount++
          }
          let chatsCopy = [...state.chats]
          chatsCopy[chatsCopy.indexOf(chat)] = chatCopy
          stateCopy.chats = chatsCopy
          return stateCopy
        }
      }
      return state
    }
    case ADD_MESSAGE_TO_PREVIEW: {
      let modified = false
      const stateCopy = { ...state }
      const chat = action.chat
      if (state.chatsPreviews) {
        const preview = state.chatsPreviews.find(p => p.id === action.chat.id)
        const previewsCopy = [...state.chatsPreviews]
        if (preview) {
          const previewCopy = copyPreview(preview)
          const message = action.message
          previewCopy.lastMessage = message
          if (message.creator.id === action.currentUserId) {
            // Если сообщение создал текущий пользователь,
            // то это последнее прочитанное
            previewCopy.lastReadMessageId = message.id
            previewCopy.unreadMessagesCount = 0
          } else {
            // Если сообщение создано не текущим пользователем, то
            // возможно это будет одно непрочитанное сообщение
            previewCopy.unreadMessagesCount++
          }
          previewsCopy[previewsCopy.indexOf(preview)] = previewCopy
        }
        else {
          /*
          Если нет превью чата.
          Добавляется оно сразу с новым сообщением
          Но не всё так просто, чат в теле события будет отличаться в зависимости от того, кто создал сообщение, а точнее отличаться будет lastReadMessageId.
          Это значит, что нужно создать индивидуальное событие для каждого пользователя. Ну или брать чат не с события, а загрузить отдельно
          */
          const stateCopy = { ...state }
          const chat = action.chat
          chat.lastMessage = action.message
          const newPreview: ChatPreviewType = {
            id: chat.id,
            interlocutors: chat.participants
              ? chat.participants.filter(p => p.id !== action.currentUserId)
              : [],
            lastMessage: action.message,
            lastReadMessageId: chat.lastReadMessageId || null,
            type: chat.type || "pair_user_chat",
            unreadMessagesCount: chat.unreadMessagesCount !== undefined
              ? chat.unreadMessagesCount : 0
          }
          const previewsCopy = [...state.chatsPreviews]
          previewsCopy.unshift(newPreview)
          stateCopy.chatsPreviews = previewsCopy
        }
        stateCopy.chatsPreviews = previewsCopy
        modified = true
      }
      /*
      Отдельно от добавления сообщения в чат и превью, нужно ещё проверить является ли чат прочитанным для текущего пользователя. Это делается отдельно,
      потому что может быть, что превью не загружены и чат тоже. А это сделать нужно обязательно, потому что актуальная информация про это нужна постоянно
      */
      if ((chat.unreadMessagesCount || 0) > 0 && !state.unreadChatsIds.includes(action.chat.id)) {
        stateCopy.unreadChatsIds = [...stateCopy.unreadChatsIds, action.chat.id]
        modified = true
      } else if (chat.unreadMessagesCount === 0 && state.unreadChatsIds.includes(action.chat.id)) {
        stateCopy.unreadChatsIds = stateCopy.unreadChatsIds.filter(uci => uci !== action.chat.id)
        modified = true
      }
      return modified ? stateCopy : state
    }
    case DELETE_HISTORY: {
      let stateCopy = { ...state }

      let chat = state.chats.find(c => c.id === action.chatId)
      if (chat) {
        let chatCopy = copyChat(chat)
        chatCopy.messages = []
        chatCopy.prevMessageCursor = null
        chatCopy.lastReadMessageId = null
        chatCopy.lastMessage = null
        chatCopy.totalMessagesCount = 0
        chatCopy.unreadMessagesCount = 0
        let chatsCopy = [...state.chats]
        chatsCopy[chatsCopy.indexOf(chat)] = chatCopy
        stateCopy.chats = chatsCopy
      }

      if (state.chatsPreviews) {
        let chatPreview = state.chatsPreviews.find(c => c.id === action.chatId)
        if (chatPreview) {
          // const lastMessageId = chatPreview.lastMessage?.id
          let previewsCopy = [...state.chatsPreviews].filter(
            c => c.id !== action.chatId
          )
          stateCopy.chatsPreviews = previewsCopy
        }
      }
      return stateCopy
    }
    case ADD_MESSAGES: {
      let chat = state.chats.find(c => c.id === action.chatId)
      if (!!chat) {
        let chatCopy = copyChat(chat)
        chatCopy.messages = [...action.messages, ...chatCopy.messages]
        if (action.prevCursor !== undefined) {
          chatCopy.prevMessageCursor = action.prevCursor
        }
        if (action.nextCursor !== undefined) {
          chatCopy.nextMessageCursor = action.nextCursor
        }
        let chatsCopy = [...state.chats]
        chatsCopy[chatsCopy.indexOf(chat)] = chatCopy
        return {
          ...state,
          chats: chatsCopy
        }
      }
      return { ...state }
    }
    case SET_MESSAGES: {
      let chat = state.chats.find(c => c.id === action.chatId)
      if (chat) {
        let chatCopy = copyChat(chat)
        chatCopy.messages = action.messages
        if (action.prevCursor !== undefined) {
          chatCopy.prevMessageCursor = action.prevCursor
        }
        if (action.nextCursor !== undefined) {
          chatCopy.nextMessageCursor = action.nextCursor
        }

        let chatsCopy = [...state.chats]
        chatsCopy[chatsCopy.indexOf(chat)] = chatCopy
        return {
          ...state,
          chats: chatsCopy
        }
      }
      return { ...state }
    }
    case ADD_NEXT_MESSAGES: {
      let chat = state.chats.find(c => c.id === action.chatId)
      if (!!chat) {
        let chatCopy = copyChat(chat)
        chatCopy.messages = [...chatCopy.messages, ...action.messages.reverse()]
        if (action.prevCursor !== undefined) {
          chatCopy.prevMessageCursor = action.prevCursor
        }
        if (action.nextCursor !== undefined) {
          chatCopy.nextMessageCursor = action.nextCursor
        }
        let chatsCopy = [...state.chats]
        chatsCopy[chatsCopy.indexOf(chat)] = chatCopy
        return {
          ...state,
          chats: chatsCopy
        }
      }
      return { ...state }
    }
    case ADD_CHATS: {
      return {
        ...state,
        chats: state.chats.concat(action.chats),
        chatsAreLoaded: true
      }
    }
    case ADD_CHAT: {
      return {
        ...state,
        chats: [...state.chats, action.chat],
        chatsAreLoaded: true
      }
    }
    case ADD_CHAT_PREVIEW: {
      let modified = false
      const stateCopy = { ...state }
      if (state.chatsPreviews) {
        let preview = state.chatsPreviews.find(c => c.id === action.chat.id)
        if (!preview) {
          const newPreview = createPreviewFromChat(action.chat, action.currentUserId)
          stateCopy.chatsPreviews = [newPreview, ...state.chatsPreviews]
          modified = true
        }
      }
      const inUnread = state.unreadChatsIds.includes(action.chat.id)
      if (action.chat.unreadMessagesCount && !inUnread) {
        stateCopy.unreadChatsIds = [...stateCopy.unreadChatsIds, action.chat.id]
        modified = true
      }
      return modified ? stateCopy : { ...state }
    }
    case ADD_CHATS_PREVIEWS: {
      if (state.chatsPreviews) {
        const newPreviews: ChatPreviewType[] = []
        action.chats.forEach(c => {
          newPreviews.push(createPreviewFromChat(c, action.currentUserId))
        })
        return {
          ...state,
          chatsPreviews: [...state.chatsPreviews, ...newPreviews],
          previewsCursor: action.cursor
        }
      }
      return { ...state }
    }
    case SET_LAST_MESSAGE: {
      if (state.chatsPreviews) {
        let preview = state.chatsPreviews.find(c => c.id === action.chatId)
        if (!!preview) {
          let chatCopy = copyPreview(preview)
          chatCopy.lastMessage = action.message
          if (!action.isOwnMessage) {
            chatCopy.unreadMessagesCount = chatCopy.unreadMessagesCount + 1
          }
          let chatsListCopy = [...state.chatsPreviews]
          chatsListCopy[state.chatsPreviews.indexOf(preview)] = chatCopy
          return { ...state, chatsPreviews: chatsListCopy }
        }
      }
      return { ...state }
    }
    // case SET_PREVIEW_UNREAD_COUNT: {
    //   let preview = state.chatsPreviews?.find(c => c.id === action.chatId)
    //   if(state.chatsPreviews && preview) {
    //     let chatCopy = copyPreview(preview)
    //     chatCopy.unreadMessagesCount = action.count
    //     let chatsListCopy = [...state.chatsPreviews]
    //     chatsListCopy[state.chatsPreviews.indexOf(preview)] = chatCopy
    //     return {...state, chatsPreviews: chatsListCopy}
    //   }
    //   return {...state}
    // }
    case SET_CHAT_LAST_READ_MESSAGE_ID: {
      let stateCopy = { ...state }
      /*
        Если сообщение прочитал текущий пользователь, то нужно установить lastReadMessageId, добавить в readBy ID текущего пользователя,
        изменить количество непрочитанных сообщений, убрать ID чата из списка непрочитанных, если больше нет непрочитаннх сообщений
       */
      if (action.currentUserId === action.userId) {
        const chat = state.chats.find(chat => chat.id === action.chatId)

        if (chat && action.lastReadMessageId > (chat.lastReadMessageId || '0')) {
          // Устанавливаем новые данные только, если они актуальные
          let chatCopy = copyChat(chat)
          chatCopy.lastReadMessageId = action.lastReadMessageId
          let messagesCopy: Array<MessageType> = []
          chatCopy.messages.forEach(m => {
            if (!m.readBy.includes(action.userId) && m.id <= action.lastReadMessageId) {
              messagesCopy.push({ ...m, readBy: [...m.readBy, action.userId] })
            } else {
              messagesCopy.push(m)
            }
          })
          chatCopy.messages = messagesCopy
          const prevUnreadCount = chatCopy.unreadMessagesCount
          chatCopy.unreadMessagesCount = action.unreadCount
          if (prevUnreadCount > 0 && action.unreadCount === 0) {
            if (stateCopy.unreadChatsIds.includes(chatCopy.id)) {
              stateCopy.unreadChatsIds = stateCopy.unreadChatsIds.filter(
                cid => cid !== chatCopy.id
              )
            }
          }
          let chatsCopy = [...state.chats]
          chatsCopy[chatsCopy.indexOf(chat)] = chatCopy
          stateCopy.chats = chatsCopy
        }
      }
      else {
        /*
        Если сообщение прочитал собеседник. Новый lastReadMessageId устанавливать не нужно, потому что это значение собеседника, у него оно может отличаться
        здесь оно нужно только для того, чтобы понять какое сообщение прочитал собеседник, чтобы поставить две галочки */
        const chat = state.chats.find(chat => chat.id === action.chatId)
        if (chat) {
          let chatCopy = copyChat(chat)
          let messagesCopy: Array<MessageType> = []
          chatCopy.messages.forEach(m => {
            if (!m.readBy.includes(action.userId) && m.id <= action.lastReadMessageId) {
              messagesCopy.push({ ...m, readBy: [...m.readBy, action.userId] })
            } else {
              messagesCopy.push(m)
            }
          })
          chatCopy.messages = messagesCopy
          let chatsCopy = [...state.chats]
          chatsCopy[chatsCopy.indexOf(chat)] = chatCopy
          stateCopy.chats = chatsCopy
        }
      }
      return stateCopy
    }
    case SET_PREVIEW_LAST_READ_MESSAGE_ID: {
      let stateCopy = { ...state }

      if (action.currentUserId === action.userId && state.chatsPreviews) {
        const preview = state.chatsPreviews.find(chat => chat.id === action.chatId)

        if (preview && action.lastReadMessageId > (preview.lastReadMessageId || '0')) {
          // Устанавливаем новые данные только, если они актуальные
          let previewCopy = copyPreview(preview)
          previewCopy.lastReadMessageId = action.lastReadMessageId
          previewCopy.unreadMessagesCount = action.unreadCount
          if (preview.lastMessage && action.lastReadMessageId === preview.lastMessage.id) {
            const lastMessageCopy = { ...preview.lastMessage }
            lastMessageCopy.readBy.push(action.userId)
            previewCopy.lastMessage = lastMessageCopy
          }
          let previewsCopy = [...state.chatsPreviews]
          previewsCopy[previewsCopy.indexOf(preview)] = previewCopy
          stateCopy.chatsPreviews = previewsCopy
        }
      }
      else if (action.currentUserId !== action.userId && state.chatsPreviews) {
        const preview = state.chatsPreviews.find(chat => chat.id === action.chatId)
        if (preview) {
          let previewCopy = copyPreview(preview)
          if (preview.lastMessage
            && action.lastReadMessageId === preview.lastMessage.id
          ) {
            const lastMessageCopy = { ...preview.lastMessage }
            lastMessageCopy.readBy.push(action.userId)
            previewCopy.lastMessage = lastMessageCopy
          }
          let previewsCopy = [...state.chatsPreviews]
          previewsCopy[previewsCopy.indexOf(preview)] = previewCopy
          stateCopy.chatsPreviews = previewsCopy
        }
      }

      if (action.currentUserId === action.userId) {
        if (action.unreadCount && !stateCopy.unreadChatsIds.includes(action.chatId)) {
          stateCopy.unreadChatsIds = [...stateCopy.unreadChatsIds, action.chatId]
        } else if (!action.unreadCount
          && stateCopy.unreadChatsIds.includes(action.chatId)
        ) {
          stateCopy.unreadChatsIds = stateCopy.unreadChatsIds.filter(
            cid => cid !== action.chatId
          )
        }
      }

      return stateCopy
    }
    case READ_CHAT_MESSAGE: {
      let stateCopy = { ...state }
      const chat = state.chats.find(chat => chat.id === action.chatId)
      if (chat) {
        let chatCopy = copyChat(chat)
        const messagesCopy: Array<MessageType> = []
        chatCopy.messages.forEach(mc => {
          if (mc.readBy.includes(action.userId) || mc.id > action.messageId) {
            messagesCopy.push(mc)
          } else {
            messagesCopy.push({ ...mc, readBy: [...mc.readBy, action.userId] })
          }
        })
        chatCopy.messages = messagesCopy
        // if(action.unreadMessagesCount === null) {
        //   const unreadLoadedMessagesCount = chatCopy.messages.filter(m => {
        //     return m.creator.id !== action.currentUserId
        //         && !m.readBy.includes(action.currentUserId))
        //   })
        //   if(chatCopy.unreadMessagesCount === 0 && unreadLoadedMessagesCount) {
        //     chatCopy.unreadMessagesCount = unreadLoadedMessagesCount
        //   } else if(chatCopy.unreadMessagesCount > 0 && unreadLoadedMessagesCount === 0) {

        //   }
        // }
        // let chatsCopy = [...state.chats]
        // chatsCopy[chatsCopy.indexOf(chat)] = chatCopy
        // stateCopy.chats = chatsCopy
      }
      let chatPreview = state.chatsPreviews
        ? state.chatsPreviews.find(c => c.id === action.chatId) : null
      if (chatPreview && state.chatsPreviews) {
        const lastMessage = chatPreview.lastMessage
        if (lastMessage && action.messageId >= lastMessage.id
          && !lastMessage.readBy.includes(action.userId)
        ) {
          const previewCopy = copyPreview(chatPreview)
          const lastMessageCopy = copyMessage(lastMessage)
          lastMessageCopy.readBy = [...lastMessageCopy.readBy, action.userId]
          previewCopy.lastMessage = lastMessageCopy
          const previewsListCopy = [...state.chatsPreviews]
          previewsListCopy[state.chatsPreviews.indexOf(chatPreview)] = previewCopy
          stateCopy.chatsPreviews = previewsListCopy
        }
      }
      return stateCopy
    }
    default: return state
  }
}

export const actions = {
  handleUpdates: (updates: Array<ActionType>, currentUserId: string) => ({
    type: HANDLE_UPDATES,
    updates,
    currentUserId
  } as const),
  setChatsPreviews: (
    chats: Array<ChatType>, cursor: string | null, currentUserId: string
  ) => ({
    type: SET_CHATS_PREVIEWS,
    chats,
    cursor,
    currentUserId
  } as const),
  addCreatingChatKey: (key: string) => ({
    type: ADD_CREATING_CHAT_KEY,
    key
  } as const),
  deleteCreatingChatKey: (key: string) => ({
    type: DELETE_CREATING_CHAT_KEY,
    key
  } as const),
  setLoadedChat: (chat: ChatType) => ({
    type: SET_LOADED_CHAT,
    chat
  } as const),
  setLoadedChats: (chats: Array<ChatType>) => ({
    type: SET_LOADED_CHATS,
    chats
  } as const),
  setIsRestoringAfterReconnect: (isRestoringAfterReconnect: boolean) => ({
    type: SET_IS_RESTORING_AFTER_RECONNECT,
    isRestoringAfterReconnect
  } as const),
  addChat: (chat: ChatType) => ({
    type: ADD_CHAT,
    chat
  } as const),
  addChats: (chats: Array<ChatType>) => ({
    type: ADD_CHATS,
    chats
  } as const),
  setChatIsLoading: (isLoading: boolean) => ({
    type: SET_CHAT_IS_LOADING,
    isLoading
  } as const),
  addMessage: (chatId: string, message: MessageType, isOwnMessage: boolean) => ({
    type: ADD_MESSAGE,
    chatId,
    message,
    isOwnMessage
  } as const),
  addMessageToPreview: (
    chat: PartialChatType, message: MessageType, currentUserId: string
  ) => ({
    type: ADD_MESSAGE_TO_PREVIEW,
    chat,
    message,
    currentUserId
  } as const),
  addMessageToChat: (chatId: string, message: MessageType, isOwnMessage: boolean) => ({
    type: ADD_MESSAGE_TO_CHAT,
    chatId,
    message,
    isOwnMessage
  } as const),
  addPreview: (chat: ChatType, currentUserId: string) => ({
    type: ADD_CHAT_PREVIEW,
    chat,
    currentUserId
  } as const),
  addChatsToList: (
    chats: Array<ChatType>, cursor: string | null, currentUserId: string
  ) => ({
    type: ADD_CHATS_PREVIEWS,
    chats,
    cursor,
    currentUserId
  } as const),
  setLastMessage: (chatId: string, message: MessageType, isOwnMessage: boolean) => ({
    type: SET_LAST_MESSAGE,
    chatId,
    message,
    isOwnMessage
  } as const),
  setScrollPosition: (chatId: string, scrollPosition: number) => ({
    type: SET_SCROLL_POSITION,
    chatId,
    scrollPosition
  } as const),
  setLastReadMessageId: (
    chatId: string, lastReadMessageId: string, unreadCount: number,
    userId: string, currentUserId: string
  ) => ({
    type: SET_LAST_READ_MESSAGE_ID,
    chatId,
    lastReadMessageId,
    unreadCount,
    userId,
    currentUserId
  } as const),
  addMessages: (
    chatId: string, messages: Array<MessageType>,
    prevCursor: string | null | undefined,
    nextCursor: string | null | undefined
  ) => ({
    type: ADD_MESSAGES,
    chatId,
    messages,
    prevCursor,
    nextCursor
  } as const),
  setMessages: (
    chatId: string, messages: Array<MessageType>,
    prevCursor: string | null | undefined,
    nextCursor: string | null | undefined
  ) => ({
    type: SET_MESSAGES,
    chatId,
    messages,
    prevCursor,
    nextCursor
  } as const),
  addNextMessages: (
    chatId: string, messages: Array<MessageType>,
    prevCursor: string | null | undefined,
    nextCursor: string | null | undefined
  ) => ({
    type: ADD_NEXT_MESSAGES,
    chatId,
    messages,
    prevCursor,
    nextCursor
  } as const),
  deleteMessage: (
    chatId: string, messageId: string, messageCreatorId: string,
    currentUserId: string, lastChatMessage: MessageType | null,
    deleteFromPreview: boolean = true
  ) => ({
    type: DELETE_MESSAGE,
    chatId,
    messageId,
    messageCreatorId,
    currentUserId,
    lastChatMessage,
    deleteFromPreview
  } as const),
  updateMessage: (
    chatId: string, messageId: string, text: string
  ) => ({ type: UPDATE_MESSAGE, chatId, messageId, text } as const),
  setUnreadChatsIds: (ids: Array<string>) => ({
    type: SET_UNREAD_CHATS_IDS,
    ids
  } as const),
  setChatLastReadMessageId: (
    chatId: string, lastReadMessageId: string, unreadCount: number,
    userId: string, currentUserId: string
  ) => ({
    type: SET_CHAT_LAST_READ_MESSAGE_ID,
    chatId,
    lastReadMessageId,
    unreadCount,
    userId,
    currentUserId
  } as const),
  setPreviewLastReadMessageId: (
    chatId: string, lastReadMessageId: string,
    unreadCount: number, userId: string, currentUserId: string
  ) => ({
    type: SET_PREVIEW_LAST_READ_MESSAGE_ID,
    chatId,
    lastReadMessageId,
    unreadCount,
    userId,
    currentUserId
  } as const),
  updateChatInList: (chat: ChatType) => ({
    type: UPDATE_CHAT_PREVIEW,
    chat
  } as const),
  clean: () => ({
    type: CLEAN
  } as const),
  deleteHistory: (chatId: string) => ({
    type: DELETE_HISTORY,
    chatId
  } as const),
  readChatMessage: (chatId: string, messageId: string, userId: string) => ({
    type: READ_CHAT_MESSAGE,
    chatId,
    messageId,
    userId
  } as const)
}

export const loadUnreadChats = (): ThunkType => {
  return async (dispatch, getState) => {
    try {
      const userId = getState().auth.id
      if (userId) {
        const response = await chatsAPI.getChatsOfUser(
          userId, 'pair_user_chat', null, 1000000, null, 0, true, 'id'
        )
        let ids: Array<string> = []
        response.data.items.forEach(c => {
          ids.push(c.id)
        })
        dispatch(actions.setUnreadChatsIds(ids))
      }
    } catch (e) {

    } finally {
      // dispatch(actions.setChatIsLoading(false))
    }
  }
}

export const loadChatByUsersIds = (
  user1Id: string, user2Id: string, count: number, cursor: string | null
): ThunkType => {
  return async (dispatch) => {
    // dispatch(actions.setChatIsLoading(true))
    try {
      const response = await chatsAPI.getChatsOfUser(
        user1Id, 'pair_user_chat', user2Id, count, cursor, 0
      )
      if (response.data.items.length > 0) {
        let chat = response.data.items[0]
        dispatch(actions.addChat(chat))
      }
    } catch (e) {

    } finally {
      // dispatch(actions.setChatIsLoading(false))
    }
  }
}

export const loadUserChats = (
  currentUserId: string, count: number, cursor: string | null,
  hideEmpty: boolean | null = null
): ThunkType => {
  return async (dispatch) => {
    try {
      const response = await chatsAPI.getChatsOfUser(
        currentUserId, 'pair_user_chat', null,
        count, cursor, 0, null, null, hideEmpty
      )
      dispatch(actions.setChatsPreviews(
        response.data.items, response.data.cursor, currentUserId
      ))
    } catch (e) {

    }
  }
}

export const loadMorePreviews = (
  user1Id: string, count: number, cursor: string | null
): ThunkType => {
  return async (dispatch) => {
    try {
      const response = await chatsAPI.getChatsOfUser(
        user1Id, 'pair_user_chat', null, count, cursor, 0
      )
      dispatch(actions.addChatsToList(
        response.data.items, response.data.cursor, user1Id
      ))
    } catch (e) {

    }
  }
}

export const deleteHistory = (chatId: string): ThunkType => {
  return async (dispatch) => {
    try {
      await chatsAPI.deleteHistory(chatId)
      dispatch(actions.deleteHistory(chatId))
    } catch (e) {

    }
  }
}

export const loadMoreMessages = (
  chatId: string, count: number, cursor: string, order: string
): ThunkType => {
  return async (dispatch) => {
    try {
      const response = await chatsAPI.getMessages(chatId, count, cursor, order)
      if (order === 'DESC') {
        dispatch(actions.addMessages(
          chatId, response.data.items, response.data.prevCursor,
          response.data.nextCursor
        ))
      } else {
        dispatch(actions.addNextMessages(
          chatId, response.data.items, response.data.prevCursor,
          response.data.nextCursor
        ))
      }
    } catch (e) {

    }
  }
}

export const loadPrevMessages = (
  chatId: string, count: number, cursor: string
): ThunkType => {
  return async (dispatch) => {
    try {
      const response = await chatsAPI.getMessages(chatId, count, cursor, 'DESC')
      await dispatch(actions.addMessages(
        chatId, response.data.items, undefined, response.data.nextCursor
      ))
    } catch (e) {

    }
  }
}

export const loadNextMessages = (
  chatId: string, count: number, cursor: string
): ThunkType => {
  return async (dispatch) => {
    try {
      const response = await chatsAPI.getMessages(chatId, count, cursor, 'ASC')
      await dispatch(actions.addNextMessages(
        chatId, response.data.items, response.data.nextCursor, undefined
      ))
    } catch (e) {

    }
  }
}

export const deleteMessage = (
  chatId: string, messageId: string, currentUserId: string
): ThunkType => {
  return async (dispatch) => {
    try {
      chatsAPI.deleteMessage(chatId, messageId)
      // await dispatch(actions.deleteMessage(chatId, messageId, currentUserId))
    } catch (e) {

    }
  }
}

export const clean = (): ThunkType => {
  return async (dispatch) => {
    dispatch(actions.clean())
  }
}

export const copyChat = (chat: ChatType): ChatType => {
  return { ...chat, messages: [...chat.messages] }
}

export const createPreviewFromChat = (
  chat: ChatType, currentUserId: string
): ChatPreviewType => {
  return {
    id: chat.id,
    interlocutors: chat.participants.filter(p => p.id !== currentUserId),
    lastMessage: chat.lastMessage,
    type: chat.type,
    unreadMessagesCount: chat.unreadMessagesCount,
    lastReadMessageId: chat.lastReadMessageId
  }
}

export const copyPreview = (preview: ChatPreviewType): ChatPreviewType => {
  return { ...preview, interlocutors: [...preview.interlocutors] }
}

export const copyMessage = (message: MessageType): MessageType => {

  let copy: MessageType = {
    ...message
  }
  return copy
}

type InitialStateType = typeof initialState
type ActionsType = InferActionsTypes<typeof actions>
type ThunkType = ThunkAction<void, AppStateType, unknown, ActionsType>

export default chatsReducer


