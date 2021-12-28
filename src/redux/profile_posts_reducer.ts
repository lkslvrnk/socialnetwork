import { ThunkAction } from "redux-thunk"
import { profileAPI } from "../api/profile_api"
import HttpStatusCode from "../api/HttpStatusCode"
import { AppStateType, InferActionsTypes } from "./redux_store"
import { ProfilePostType, PostType, PostCommentType, ReactionType, ReactionsCountItem, PhotoType, ConnectionType } from "../types/types"
import { feedAPI } from "../api/feed_api"
import { AxiosError } from "axios"
import { photosAPI } from "../api/photos_api"

const ADD_POST = 'profile-posts/ADD-POST'
const ADD_COMMENT = 'profile-posts/ADD-COMMENT'
const REMOVE_POST = 'profile-posts/REMOVE-POST';
const SET_POSTS = 'profile-posts/SET-POSTS'
const ADD_POSTS = 'profile-posts/ADD-POSTS'
const SET_COMMENTS = 'profile-posts/SET_COMMENTS'
const SET_REPLIES = 'profile-posts/SET_REPLIES'
const CLEAR_POST_COMMENTS = 'profile-posts/CLEAR_POST_COMMENTS'
const SET_POST_IS_DELETED = 'profile-posts/SET-POST-IS-DELETED'
const REMOVE_NEW_POST_PHOTO = 'profile-posts/REMOVE-NEW-POST-PHOTO'
const SET_NEW_POST_PHOTO = 'profile-posts/SET-NEW-POST-PHOTO'
const CLEAN_NEW_POST_PHOTOS = 'profile-posts/CLEAN-NEW-POST-PHOTOS'
const PUT_POST = 'profile-posts/EDIT-POST'
const PATCH_POST = 'profile-posts/PATCH-POST'
const EDIT_POST_COMMENT = 'profile-posts/EDIT-POST-COMMENT'
const ADD_CURRENT_USER_COMMENT_REACTION = 'profile-posts/ADD-CURRENT-USER-COMMENT-REACTION'
const EDIT_COMMENT_REACTION = 'profile-posts/EDIT-COMMENT-REACTION'
const DELETE_COMMENT_REACTION = 'profile-posts/DELETE-COMMENT-REACTION'
const SET_COMMENT_REACTIONS = 'profile-posts/SET-COMMENT-REACTIONS'
const SET_CONNECTION = 'profile-posts/SET-CONNECTION'
const EDIT_REACTION = 'profile-posts/EDIT-REACTION'
const DELETE_REACTION = 'profile-posts/DELETE-REACTION'
const ADD_CURRENT_USER_REACTION = 'profile-posts/ADD-CURRENT-USER-REACTION'
const SET_POST_REACTIONS = 'profile-posts/SET-POST-REACTIONS'
const ADD_NEW_POST_ERROR = 'profile-posts/ADD-NEW-POST-ERROR'
const SET_COMMENT_IS_DELETED = 'profile-posts/SET-COMMENT-IS-DELETED'
const SET_OWNER_ID_AND_POSTS_COUNT = 'profile-posts/SET-OWNER-ID'
const CLEAN = 'CLEAN'
const INITIALIZE_FEED = 'INITIALIZE-FEED'

let initialState = {
  ownerId: null as string | null,
  allCount: null as number | null,
  posts: [] as Array<ProfilePostType>,
  cursor: null as string | null,
  areLoaded: false as boolean,
  isFeed: false as boolean
}

