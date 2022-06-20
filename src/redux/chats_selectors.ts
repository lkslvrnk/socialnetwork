import { ChatType } from '../types/chats_types'
import { PostCommentType, ProfilePictureType, ProfileType, ReactionType } from '../types/types'
import { AppStateType } from './redux_store'

export const getPairChat = (user1Id: string, user2Id: string) => {
    return (state: AppStateType): ChatType | undefined => {
        let chat = state.chats.chats.find(chat => {
            const participants = chat.participants
            const participant1 = participants.find(p => p.id === user1Id)
            const participant2 = participants.find(p => p.id === user2Id)
            return chat.type === 'pair_user_chat' && !!participant1 && !!participant2
        })
        return chat
    }
}

export const getChatById = (chatId: string) => {
    return (state: AppStateType): ChatType | undefined => {
        return state.chats.chats.find(chat => chat.id === chatId)
    }
}
