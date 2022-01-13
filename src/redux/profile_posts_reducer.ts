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
const REPLACE_CURRENT_USER_REACTION = 'profile-posts/REPLACE-CURRENT-USER-REACTION'
const SET_POST_REACTIONS = 'profile-posts/SET-POST-REACTIONS'
const ADD_NEW_POST_ERROR = 'profile-posts/ADD-NEW-POST-ERROR'
const SET_COMMENT_IS_DELETED = 'profile-posts/SET-COMMENT-IS-DELETED'
const SET_OWNER_ID_AND_POSTS_COUNT = 'profile-posts/SET-OWNER-ID'
const REPLACE_CURRENT_USER_COMMENT_REACTION = 'profile-posts/REPLACE-CURRENT-USER-COMMENT-REACTION'
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
      return {...state,isFeed: true}
    }
    case CLEAN: {
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
        areLoaded: action.count === 0,
        posts: [...state.posts]
      }
    }
    case PUT_POST: {
      let post = state.posts.find(post => post.id === action.postId)
      if(post) {
        let postsCopy = [...state.posts]
        postsCopy[postsCopy.indexOf(post)] = action.post
        return {...state, posts: postsCopy}
      }
      return {...state}
    }
    case PATCH_POST: {
      let post = state.posts.find(post => post.id === action.postId)
      if(post) {
        let postCopy = copyPost(post)
        if(action.property === 'comments_are_disabled') {
          postCopy.commentingIsDisabled = action.value
        } else if(action.property === 'is_public') {
          postCopy.isPublic = action.value
        }
        let postsCopy = [...state.posts]
        postsCopy[postsCopy.indexOf(post)] = postCopy
        return {...state, posts: postsCopy}
      }
      return {...state}
    }
    case SET_POST_IS_DELETED: {
      let post = state.posts.find(post => post.id === action.postId)
      if(post) {
        let postCopy = copyPost(post)
        postCopy.isDeleted = action.isDeleted
        let postsCopy = [...state.posts]
        postsCopy[postsCopy.indexOf(post)] = postCopy
        return {...state, posts: postsCopy}
      }
      return {...state}
    }
    case SET_COMMENT_IS_DELETED: {
      let post = state.posts.find(post => post.id === action.postId)
      if(!!post) {
        let postsCopy = [...state.posts]
        let postCopy = copyPost(post)
        postsCopy[postsCopy.indexOf(post)] = postCopy
        if(action.rootId) {
          let root = post.comments.find(comment => comment.id === action.rootId)
          if(root) {
            let rootCopy = copyComment(root)
            let reply = rootCopy.replies.find(reply => reply.id === action.commentId)
            if(reply) {
              let replyCopy = copyComment(reply)
              replyCopy.deleted = action.isDeleted
              rootCopy.replies[rootCopy.replies.indexOf(reply)] = replyCopy
              postCopy.comments[postCopy.comments.indexOf(root)] = rootCopy
            }
          }
        } else {
          let comment = post.comments.find(comment => comment.id === action.commentId)
          if(comment) {
            let commentCopy = copyComment(comment)
            commentCopy.deleted = action.isDeleted
            postCopy.comments[postCopy.comments.indexOf(comment)] = commentCopy
          }
        }
        return {...state, posts: postsCopy}
      }
      return {...state}
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
      if(!!post) {
        let postCopy = copyPost(post)

        if(postCopy.comments.length > 0) {
          postCopy.comments = postCopy.comments.concat(action.comments)
        } else {
          postCopy.comments = action.comments
        }
        postCopy.commentsCount = action.allCommentsCount
        let postsCopy = [...state.posts]
        postsCopy[postsCopy.indexOf(post)] = postCopy
        return {...state, posts: postsCopy}
      }
      return {...state}
    }
    case ADD_COMMENT: {
      let post = state.posts.filter(post => post.id === action.postId)[0]
      if(!!post) {
        let postCopy = copyPost(post)
        if(action.rootId) {
          let root = post.comments.filter(comment => comment.id === action.rootId)[0]
          if(!!root) {
            let rootCopy = copyComment(root)
            rootCopy.replies = [...[action.comment].concat(rootCopy.replies)]
            rootCopy.repliesCount++
            postCopy.comments[postCopy.comments.indexOf(root)] = rootCopy
          }
        }
        else {
          postCopy.comments = [action.comment].concat(postCopy.comments)
          postCopy.commentsCount++
        }
        let postsCopy = [...state.posts]
        postsCopy[postsCopy.indexOf(post)] = postCopy
        return {...state, posts: postsCopy}
      }
      return {...state}
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
      return {...state}
    }
    case SET_REPLIES: {
      let post = state.posts.filter(post => post.id === action.postId)[0]
      if(post.comments) {
        let comment = post.comments.filter(comment => comment.id === action.commentId)[0]
        if(!!comment) {
          let commentCopy = copyComment(comment)
          commentCopy.replies = commentCopy.replies.concat(action.replies)
          commentCopy.repliesCount = action.allRepliesCount
          let postCopy = copyPost(post)
          postCopy.comments[postCopy.comments.indexOf(comment)] = commentCopy
          let postsCopy = [...state.posts]
          postsCopy[postsCopy.indexOf(post)] = postCopy
          return {...state, posts: postsCopy}
        }
      }
    }
    case SET_POST_REACTIONS: {
      let post = state.posts.find(post => post.id === action.postId)
      if(post) {
        let postCopy = copyPost(post)
        if(action.offsetId) {
          postCopy.reactions = postCopy.reactions.concat(action.reactions)
        } else {
          postCopy.reactions = action.reactions
        }
        postCopy.reactionsCount = action.reactionsCount
        let postsCopy = [...state.posts]
        postsCopy[postsCopy.indexOf(post)] = postCopy
        return {...state, posts: postsCopy}
      }
      return {...state}
    }
    case SET_COMMENT_REACTIONS: {
      let post = state.posts.find(post => post.id === action.postId)
      if(!!post) {
        let postCopy = copyPost(post)

        if(action.rootId) {
          let root = post.comments.filter(comment => comment.id === action.rootId)[0]
          if(!!root) {
            let rootCopy = copyComment(root)
            let reply = root.replies.filter(reply => reply.id === action.commentId)[0]
            if(!!reply) {
              let replyCopy = copyComment(reply)
              replyCopy.reactionsCount = action.reactionsCount
              rootCopy.replies[rootCopy.replies.indexOf(reply)] = replyCopy
              postCopy.comments[postCopy.comments.indexOf(root)] = rootCopy
            }
          }
        } else {
          let comment = post.comments.filter(comment => comment.id === action.commentId)[0]
          if(comment) {
            let commentCopy = copyComment(comment)
            commentCopy.reactionsCount = action.reactionsCount
            postCopy.comments[postCopy.comments.indexOf(comment)] = commentCopy
          }
        }
        let postsCopy = [...state.posts]
        postsCopy[postsCopy.indexOf(post)] = postCopy
        return { ...state, posts: postsCopy}
      }
      return {...state}
    }
    case CLEAR_POST_COMMENTS: {
      let post = state.posts.filter(post => post.id === action.postId)[0]
      post.comments = []
      return {
        ...state,
        posts: [...state.posts]
      }
    }
    case EDIT_REACTION: {
      let post = state.posts.filter(post => post.id === action.postId)[0]
      if(!!post) {
        let postsCopy = [...state.posts]
        let postCopy = copyPost(post)
        let prevReaction = postCopy.requesterReaction
        const prevReactionType = prevReaction ? prevReaction.type : null
        postCopy.requesterReaction = action.reaction
        editReactionsCount(postCopy.reactionsCount, action.reaction.type, prevReactionType)
        postsCopy[postsCopy.indexOf(post)] = postCopy
        return {...state, posts: postsCopy}
      }
      return {...state}
    }
    case DELETE_REACTION: {
      let post = state.posts.filter(post => post.id === action.postId)[0]
      if(!!post) {
        let postsCopy = [...state.posts]
        let postCopy = copyPost(post)
        const prevReactionType = post.requesterReaction ?
          post.requesterReaction.type : null
        postCopy.requesterReaction = null
        editReactionsCount(postCopy.reactionsCount, null, prevReactionType)
        postsCopy[postsCopy.indexOf(post)] = postCopy
        return {...state, posts: postsCopy}
      }
      return {...state}
    }
    case ADD_CURRENT_USER_REACTION: {
      let post = state.posts.filter(post => post.id === action.postId)[0]
      if(!!post) {
        let postsCopy = [...state.posts]
        let postCopy = copyPost(post)
        postCopy.requesterReaction = action.reaction
        editReactionsCount(postCopy.reactionsCount, action.reaction.type, null)
        postsCopy[postsCopy.indexOf(post)] = postCopy
        return {...state, posts: postsCopy}
      }
      return {...state}
    }
    case REPLACE_CURRENT_USER_REACTION: {
      const post = state.posts.filter(post => post.id === action.postId)[0]
      if(!!post) {
        let postsCopy = [...state.posts]
        let postCopy = copyPost(post)
        const prevReactionType = post.requesterReaction ?
          post.requesterReaction.type : null
        postCopy.requesterReaction = action.reaction

        editReactionsCount(postCopy.reactionsCount, action.reaction.type, prevReactionType)
        postsCopy[postsCopy.indexOf(post)] = postCopy
        return {...state, posts: postsCopy}
      }
      return {...state}
    }
    case EDIT_POST_COMMENT: {
      let postsCopy = [...state.posts]
      let post = postsCopy.find(post => post.id === action.postId)

      if(post) {
        let postCopy = copyPost(post)
        if(action.rootId) {
          let root = post.comments.find(comment => action.rootId === comment.id)
          if(root) {
            let rootCopy = copyComment(root)
            let reply = root.replies.find(reply => action.commentId === reply.id)
            if(reply) {
              rootCopy.replies[root.replies.indexOf(reply)] = action.comment
              postCopy.comments[postCopy.comments.indexOf(root)] = rootCopy
              postsCopy[postsCopy.indexOf(post)] = postCopy
            }
          }
        } 
        else {
          let comment = post.comments.find(comment => action.commentId === comment.id)
          if(comment) {
            postCopy.comments[postCopy.comments.indexOf(comment)] = action.comment
            postsCopy[postsCopy.indexOf(post)] = postCopy
          }
        }
        return {...state, posts: postsCopy}
      }
      return {...state}
    }
    case ADD_CURRENT_USER_COMMENT_REACTION: {
      let postsCopy = [...state.posts]
      let post = postsCopy.find(post => post.id === action.postId)

      if(post) {
        let postCopy = copyPost(post)
        if(action.rootId) {
          let root = post.comments.find(comment => action.rootId === comment.id)
          if(root) {
            let rootCopy = copyComment(root)
            let reply = root.replies.find(reply => action.commentId === reply.id)
            if(reply) {
              let replyCopy = copyComment(reply)
              replyCopy.requesterReaction = action.reaction
              editReactionsCount(replyCopy.reactionsCount, action.reaction.type, null)
              rootCopy.replies[rootCopy.replies.indexOf(reply)] = replyCopy
              postCopy.comments[postCopy.comments.indexOf(root)] = rootCopy
              postsCopy[postsCopy.indexOf(post)] = postCopy
            }
          }
        }
        else {
          let comment = post.comments.find(comment => action.commentId === comment.id)
          if(comment) {
            let commentCopy = copyComment(comment)
            commentCopy.requesterReaction = action.reaction
            editReactionsCount(commentCopy.reactionsCount, action.reaction.type, null)
            postCopy.comments[postCopy.comments.indexOf(comment)] = commentCopy
            postsCopy[postsCopy.indexOf(post)] = postCopy
          }
        }
        return {...state, posts: postsCopy}
      }
      return {...state}
    }
    case REPLACE_CURRENT_USER_COMMENT_REACTION: {
      let postsCopy = [...state.posts]

      let post = postsCopy.find(post => post.id === action.postId)
      if(post) {
        let postCopy = copyPost(post)
        if(action.rootId) {
          let root = post.comments.find(comment => action.rootId === comment.id)
          if(root) {
            let rootCopy = copyComment(root)
            let reply = root.replies.find(reply => action.commentId === reply.id)
            if(reply) {
              let replyCopy = copyComment(reply)
              let prevReactionType = replyCopy.requesterReaction ? replyCopy.requesterReaction.type : null
              replyCopy.requesterReaction = action.reaction
              editReactionsCount(replyCopy.reactionsCount, action.reaction.type, prevReactionType)
              rootCopy.replies[rootCopy.replies.indexOf(reply)] = replyCopy
              postCopy.comments[postCopy.comments.indexOf(root)] = rootCopy
              postsCopy[postsCopy.indexOf(post)] = postCopy
            }
          }
        }
        else {
          let comment = post.comments.find(comment => action.commentId === comment.id)
          if(!!comment) {
            let commentCopy = copyComment(comment)
            let prevReactionType = commentCopy.requesterReaction ? commentCopy.requesterReaction.type : null
            commentCopy.requesterReaction = action.reaction
            editReactionsCount(commentCopy.reactionsCount, action.reaction.type, prevReactionType)
            postCopy.comments[postCopy.comments.indexOf(comment)] = commentCopy
            postsCopy[postsCopy.indexOf(post)] = postCopy
          }
        }
        post.comments = [...post.comments]
      }
      return {...state, posts: postsCopy}
    }
    case EDIT_COMMENT_REACTION: {
      let postsCopy = [...state.posts]
      let post = state.posts.find(post => post.id === action.postId)

      if(post) {
        let postCopy = copyPost(post)
        if(action.rootId) {
          let root = post.comments.find(comment => action.rootId === comment.id)
          if(root) {
            let reply = root.replies.find(reply => action.commentId === reply.id)
            let rootCopy = copyComment(root)
            if(reply) {
              let replyCopy = copyComment(reply)
              let prevReactionType = replyCopy.requesterReaction
                ? replyCopy.requesterReaction.type : null
              replyCopy.requesterReaction = action.reaction
              editReactionsCount(replyCopy.reactionsCount, action.reaction.type, prevReactionType)
              rootCopy.replies[rootCopy.replies.indexOf(reply)] = replyCopy
              postCopy.comments[postCopy.comments.indexOf(root)] = rootCopy
              postsCopy[postsCopy.indexOf(post)] = postCopy
            }
          }
        } else {
          let comment = post.comments.find(comment => action.commentId === comment.id)
          if(comment) {
            let commentCopy = copyComment(comment)
            let prevReactionType = commentCopy.requesterReaction
              ? commentCopy.requesterReaction.type : null
            commentCopy.requesterReaction = action.reaction
            editReactionsCount(commentCopy.reactionsCount, action.reaction.type, prevReactionType)
            postCopy.comments[postCopy.comments.indexOf(comment)] = commentCopy
            postsCopy[postsCopy.indexOf(post)] = postCopy
          }
        }
      }
      return {...state, posts: postsCopy}
    }
    case DELETE_COMMENT_REACTION: {
      let postsCopy = [...state.posts]
      let post = postsCopy.find(post => post.id === action.postId)

      if(post) {
        let postCopy = copyPost(post)
        if(action.rootId) {
          let root = post.comments.find(comment => action.rootId === comment.id)
          if(root) {
            let rootCopy = copyComment(root)
            let reply = root.replies.find(reply => action.commentId === reply.id)
            if(reply) {
              let replyCopy = copyComment(reply)
              let requesterReactionType = replyCopy.requesterReaction
                ? replyCopy.requesterReaction.type : null
              replyCopy.requesterReaction = null
              editReactionsCount(replyCopy.reactionsCount, null, requesterReactionType)
              rootCopy.replies[rootCopy.replies.indexOf(reply)] = replyCopy
              postCopy.comments[postCopy.comments.indexOf(root)] = rootCopy
              postsCopy[postsCopy.indexOf(post)] = postCopy
            }
          }
        }
        else {
          let comment = post.comments.find(comment => action.commentId === comment.id)
          if(comment) {
            let commentCopy = copyComment(comment)
            let requesterReactionType = commentCopy.requesterReaction
              ? commentCopy.requesterReaction.type : null
            commentCopy.requesterReaction = null
            editReactionsCount(commentCopy.reactionsCount, null, requesterReactionType)
            postCopy.comments[postCopy.comments.indexOf(comment)] = commentCopy
            postsCopy[postsCopy.indexOf(post)] = postCopy
          }
        }
      }

      return {...state, posts: postsCopy}
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
  editCurrentUserPostReaction: (postId: string, reaction: ReactionType, type: number) => (
    {type: EDIT_REACTION, postId, reaction} as const
  ),
  addCurrentUserPostReaction: (postId: string, reaction: ReactionType) => (
    {type: ADD_CURRENT_USER_REACTION, postId, reaction} as const
  ),
  replaceCurrentUserPostReaction: (postId: string, reaction: ReactionType) => (
    {type: REPLACE_CURRENT_USER_REACTION, postId, reaction} as const
  ),
  addCurrentUserCommentReaction: (postId: string, commentId: string, rootId: string | null, reaction: ReactionType) => (
    {type: ADD_CURRENT_USER_COMMENT_REACTION, postId, commentId, rootId, reaction} as const
  ),
  replaceCurrentUserCommentReaction: (postId: string, commentId: string, rootId: string | null, reaction: ReactionType) => (
    {type: REPLACE_CURRENT_USER_COMMENT_REACTION, postId, commentId, rootId, reaction} as const
  ),
  setCommentReactions: (postId: string, commentId: string, rootId: string | null, reactions: Array<ReactionType>, reactionsCount: object, offsetId: string | null) => (
    { type: SET_COMMENT_REACTIONS, postId, commentId, rootId, reactions, reactionsCount, offsetId} as const
  ),
  deleteCurrentUserCommentReaction: (postId: string, commentId: string, rootId: string | null, reactionId: string) => (
    {type: DELETE_COMMENT_REACTION, postId, commentId, rootId, reactionId} as const
  ),
  editCurrentUserCommentReaction: (postId: string, commentId: string, rootId: string | null, reaction: ReactionType) => (
    {type: EDIT_COMMENT_REACTION, postId, commentId, rootId, reaction} as const
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
      // console.log(err)
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
  // console.log('GET POSTS')
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
    // console.log(error)
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
      } 
    }
    catch (e) {
      const error = e as AxiosError
      if(error.response) {
        if(error.response.status === 422 && error.response.data.errorCode === 228) {
          let createdReactionId = error.response.data.reactionId

          let editResponse = await profileAPI.editPostReaction(postId, createdReactionId, type)
          if(editResponse.status === 200) {
            let getResponse = await profileAPI.getPostReaction(postId, createdReactionId)
            if(getResponse.status === 200) {
              let reaction = getResponse.data.reaction
              dispatch(actions.addCurrentUserPostReaction(postId, reaction));
            }
          }
          
          // let getCreatedReactionResponse = await profileAPI.getPostReaction(postId, createdReactionId)

          // if(getCreatedReactionResponse.status === 200) {
          //   let reaction = getCreatedReactionResponse.data.reaction
          //   dispatch(actions.addCurrentUserPostReaction(postId, reaction));
          // }

        }
        // dispatch(getReactions(postId, null, null))
      }
    }
    finally {
      dispatch(getReactions(postId, null, null))
    }
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
        try {
          let getResponse = await profileAPI.getPostReaction(postId, reactionId)
          if(getResponse.status === 200) {
            dispatch(actions.editCurrentUserPostReaction(postId, getResponse.data.reaction, type));
          }
        } catch (e) {}
        
        let response = await profileAPI.getPostReactions(postId, null, null)
        if(response.status === 200) {
          let data = response.data
          await dispatch(actions.setPostReactions(postId, data.reactions, data.reactionsCount, null))
        }
      }
    }
    catch (e) {
      const error = e as AxiosError
      if(error.response) {
        if(error.response.status === 404) {
          try {
            let response = await profileAPI.createPostReaction(postId, type)
            if(response.status === 201) {
              let createdReactionId = response.data.id
      
              let getCreatedReactionResponse = await profileAPI.getPostReaction(postId, createdReactionId)
              if(getCreatedReactionResponse.status === 200) {
                dispatch(actions.replaceCurrentUserPostReaction(postId, getCreatedReactionResponse.data.reaction));
              }
            } 
          }
          catch (e) {
            const error = e as AxiosError
            if(error.response) {
              if(error.response.status === 422 && error.response.data.errorCode === 228) {
                let createdReactionId = error.response.data.reactionId
      
                let editResponse = await profileAPI.editPostReaction(postId, createdReactionId, type)
                if(editResponse.status === 200) {
                  let getResponse = await profileAPI.getPostReaction(postId, createdReactionId)
                  if(getResponse.status === 200) {
                    let reaction = getResponse.data.reaction
                    dispatch(actions.addCurrentUserPostReaction(postId, reaction));
                  }
                }
                
                // let getCreatedReactionResponse = await profileAPI.getPostReaction(postId, createdReactionId)
      
                // if(getCreatedReactionResponse.status === 200) {
                //   let reaction = getCreatedReactionResponse.data.reaction
                //   dispatch(actions.addCurrentUserPostReaction(postId, reaction));
                // }
      
              }
              // dispatch(getReactions(postId, null, null))
            }
          }
        }
      }
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
          await dispatch(actions.addCurrentUserCommentReaction(postId, commentId, rootId, reaction));
        }
      }
    }
    catch (e) {
      const error = e as AxiosError
      if(error.response) {
        if(error.response.status === 422 && error.response.data.code === 80) {
          let createdReactionId = error.response.data.reactionId
          let getCreatedReactionResponse = await profileAPI.getCommentReaction(commentId, createdReactionId)

          if(getCreatedReactionResponse.status === 200) {
            let reaction = getCreatedReactionResponse.data.reaction
            if(reaction.type === type) {
              await dispatch(actions.addCurrentUserCommentReaction(postId, commentId, rootId, reaction))
            }
            else {
              let response = await profileAPI.editCommentReaction(commentId, reaction.id, type)
              if(response.status === 200) {
                let getReactionResponse = await profileAPI.getCommentReaction(commentId, reaction.id)
                if(getReactionResponse.status === 200) {
                  dispatch(actions.addCurrentUserCommentReaction(postId, commentId, rootId, getReactionResponse.data.reaction));
                }
              }
            }
          }
        }
      }
    }
    finally {
      dispatch(getCommentReactions(postId, commentId, rootId, null, null))
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
        try {
          let getResponse = await profileAPI.getCommentReaction(commentId, reactionId)
          if(getResponse.status === 200) {
            dispatch(actions.editCurrentUserCommentReaction(postId, commentId, rootId, getResponse.data.reaction));
          }
        } catch (e) {
          const error = e as AxiosError
        }
      }
      // dispatch(getCommentReactions(postId, commentId, rootId, null, null))
    }
    catch (e) {
      const error = e as AxiosError
      if(error.response) {
        if(error.response.status === 404) {
          // dispatch(actions.deleteCurrentUserCommentReaction(postId, commentId, rootId, reactionId));
          // await dispatch(createCommentReaction(postId, commentId, rootId, type))
          let response = await profileAPI.createCommentReaction(commentId, type)
          if(response.status === 201) {
            let createdReactionId = response.data.id
            let getCreatedReactionResponse = await profileAPI.getCommentReaction(commentId, createdReactionId)
    
            if(getCreatedReactionResponse.status === 200) {
              let reaction = getCreatedReactionResponse.data.reaction
              await dispatch(actions.replaceCurrentUserCommentReaction(postId, commentId, rootId, reaction))
            }
          }
          
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
    } finally {
      dispatch(getCommentReactions(postId, commentId, rootId, null, null)) // обновление количества реакций
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

export const copyPost = (post: ProfilePostType): ProfilePostType => {
  const reactionsCount: Array<ReactionsCountItem> = []
  post.reactionsCount.forEach(item => {
    reactionsCount.push({type: item.type, count: item.count})
  })

  return {
    ...post,
    comments: [...post.comments],
    reactions: [...post.reactions],
    reactionsCount
  }
}

export const copyComment = (comment: PostCommentType): PostCommentType => {
  const reactionsCount: Array<ReactionsCountItem> = []

  comment.reactionsCount.forEach(item => {
    reactionsCount.push({
      type: item.type,
      count: item.count
    })
  })

  let copy = {
    ...comment,
    replies: [...comment.replies],
    reactions: [...comment.reactions],
    reactionsCount
  }
  return copy
}

const editReactionsCount = (reactionsCount: ReactionsCountItem[], newType: number | null, prevType: number | null) => {
  if(prevType) {
    let prevReactionCountInfo = reactionsCount.find(item => item.type === prevType)
    if(prevReactionCountInfo) {
      prevReactionCountInfo.count--
    }
  }
  if(newType) {
    let newReactionCountInfo = reactionsCount.find(item => item.type === newType)
    if(newReactionCountInfo) {
      newReactionCountInfo.count++
    } else {
      reactionsCount.push({type: newType, count: 1})
    }
  }
}

type InitialStateType = typeof initialState
type ActionsType = InferActionsTypes<typeof actions>
type ThunkType = ThunkAction<void, AppStateType, unknown, ActionsType>

export default profilePostsReducer