const profilePostsReducer = (state: InitialStateType = initialState, action: any): InitialStateType => {
  switch (action.type) {
    case INITIALIZE_FEED:{
      console.log('INITIALIZE_FEED')
      return {
        ...state,
        isFeed: true
      }
    }
    case CLEAN: {
      console.log('CLEAN')
      return {
        ownerId: null,
        allCount: null,
        posts: [],
        cursor: null,
        areLoaded: false,
        isFeed: false
      }
    }
    case SET_OWNER_ID_AND_POSTS_COUNT: {
      return {
        ...state,
        ownerId: action.id,
        allCount: action.count,
        areLoaded: action.count === 0
      }
    }
    case PUT_POST: {
      let post = state.posts.find(post => post.id === action.postId)
      if(post) {
        let index = state.posts.indexOf(post)
        state.posts[index] = action.post
      }
      return {
        ...state,
        posts: [...state.posts]
      }
    }
    case PATCH_POST: {
      let post = state.posts.find(post => post.id === action.postId)
      if(post) {
        if(action.property === 'comments_are_disabled') {
          post.commentingIsDisabled = action.value
        } else if(action.property === 'is_public') {
          post.isPublic = action.value
        }

        return {
          ...state,
          posts: [...state.posts]
        }
      }
      return state
    }
    case SET_POST_IS_DELETED: {
      let post = state.posts.find(post => post.id === action.postId)
      if(post) {
        post.isDeleted = action.isDeleted
      }
      return {
        ...state,
        posts: [...state.posts]
      }
    }
    case SET_COMMENT_IS_DELETED: {
      let post = state.posts.find(post => post.id === action.postId)
      if(!post) {
        return state
      }
      if(action.rootId) {
        let root = post.comments ? post.comments.find(comment => comment.id === action.rootId) : null
        if(root) {
          let reply = root.replies.find(reply => reply.id === action.commentId)
          if(reply) {
            reply.deleted = action.isDeleted
          }
        }
      } else {
        let comment = post.comments.find(comment => comment.id === action.commentId)
        if(comment) {
          comment.deleted = action.isDeleted
        }
      }
      return {
        ...state,
        posts: [...state.posts]
      }
    }
    case SET_POSTS: {
      let post = action.posts[0]
      if(!action.isFeed && !state.isFeed && state.ownerId && !!post && state.ownerId === post.creator.id) {
        return { ...state, areLoaded: true, posts: action.posts, cursor: action.cursor, allCount: action.count }
      }
      else if(action.isFeed && state.isFeed) {
        return { ...state, areLoaded: true, posts: action.posts, cursor: action.cursor }
      }
      return state
    }
    case ADD_POSTS: {
      let post = action.posts[0]

      if((state.ownerId && state.ownerId === post.creator.id) || state.isFeed) {
        return { ...state, areLoaded: true, posts: state.posts.concat(action.posts), cursor: action.cursor }
      }
      return state
    }
    case SET_COMMENTS: {
      let post = state.posts.filter(post => post.id === action.postId)[0]
      if(post.comments) {
        post.comments = post.comments.concat(action.comments)
      } else {
        post.comments = action.comments
      }
      post.commentsCount = action.allCommentsCount
      return {
        ...state,
        posts: [...state.posts]
      }
    }
    case ADD_COMMENT: {
      let post = state.posts.filter(post => post.id === action.postId)[0]
      if(!post.comments) {
        post.comments = []
      }
      let root = null
      if(action.rootId) {
        root = post.comments.filter(comment => comment.id === action.rootId)[0]
        root.replies = [...[action.comment].concat(root.replies)]
        root.repliesCount ++
        post.comments = [...post.comments]
        if(!post.newComments) {
          post.newComments = new Array<PostCommentType>()
        }
        post.newComments = post.newComments.concat(action.comment)
      }
      else {
        post.comments = [action.comment].concat(post.comments)
        post.commentsCount++
      }

      return {
        ...state,
        posts: [...state.posts]
      }
    }
    case ADD_POST: {
      if(state.ownerId && state.ownerId === action.post.creator.id) {
        return {
          ...state,
          allCount: state.allCount ? state.allCount + 1 : null,
          posts: [action.post, ...state.posts]
        }
      }
      else if(state.isFeed) {
        return {
          ...state,
          posts: [action.post, ...state.posts],
        }
      }
      return state
    }
    case SET_REPLIES: {
      let post = state.posts.filter(post => post.id === action.postId)[0]
      if(post.comments) {
        let comment = post.comments.filter(comment => comment.id === action.commentId)[0]
        if(comment) {
          comment.replies = comment.replies.concat(action.replies)
          comment.repliesCount = action.allRepliesCount
          post.comments = [...post.comments]
        }
      }
      return {
        ...state,
        posts: [...state.posts]
      }
    }
    case SET_POST_REACTIONS: {
      let post = state.posts.find(post => post.id === action.postId)
      if(post) {
        if(action.offsetId) {
          post.reactions = post.reactions.concat(action.reactions)
        } else {
          post.reactions = action.reactions
        }
        post.reactionsCount = action.reactionsCount
      }

      return {
        ...state,
        posts: [...state.posts]
      }
    }
    case SET_COMMENT_REACTIONS: {
      return {
        ...state
      }
    }
    case CLEAR_POST_COMMENTS: {
      let dpost = state.posts.filter(post => post.id === action.postId)[0]
      dpost.comments = []
      return {
        ...state,
        posts: [...state.posts]
      }
    }
    case EDIT_REACTION: {
      let post = state.posts.filter(post => post.id === action.postId)[0]
      let reaction = post.requesterReaction
      if(reaction) {
        let updatedReaction: ReactionType = {
          creator: reaction.creator,
          id: reaction.id,
          timestamp: reaction.timestamp,
          type: action.reactionType
        }
        let prevReactionType = post.requesterReaction?.type
        post.requesterReaction = updatedReaction

        let newReactionCountInfo = post.reactionsCount.find(reactionsCountItem => reactionsCountItem.type === post.requesterReaction?.type)
        let prevReactionCountInfo = post.reactionsCount.find(reactionsCountItem => reactionsCountItem.type === prevReactionType)

        if(newReactionCountInfo) {
          newReactionCountInfo.count++
        }
        else {
          post.reactionsCount.push({type: action.reactionType, count: 1})
        }
        if(prevReactionCountInfo) {
          prevReactionCountInfo.count--
        }
      }
      return state
    }
    case DELETE_REACTION: {
      let post = state.posts.filter(post => post.id === action.postId)[0]
      if(post) {
        let reactionType = post.requesterReaction?.type
        post.requesterReaction = null
        let currentReactionCountInfo = post.reactionsCount.find(reactionsCountItem => reactionsCountItem.type === reactionType)

        if(currentReactionCountInfo) {
          currentReactionCountInfo.count--
        }
        return {
          ...state,
          posts: [...state.posts]
        }
      }
      return state
    }
    case ADD_CURRENT_USER_REACTION: {
      let post = state.posts.filter(post => post.id === action.postId)[0]
      post.requesterReaction = action.reaction

      let currentReactionCountInfo = post.reactionsCount.find(reactionsCountItem => {
        return reactionsCountItem.type === action.reaction.type
      })
      if(currentReactionCountInfo) {
        currentReactionCountInfo.count++ 
      }
      else {
        post.reactionsCount.push({ type: action.reaction.type, count: 1})
      }

      return {
        ...state,
        posts: [...state.posts]
      }
    }
    case EDIT_POST_COMMENT: {
      let post = state.posts.find(post => post.id === action.postId)
      if(post) {
        if(action.rootId) {
          let root = post.comments.find(comment => action.rootId === comment.id)
          if(root) {
            let reply = root.replies.find(reply => action.commentId === reply.id)
            if(reply) {
              const index = root.replies.indexOf(reply)
              root.replies[index] = action.comment
              root.replies = [...root.replies]
              const indexOfRoot = post.comments.indexOf(root)
              post.comments[indexOfRoot] = {...root}
              post.comments = [...post.comments]
            }
          }
        } 
        else {
          let comment = post.comments.find(comment => action.commentId === comment.id)
          if(comment) {
            comment.text = action.comment.text
            comment.attachment = action.comment.attachment
          }
        }
      }
      return {
        ...state,
        posts: [...state.posts]
      }
    }
    case ADD_CURRENT_USER_COMMENT_REACTION: {

      let post = state.posts.find(post => post.id === action.postId)
      if(post) {
        if(action.rootId) {
          let root = post.comments.find(comment => action.rootId === comment.id)
          if(root) {
            let reply = root.replies.find(reply => action.commentId === reply.id)
            if(reply) {
              reply.requesterReaction = action.reaction
              let currentReactionCountInfo = reply.reactionsCount.find(reactionsCountItem => reactionsCountItem.type === action.reaction.type)
              if(currentReactionCountInfo) {
                currentReactionCountInfo.count++ 
              }
              else {
                reply.reactionsCount.push({ type: action.reaction.type, count: 1})
              }
            }
            let commentIndexInPostComments = post.comments.indexOf(root)
            post.comments[commentIndexInPostComments] = {...root}
          }
        }
        else {
          let comment = post.comments.find(comment => action.commentId === comment.id)
          if(comment) {
            comment.requesterReaction = action.reaction

            let currentReactionCountInfo = comment.reactionsCount.find(reactionsCountItem => reactionsCountItem.type === action.reaction.type)
            if(currentReactionCountInfo) {
              currentReactionCountInfo.count++ 
            }
            else {
              comment.reactionsCount.push({ type: action.reaction.type, count: 1})
            }
          }
        }
        post.comments = [...post.comments]
      }
      return {
        ...state,
      }
    }
    case EDIT_COMMENT_REACTION: {
      let post = state.posts.find(post => post.id === action.postId)
      if(post) {
        if(action.rootId) {
          let root = post.comments.find(comment => action.rootId === comment.id)
          if(root) {
            let reply = root.replies.find(reply => action.commentId === reply.id)
            if(reply) {
              
              let reaction = reply.requesterReaction
              let prevType: number
  
              if(reaction) {
                prevType = reaction.type
                reaction.type = action.reactionType
                reply.requesterReaction = {...reaction}
              }
              let newReactionCountInfo = reply.reactionsCount.find(reactionsCountItem => reactionsCountItem.type === action.reactionType)
              let prevReactionCountInfo = reply.reactionsCount.find(reactionsCountItem => reactionsCountItem.type === prevType)

              if(newReactionCountInfo) {
                newReactionCountInfo.count++
              }
              else {
                reply.reactionsCount.push({type: action.reactionType, count: 1})
              }
              if(prevReactionCountInfo) {
                prevReactionCountInfo.count--
              }
            }
            let rootIndexInPostComments = post.comments.indexOf(root)
            post.comments[rootIndexInPostComments] = {...root}
          }
        }
        else {
          let comment = post.comments.find(comment => action.commentId === comment.id)
          if(comment) {
            let reaction = comment.requesterReaction
            let prevType: number

            if(reaction) {
              prevType = reaction.type
              reaction.type = action.reactionType
              comment.requesterReaction = {...reaction}
            }
            let newReactionCountInfo = comment.reactionsCount.find(reactionsCountItem => reactionsCountItem.type === action.reactionType)
            let prevReactionCountInfo = comment.reactionsCount.find(reactionsCountItem => reactionsCountItem.type === prevType)

            if(newReactionCountInfo) {
              newReactionCountInfo.count++
            }
            else {
              comment.reactionsCount.push({type: action.reactionType, count: 1})
            }

            if(prevReactionCountInfo) {
              prevReactionCountInfo.count--
            }
          }
        }
        post.comments = [...post.comments]
      }
      return {...state}
    }
    case DELETE_COMMENT_REACTION: {
      let post = state.posts.find(post => post.id === action.postId)
      if(post) {
        if(action.rootId) {
          let root = post.comments.find(comment => action.rootId === comment.id)
          if(root) {
            let reply = root.replies.find(reply => action.commentId === reply.id)
            if(reply) {
              let requesterReactionType = reply.requesterReaction ? reply.requesterReaction.type : null
              reply.requesterReaction = null
              let currentReactionCountInfo = reply.reactionsCount.find(reactionsCountItem => reactionsCountItem.type === requesterReactionType)

              if(currentReactionCountInfo) {
                currentReactionCountInfo.count--
              }
            }
            let rootIndexInPostComments = post.comments.indexOf(root)
            post.comments[rootIndexInPostComments] = {...root}
          }
        }
        else {
          let comment = post.comments.find(comment => action.commentId === comment.id)
          if(comment) {
            let requesterReactionType = comment.requesterReaction ? comment.requesterReaction.type : null
            comment.requesterReaction = null
            let currentReactionCountInfo = comment.reactionsCount.find(reactionsCountItem => reactionsCountItem.type === requesterReactionType)
            if(currentReactionCountInfo) {
              currentReactionCountInfo.count--
            }
          }
        }
        post.comments = [...post.comments]
      }

      return {
        ...state
      }
    }
    default:
      return state;
  }
}

