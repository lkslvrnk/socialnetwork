import { PostCommentType, ProfilePictureType, ProfileType, ReactionType } from '../types/types'
import { AppStateType } from './redux_store'

export const getProfile = (state: AppStateType): ProfileType | null | undefined => {
    return state.profile.profile
}

export const getProfilePicture = (state: AppStateType): ProfilePictureType | null => {
    if(state.profile.profile) {
        return state.profile.profile.picture
    } else {
        return null
    }
}

export const getProfileId = (state: AppStateType): string | null => {
    const profile = state.profile.profile
    return profile ? profile.id : null
}

export const getLoadedPhotosAlbumId = (state: AppStateType): string | null => {
    return 'kek'
}

export const getCurrentUserPostReaction = (state: AppStateType, postId: string): ReactionType | null => {
    let post = state.profile.posts.filter(post => post.id === postId)[0]
    return post ? post.requesterReaction : null
}

export const getPostComments = (state: AppStateType, postId: string): PostCommentType[] => {
    let post = state.profile.posts.find(post => post.id === postId)
    return post ? post.comments : []
}