import { PostCommentType } from '../types/types'
import { FEED, Place, PROFILE_POST, PROFILE_POSTS } from './profile_posts_reducer'
import { AppStateType } from './redux_store'

export const getPostComments = (state: AppStateType, postId: string, place: Place): PostCommentType[] => {
    if(place === PROFILE_POSTS) {
        let post = state.profilePosts.profilePosts.find(post => post.id === postId)
        return post ? post.comments : []
    } else if(place === PROFILE_POST) {
        let postInState = state.profilePosts.profilePost
        if(postInState && postInState.id === postId) {
            return postInState.comments
        }
    } else if(place === FEED) {
        let post = state.profilePosts.feed.find(post => post.id === postId)
        return post ? post.comments : []
    }
    return []
    
}