export const actions = {
  setPosts: (posts: Array<PostType>, cursor: string | null, count: number | null, isFeed: boolean) => ({ type: SET_POSTS, posts, cursor, count, isFeed } as const),
  addPosts: (posts: Array<PostType>, cursor: string | null) => ({ type: ADD_POSTS, posts: posts, cursor: cursor } as const),
  setNewPostPhoto: (photo: PhotoType) => ({ type: SET_NEW_POST_PHOTO, photo: photo } as const),
  removePost: (postId: string) => ({ type: REMOVE_POST, postId: postId } as const),
  setPostIsDeleted: (postId: string, isDeleted: boolean) => ({ type: SET_POST_IS_DELETED, postId: postId, isDeleted: isDeleted } as const),
  setCommentIsDeleted: (commentId: string, isDeleted: boolean, postId: string, rootId: string | null) => (
    { type: SET_COMMENT_IS_DELETED, commentId, isDeleted, postId, rootId } as const
  ),
  setComments: (comments: Array<PostCommentType>, allCommentsCount: number, postId: string) => ({ type: SET_COMMENTS, postId: postId, comments: comments, allCommentsCount: allCommentsCount} as const),
  setReplies: (replies: Array<PostCommentType>, allRepliesCount: number, postId: string, commentId: string) => (
    { type: SET_REPLIES, postId: postId, commentId: commentId, replies: replies, allRepliesCount: allRepliesCount} as const
  ),
  setPostReactions: (postId: string, reactions: Array<ReactionType>, reactionsCount: ReactionsCountItem[], offsetId: string | null) => (
    { type: SET_POST_REACTIONS, postId, reactions, reactionsCount, offsetId} as const
  ),
  removeNewPostPhoto: (src: string) => ({ type: REMOVE_NEW_POST_PHOTO, src: src } as const),
  cleanNewPostPhotos: () => ({ type: CLEAN_NEW_POST_PHOTOS } as const),
  clearPostComments: (postId: string) => ({ type: CLEAR_POST_COMMENTS, postId: postId} as const),
  addPost: (post: PostType) => (
    {type: ADD_POST, post} as const
  ),
  addComment: (postId: string, rootId: string| null, repliedId: string | null, comment: PostCommentType) => (
    {type: ADD_COMMENT, postId, rootId, repliedId, comment} as const
  ),
  deleteCurrentUserPostReaction: (postId: string, reactionId: string) => (
    {type: DELETE_REACTION, postId, reactionId} as const
  ),
  editCurrentUserPostReaction: (postId: string, reactionId: string, type: number) => (
    {type: EDIT_REACTION, postId, reactionId, reactionType: type} as const
  ),
  addCurrentUserPostReaction: (postId: string, reaction: ReactionType) => (
    {type: ADD_CURRENT_USER_REACTION, postId, reaction} as const
  ),
  addCurrentUserCommentReaction: (postId: string, commentId: string, rootId: string | null, reaction: ReactionType) => (
    {type: ADD_CURRENT_USER_COMMENT_REACTION, postId, commentId, rootId, reaction} as const
  ),
  setCommentReactions: (postId: string, commentId: string, rootId: string | null, reactions: Array<ReactionType>, reactionsCount: object, offsetId: string | null) => (
    { type: SET_COMMENT_REACTIONS, postId, commentId, rootId, reactions, reactionsCount, offsetId} as const
  ),
  deleteCurrentUserCommentReaction: (postId: string, commentId: string, rootId: string | null, reactionId: string) => (
    {type: DELETE_COMMENT_REACTION, postId, commentId, rootId, reactionId} as const
  ),
  editCurrentUserCommentReaction: (postId: string, commentId: string, rootId: string | null, reactionId: string, reactionType: number) => (
    {type: EDIT_COMMENT_REACTION, postId, commentId, reactionId, rootId, reactionType} as const
  ),
  setNewPostError: (text: string) => (
    {type: ADD_NEW_POST_ERROR, text: text} as const
  ),
  setConnection: (connection: ConnectionType | null) => (
    {type: SET_CONNECTION, connection} as const
  ),
  editPost: (postId: string, post: PostType) => (
    {type: PUT_POST, postId, post} as const
  ),
  patchPost: (postId: string, property: string, value: any) => (
    {type: PATCH_POST, postId, property, value} as const
  ),
  editPostComment: (postId: string, commentId: string, comment: PostCommentType, rootId: string | null) => (
    {type: EDIT_POST_COMMENT, postId, commentId, comment, rootId} as const
  ),
  setPostsOwnerAndAllCount: (id: string, count: number) => (
    {type: SET_OWNER_ID_AND_POSTS_COUNT, id, count} as const
  ),
  cleanProfilePosts: () => (
    {type: CLEAN} as const
  ),
  initializeFeed: () => (
    {type: INITIALIZE_FEED} as const
  )
}

export let removeNewPostPhoto = (src: string): ThunkType => async (dispatch) => dispatch(actions.removeNewPostPhoto(src))
export let cleanNewPostPhotos = (): ThunkType => async (dispatch) => dispatch(actions.cleanNewPostPhotos())

export let setPostsOwnerAndAllCount = (id: string, count: number): ThunkType => async (dispatch) => {
  dispatch(actions.setPostsOwnerAndAllCount(id, count));
}

export let cleanProfilePosts = (): ThunkType => async (dispatch) => {
  dispatch(actions.cleanProfilePosts());
}

export let initFeed = (): ThunkType => async (dispatch) => {
  dispatch(actions.initializeFeed());
}

export let getFeedPosts = (count: number | null): ThunkType => {
  return async (dispatch) => {
    let response = await feedAPI.getFeedPosts(count, null)

    if(response.status === HttpStatusCode.OK) {
      const responseData = response.data
      dispatch(actions.setPosts(responseData.items, responseData.cursor, null, true))
    }
  }
}

export let getMoreFeedPosts = (count: number | null, cursor: string): ThunkType => {
  return async (dispatch) => {
    try {
      let response = await feedAPI.getFeedPosts(count, cursor)
      if(response.status === 200) {
        dispatch(actions.addPosts(response.data.items, response.data.cursor));
      }
      return response
    } catch (err) {
      console.log(err)
    }

  }
}

export let getPosts = (
  userId: string,
  count: number | null,
  cursor: string | null,
  order: 'ASC' | 'DESC',
  commentsCount: number | null,
  commentsOrder: string | null
): ThunkType => async (dispatch) => {
  console.log('GET POSTS')
  let response = await profileAPI.getPosts(userId, count, cursor, order, commentsCount, commentsOrder)

  if(response.status === 200) {
    dispatch(actions.setPosts(response.data.items, response.data.cursor, response.data.allPostsCount, false));
  }
  return response
}

export let addPostPhoto = (file: any, addCreator: string, albumID: string): ThunkType => {
  return async (dispatch) => {
    let response: any = await photosAPI.addPhoto(file, addCreator, albumID, {})
    if(response.status === 201) {
      let newPhotoResponse: any = await photosAPI.getPhoto(response.data.id)
      if(newPhotoResponse.status === 200) {
        dispatch(actions.setNewPostPhoto(newPhotoResponse.data))
      }
    }
    return response
  }
}

export let getMorePosts = (
  userId: string,
  count: number | null,
  cursor: string,
  order: 'ASC' | 'DESC',
  commentsCount: number | null,
  commentsOrder: string | null
): ThunkType => async (dispatch) => {
  let response = await profileAPI.getPosts(userId, count, cursor, order, commentsCount, commentsOrder)

  if(response.status === 200) {
    dispatch(actions.addPosts(response.data.items, response.data.cursor));
  }
  return response
}

export let createPostPhoto = (file: any, onProgressEvent: Function): ThunkType => {
  return async (dispatch) => {
    let response: any = await photosAPI.createPostPhoto(file, onProgressEvent)
    return response
  }
}

export let getPostPhoto = (photoId: string): ThunkType => {
  return async (dispatch) => {
    let response: any = await photosAPI.getPostPhoto(photoId)
    return response
  }
}

export let createCommentPhoto = (file: any): ThunkType => {
  return async (dispatch) => {
    let response: any = await photosAPI.createCommentPhoto(file)
    return response
  }
}

export let getCommentPhoto = (photoId: string): ThunkType => {
  return async (dispatch) => {
    let response: any = await photosAPI.getCommentPhoto(photoId)
    return response
  }
}

export let clearPostComments = (postId: string): ThunkType => async(dispatch) => {
  dispatch(actions.clearPostComments(postId))
}
  
export let deletePost = (postID: string): ThunkType => async (dispatch) => {
  let response = await profileAPI.deletePost(postID)
  if(response.status === 200) {
    dispatch(actions.setPostIsDeleted(postID, true))
  }
  return response
}

export let restorePost = (postID: string): ThunkType => async (dispatch) => {
  let response = await profileAPI.restorePost(postID)
  if(response.status === 200) {
    dispatch(actions.setPostIsDeleted(postID, false))
  }
  return response
}

export let deleteComment = (commentID: string, postId: string, rootId: string | null): ThunkType => {
  return async (dispatch) => {
    let response = await profileAPI.deleteComment(commentID)
    if(response.status === 200) {
      dispatch(actions.setCommentIsDeleted(commentID, true, postId, rootId))
    }
    return response
  }
}

export let restoreComment = (commentID: string, postId: string, rootId: string | null): ThunkType => {
  return async (dispatch) => {
    let response = await profileAPI.restoreComment(commentID)
    if(response.status === 200) {
      dispatch(actions.setCommentIsDeleted(commentID, false, postId, rootId))
    }
    return response
  }
}

export let getComments = (
  userId: string | null,
  postId: string,
  offsetId: string | null,
  count: number | null,
  order: string | null
): ThunkType => async (dispatch) => {
  let response = await profileAPI.getComments(userId, postId, offsetId, count, order)
  if(response.status === 200) {
    dispatch(actions.setComments(response.data.items, response.data.allCommentsCount, postId));
  }
  return response
}

export let getReplies = (
  userId: string | null,
  postId: string,
  commentId: string,
  offsetId: string | null,
  count: number | null
): ThunkType => async (dispatch) => {
  try {
    let response = await profileAPI.getReplies(userId, commentId, offsetId, count)
    if(response.status === 200) {
      dispatch(actions.setReplies(response.data.items, response.data.allRepliesCount, postId, commentId));
    }
  } catch(e) {
    const error = e as AxiosError
    console.log(error)
  }
}

export let getReactions = (
  postId: string,
  offsetId: string | null,
  count: number | null
): ThunkType => async (dispatch) => {
  let response = await profileAPI.getPostReactions(postId, offsetId, count)
  if(response.status === 200) {
    let data = response.data
    dispatch(actions.setPostReactions(postId, data.reactions, data.reactionsCount, offsetId));
  }
  return response
}

export let createPhoto = (image: any): ThunkType => async (dispatch) => {
  let response = await profileAPI.createPhoto(image, '0', '-1')
  return response
}

export let createPost = (
  text: string,
  attachments: [],
  isPublic: number,
  commentingIsDisabled: number,
  reactionsAreDisabled: number,
  sharedId: string | null
): ThunkType => {
  return async (dispatch: any) => {
    try {
      let response = await profileAPI.createPost(text, attachments, isPublic, commentingIsDisabled, reactionsAreDisabled, sharedId)
      let getPostResponse = await profileAPI.getPost(response.data.id)
      if(getPostResponse.status === 200) {
        dispatch(actions.addPost(getPostResponse.data.post));
      }
    } catch(e) {
      const error = e as AxiosError
      if(!error.response) {
        dispatch(actions.setNewPostError('Не удалось создать пост'))
      } else if(error.response && error.response.status === 422) {

      }
    }
  }
}

export let editPost = (
  postId : string,
  text: string,
  attachments: [],
  disableComments: boolean,
  isPublic: boolean
): ThunkType => {
  return async (dispatch: any) => {
    let response = await profileAPI.editPost(postId, text, attachments, disableComments, isPublic)
    
    if(response.status === 200) {
      let getPostResponse = await profileAPI.getPost(postId)
      if(getPostResponse.status === 200) {
        dispatch(actions.editPost(postId, getPostResponse.data.post));
      }
      
    }
  }
}

export let patchPost = (postId : string, property: string, value: any): ThunkType => {
  return async (dispatch: any) => {
    let response = await profileAPI.patchPost(postId, property, value)
    if(response.status === 200) {
      dispatch(actions.patchPost(postId, property, value));
    }
  }
}

export let editPostComment = (
  postId: string, commentId : string, text: string,
  attachmentId: string | null, rootId: string | null
): ThunkType => {
  return async (dispatch: any) => {
    let response = await profileAPI.editComment(commentId, text, attachmentId)
    
    if(response.status === 200) {
      response = await profileAPI.getComment(commentId, 0)
      if(response.status === 200) {
        dispatch(actions.editPostComment(postId, commentId, response.data.comment, rootId));
      }
    }
  }
}

export let createComment = (
  postId: string,
  text: string,
  attachmentId: string | null,
  rootId: string | null,
  repliedId: string | null
): ThunkType => {
  return async (dispatch: any) => {
    let response = await profileAPI.createComment(postId, text, attachmentId, repliedId)
    if(response && response.status === 201) {
      let createdId = response.data.id
      response = await profileAPI.getComment(createdId, 0)
      if(response.status === 200) {
        dispatch(actions.addComment(postId, rootId, repliedId, response.data.comment));
      }
    }
    return response
  }
}

export let editPostReaction = (
  postId: string,
  reactionId: string,
  type: number
): ThunkType => {
  return async (dispatch: any) => {
    try {
      let response = await profileAPI.editPostReaction(postId, reactionId, type)
      if(response.status === 200) {
        dispatch(actions.editCurrentUserPostReaction(postId, reactionId, type));
      }
    } catch (e) {
      const error = e as AxiosError
      if(error.response) {
        if(error.response.status === 404) {
          dispatch(actions.deleteCurrentUserPostReaction(postId, reactionId));
        }
      }
    }
    let response = await profileAPI.getPostReactions(postId, null, null)
    if(response.status === 200) {
      let data = response.data
      dispatch(actions.setPostReactions(postId, data.reactions, data.reactionsCount, null))
    }
  }
}

export let deletePostReaction = (
  postId: string,
  reactionId: string
): ThunkType => {
  return async (dispatch: any) => {
    try {
      let response = await profileAPI.deletePostReaction(postId, reactionId)

      if(response.status === 200) {
        dispatch(actions.deleteCurrentUserPostReaction(postId, reactionId))
      }
      dispatch(getReactions(postId, null, null))
    } catch (e) {
      const error = e as AxiosError
      if(error.response) {
        if(error.response.status === 404) {
          dispatch(actions.deleteCurrentUserPostReaction(postId, reactionId))
          dispatch(getReactions(postId, null, null))
        }
      }
    }
  }
}

export let createPostReaction = (
  postId: string,
  type: number
): ThunkType => {
  return async (dispatch: any) => {
    try {
      let response = await profileAPI.createPostReaction(postId, type)
      if(response.status === 201) {
        let createdReactionId = response.data.id
        let getCreatedReactionResponse = await profileAPI.getPostReaction(postId, createdReactionId)
        if(getCreatedReactionResponse.status === 200) {
          let reaction = getCreatedReactionResponse.data.reaction
          dispatch(actions.addCurrentUserPostReaction(postId, reaction));
        }
        dispatch(getReactions(postId, null, null))
      } 
    }
    catch (e) {
      const error = e as AxiosError
      if(error.response) {
          if(error.response.status === 422 && error.response.data.errorCode === 228) {
          let createdReactionId = error.response.data.reactionId
          let getCreatedReactionResponse = await profileAPI.getPostReaction(postId, createdReactionId)

          if(getCreatedReactionResponse.status === 200) {
            let reaction = getCreatedReactionResponse.data.reaction
            dispatch(actions.addCurrentUserPostReaction(postId, reaction));
          }
        }
        dispatch(getReactions(postId, null, null))
      }
    }

  }
}

export let createCommentReaction = (
  postId: string,
  commentId: string,
  rootId: string | null,
  type: number
): ThunkType => {
  return async (dispatch: any) => {
    try {
      let response = await profileAPI.createCommentReaction(commentId, type)
      if(response.status === 201) {
        let createdReactionId = response.data.id
        let getCreatedReactionResponse = await profileAPI.getCommentReaction(commentId, createdReactionId)

        if(getCreatedReactionResponse.status === 200) {
          let reaction = getCreatedReactionResponse.data.reaction
          dispatch(actions.addCurrentUserCommentReaction(postId, commentId, rootId, reaction));
        }

      } 
    } catch (e) {
      const error = e as AxiosError
      if(error.response) {
          if(error.response.status === 422 && error.response.data.errorCode === 228) {
          let createdReactionId = error.response.data.reactionId
          let getCreatedReactionResponse = await profileAPI.getCommentReaction(commentId, createdReactionId)

          if(getCreatedReactionResponse.status === 200) {
            let reaction = getCreatedReactionResponse.data.reaction
            dispatch(actions.addCurrentUserCommentReaction(postId, commentId, rootId, reaction));
          }
        }
      }
    }
  }
}

export let editCommentReaction = (
  postId: string,
  commentId: string,
  rootId: string | null,
  reactionId: string,
  type: number
): ThunkType => {
  return async (dispatch: any) => {
    try {
      let response = await profileAPI.editCommentReaction(commentId, reactionId, type)

      if(response.status === 200) {
        dispatch(actions.editCurrentUserCommentReaction(postId, commentId, rootId, reactionId, type));
      }
    } catch (e) {
      const error = e as AxiosError
      if(error.response) {
        if(error.response.status === 404) {
          dispatch(actions.deleteCurrentUserCommentReaction(postId, commentId, rootId, reactionId));
        }
      }
    }
  }
}

export let deleteCommentReaction = (
  postId: string,
  commentId: string,
  rootId: string | null,
  reactionId: string
): ThunkType => {
  return async (dispatch: any) => {
    try {
      let response = await profileAPI.deleteCommentReaction(commentId, reactionId)

      if(response.status === 200) {
        dispatch(actions.deleteCurrentUserCommentReaction(postId, commentId, rootId, reactionId));
      }
    } catch (e) {
      const error = e as AxiosError
      if(error.response) {
        if(error.response.status === 404) {
          dispatch(actions.deleteCurrentUserCommentReaction(postId, commentId, rootId, reactionId));
        }
      }
    }
  }
}

export let getCommentReactions = (
  postId: string,
  commentId: string,
  rootId: string | null,
  offsetId: string | null,
  count: number | null
): ThunkType => {
  return async (dispatch) => {
    let response = await profileAPI.getCommentReactions(commentId, null, null)
    if(response.status === 200) {
      let data = response.data
      dispatch(actions.setCommentReactions(postId, commentId, rootId, data.reactions, data.reactionsCount, null))
    }
  }
}

type InitialStateType = typeof initialState
type ActionsType = InferActionsTypes<typeof actions>
type ThunkType = ThunkAction<void, AppStateType, unknown, ActionsType>

export default profilePostsReducer
