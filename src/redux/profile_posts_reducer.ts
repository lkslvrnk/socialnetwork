import { ThunkAction } from "redux-thunk"
import { profileAPI } from "../api/profile_api"
import HttpStatusCode from "../api/HttpStatusCode"
import { AppStateType, InferActionsTypes } from "./redux_store"
import {
  ProfilePostType, PostType, PostCommentType, ReactionType,
  ReactionsCountItem, PhotoType, ConnectionType
} from "../types/types"
import { feedAPI } from "../api/feed_api"
import { AxiosError } from "axios"
import { photosAPI } from "../api/photos_api"

const ADD_POST_TO_PROFILE_POSTS = 'profile-posts/ADD-POST-TO-PROFILE-POSTS'
const ADD_COMMENT = 'profile-posts/ADD-COMMENT'
const REMOVE_POST = 'profile-posts/REMOVE-POST';
const SET_PROFILE_POSTS = 'profile-posts/SET-POSTS'
const ADD_PROFILE_POSTS = 'profile-posts/ADD-PROFILE-POSTS'
const SET_COMMENTS = 'profile-posts/SET-COMMENTS'
const SET_REPLIES = 'profile-posts/SET-REPLIES'
const CLEAR_POST_COMMENTS = 'profile-posts/CLEAR-POST-COMMENTS'
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
// const CLEAN_POST = 'profile-posts/CLEAN-POST'
// const CLEAN_FEED = 'profile-posts/CLEAN-FEED'
const SET_FEED = 'profile-posts/SET-FEED'
// const ADD_POST_TO_FEED = 'profile-posts/ADD-POST-TO-FEED'
const ADD_FEED_POSTS = 'profile-posts/ADD-FEED-POSTS'
const SET_PROFILE_POST = 'profile-posts/SET-PROFILE-POST'

export type Place = "profile_posts" | "feed" | "profile_post";
export const PROFILE_POSTS = 'profile_posts'
export const FEED = 'feed'
export const PROFILE_POST = 'profile_post'

let initialState = {
  profileOwnerId: null as string | null,
  profileAllPostsCount: null as number | null,
  profilePosts: [] as Array<ProfilePostType>,
  profilePostsCursor: null as string | null,
  profilePostsAreLoaded: false as boolean,
  isFeed: false as boolean,

  feed: [] as Array<ProfilePostType>,
  feedCursor: null as string | null,
  feedLoaded: false as boolean,

  profilePost: null as ProfilePostType | null,
  profilePostLoaded: false as boolean
}

const profilePostsReducer = (
  state: InitialStateType = initialState,
  action: ActionsType
): InitialStateType => {
  switch (action.type) {
    case INITIALIZE_FEED: {
      return { ...state, isFeed: true }
    }
    case CLEAN: {
      return {
        profileOwnerId: null,
        profileAllPostsCount: null,
        profilePosts: [],
        profilePostsCursor: null,
        profilePostsAreLoaded: false,
        isFeed: false,
        feed: [],
        feedCursor: null,
        feedLoaded: false,
        profilePost: null,
        profilePostLoaded: false
      }
    }
    case SET_PROFILE_POST: {
      return { ...state, profilePost: action.post, profilePostLoaded: true }
    }
    case SET_PROFILE_POSTS: {
      let post = action.posts[0]
      if (state.profileOwnerId && !!post && state.profileOwnerId === post.creator.id) {
        return {
          ...state,
          profilePostsAreLoaded: true,
          profilePosts: action.posts,
          profilePostsCursor: action.cursor,
          profileAllPostsCount: action.count
        }
      }
      return { ...state, profilePostsAreLoaded: true, profileAllPostsCount: 0 }
    }
    case SET_FEED: {
      return {
        ...state, feedLoaded: true, feed: action.posts,
        feedCursor: action.cursor
      }
    }
    case ADD_PROFILE_POSTS: {
      let post = action.posts[0]
      if ((state.profileOwnerId && state.profileOwnerId === post.creator.id)) {
        return {
          ...state,
          profilePosts: state.profilePosts.concat(action.posts),
          profilePostsCursor: action.cursor
        }
      }
      return state
    }
    case ADD_POST_TO_PROFILE_POSTS: {
      if (state.profileOwnerId && state.profileOwnerId === action.post.creator.id) {
        return {
          ...state,
          profileAllPostsCount: state.profileAllPostsCount
            ? state.profileAllPostsCount + 1 : null,
          profilePosts: [action.post, ...state.profilePosts]
        }
      }
      return { ...state }
    }
    case ADD_FEED_POSTS: {
      if (state.feedLoaded) {
        return {
          ...state,
          feed: [...state.feed, ...action.posts],
          feedCursor: action.cursor
        }
      }
      return { ...state }
    }
    case SET_OWNER_ID_AND_POSTS_COUNT: {
      return {
        ...state,
        profileOwnerId: action.id,
        profileAllPostsCount: action.count,
        profilePostsAreLoaded: false,
        profilePosts: [...state.profilePosts]
      }
    }
    case PUT_POST: {
      let post = findPost(state, action.postId, action.place)
      if (!post) return { ...state }
      return returnStateWithReplacedPost(state, action.post, action.place)
    }
    case PATCH_POST: {
      let post = findPost(state, action.postId, action.place)
      if (post) {
        let postCopy = copyPost(post)
        if (action.property === 'comments_are_disabled') {
          postCopy.commentingIsDisabled = action.value
        } else if (action.property === 'is_public') {
          postCopy.isPublic = action.value
        }
        return returnStateWithReplacedPost(state, postCopy, action.place)
      }
      return { ...state }
    }
    case SET_POST_IS_DELETED: {
      let post = findPost(state, action.postId, action.place)
      if (!post) return { ...state }
      let postCopy = copyPost(post)
      postCopy.isDeleted = action.isDeleted
      return returnStateWithReplacedPost(state, postCopy, action.place)
    }
    case SET_COMMENT_IS_DELETED: {
      let post = findPost(state, action.postId, action.place)

      if (!post) return { ...state }
      let postCopy = copyPost(post)
      if (action.rootId) {
        let root = findComment(post.comments, action.rootId)
        if (root) {
          let rootCopy = copyComment(root)
          let reply = findComment(rootCopy.replies, action.commentId)
          if (reply) {
            let replyCopy = copyComment(reply)
            replyCopy.deleted = action.isDeleted
            replaceComment(rootCopy.replies, replyCopy)
            replaceComment(postCopy.comments, rootCopy)
          }
        }
      } else {
        let comment = findComment(post.comments, action.commentId)
        if (comment) {
          let commentCopy = copyComment(comment)
          commentCopy.deleted = action.isDeleted
          replaceComment(postCopy.comments, commentCopy)
        }
      }
      return returnStateWithReplacedPost(state, postCopy, action.place)
    }
    case SET_COMMENTS: {
      let post = findPost(state, action.postId, action.place)
      if (!post) return { ...state }
      let postCopy = copyPost(post)
      if (postCopy.comments.length > 0) {
        postCopy.comments = postCopy.comments.concat(action.comments)
      } else {
        postCopy.comments = action.comments
      }
      postCopy.commentsCount = action.allCommentsCount
      return returnStateWithReplacedPost(state, postCopy, action.place)
    }
    case ADD_COMMENT: {
      let post = findPost(state, action.postId, action.place)
      if (!post) return { ...state }
      let postCopy = copyPost(post)
      if (action.rootId) {
        let root = findComment(post.comments, action.rootId)
        if (!!root) {
          let rootCopy = copyComment(root)
          rootCopy.replies = [action.comment].concat(rootCopy.replies)
          rootCopy.repliesCount++
          replaceComment(postCopy.comments, rootCopy)
        }
      }
      else {
        postCopy.comments = [action.comment].concat(postCopy.comments)
        postCopy.commentsCount++
      }
      return returnStateWithReplacedPost(state, postCopy, action.place)
    }
    case SET_REPLIES: {
      let post = findPost(state, action.postId, action.place)
      if (!post) return { ...state }

      let comment = findComment(post.comments, action.commentId)
      if (!comment) return { ...state }

      let commentCopy = copyComment(comment)
      commentCopy.replies = commentCopy.replies.concat(action.replies)
      commentCopy.repliesCount = action.allRepliesCount
      let postCopy = copyPost(post)
      replaceComment(postCopy.comments, commentCopy)
      return returnStateWithReplacedPost(state, postCopy, action.place)
    }
    case SET_POST_REACTIONS: {
      let post = findPost(state, action.postId, action.place)
      if (!post) return { ...state }

      let postCopy = copyPost(post)
      if (action.offsetId) {
        postCopy.reactions = postCopy.reactions.concat(action.reactions)
      } else {
        postCopy.reactions = action.reactions
      }
      postCopy.reactionsCount = action.reactionsCount
      return returnStateWithReplacedPost(state, postCopy, action.place)
    }
    case SET_COMMENT_REACTIONS: {
      let post = findPost(state, action.postId, action.place)
      if (!post) return { ...state }

      let postCopy = copyPost(post)
      if (action.rootId) {
        let root = findComment(post.comments, action.rootId)
        if (!!root) {
          let rootCopy = copyComment(root)
          let reply = findComment(root.replies, action.commentId)
          if (!!reply) {
            let replyCopy = copyComment(reply)
            replyCopy.reactionsCount = action.reactionsCount
            replaceComment(rootCopy.replies, replyCopy)
            replaceComment(postCopy.comments, rootCopy)
          }
        }
      } else {
        let comment = findComment(post.comments, action.commentId)
        if (comment) {
          let commentCopy = copyComment(comment)
          commentCopy.reactionsCount = action.reactionsCount
          replaceComment(postCopy.comments, commentCopy)
        }
      }
      return returnStateWithReplacedPost(state, postCopy, action.place)
    }
    case CLEAR_POST_COMMENTS: {
      let post = findPost(state, action.postId, action.place)
      if (!post) return { ...state }
      const postCopy = copyPost(post)
      postCopy.comments = []
      return returnStateWithReplacedPost(state, postCopy, action.place)
    }
    case EDIT_REACTION: {
      let post = findPost(state, action.postId, action.place)
      if (!post) return { ...state }

      let postCopy = copyPost(post)
      let prevReaction = postCopy.requesterReaction
      const prevReactionType = prevReaction ? prevReaction.type : null
      postCopy.requesterReaction = action.reaction
      editReactionsCount(
        postCopy.reactionsCount, action.reaction.type, prevReactionType
      )
      return returnStateWithReplacedPost(state, postCopy, action.place)
    }
    case DELETE_REACTION: {
      let post = findPost(state, action.postId, action.place)
      if (!post) return { ...state }
      let postCopy = copyPost(post)
      const prevReactionType = post.requesterReaction
        ? post.requesterReaction.type : null
      postCopy.requesterReaction = null
      editReactionsCount(postCopy.reactionsCount, null, prevReactionType)
      return returnStateWithReplacedPost(state, postCopy, action.place)
    }
    case ADD_CURRENT_USER_REACTION: {
      let post = findPost(state, action.postId, action.place)
      if (!post) return { ...state }
      let postCopy = copyPost(post)
      postCopy.requesterReaction = action.reaction
      editReactionsCount(postCopy.reactionsCount, action.reaction.type, null)
      return returnStateWithReplacedPost(state, postCopy, action.place)
    }
    case REPLACE_CURRENT_USER_REACTION: {
      let post = findPost(state, action.postId, action.place)
      if (!post) return { ...state }
      let postCopy = copyPost(post)
      const prevReactionType = post.requesterReaction
        ? post.requesterReaction.type : null
      postCopy.requesterReaction = action.reaction
      editReactionsCount(
        postCopy.reactionsCount, action.reaction.type, prevReactionType
      )
      return returnStateWithReplacedPost(state, postCopy, action.place)
    }
    case EDIT_POST_COMMENT: {
      let post = findPost(state, action.postId, action.place)
      if (!post) return { ...state }

      let postCopy = copyPost(post)
      if (action.rootId) {
        let root = findComment(post.comments, action.rootId)
        if (root) {
          let rootCopy = copyComment(root)
          let reply = root.replies.find(reply => action.commentId === reply.id)
          if (reply) {
            replaceComment(rootCopy.replies, action.comment)
            replaceComment(postCopy.comments, rootCopy)
          }
        }
      }
      else {
        let comment = findComment(post.comments, action.commentId)
        if (comment) {
          replaceComment(postCopy.comments, action.comment)
        }
      }
      return returnStateWithReplacedPost(state, postCopy, action.place)
    }
    case ADD_CURRENT_USER_COMMENT_REACTION: {
      let post = findPost(state, action.postId, action.place)
      if (!post) return { ...state }

      let postCopy = copyPost(post)
      postCopy.comments = [...postCopy.comments]
      if (action.rootId) {
        let root = findComment(post.comments, action.rootId)
        if (root) {
          let rootCopy = copyComment(root)
          let reply = findComment(root.replies, action.commentId)
          if (reply) {
            let replyCopy = copyComment(reply)
            replyCopy.requesterReaction = action.reaction
            editReactionsCount(
              replyCopy.reactionsCount, action.reaction.type, null
            )
            replaceComment(rootCopy.replies, replyCopy)
            replaceComment(postCopy.comments, rootCopy)
          }
        }
      }
      else {
        let comment = findComment(post.comments, action.commentId)
        if (comment) {
          let commentCopy = copyComment(comment)
          commentCopy.requesterReaction = action.reaction
          editReactionsCount(commentCopy.reactionsCount, action.reaction.type, null)
          replaceComment(postCopy.comments, commentCopy)
        }
      }
      return returnStateWithReplacedPost(state, postCopy, action.place)
    }
    case REPLACE_CURRENT_USER_COMMENT_REACTION: {
      let post = findPost(state, action.postId, action.place)
      if (!post) return { ...state }

      let postCopy = copyPost(post)
      postCopy.comments = [...postCopy.comments]
      if (action.rootId) {
        let root = findComment(post.comments, action.rootId)
        if (root) {
          let rootCopy = copyComment(root)
          let reply = findComment(root.replies, action.commentId)
          if (reply) {
            let replyCopy = copyComment(reply)
            let prevReactionType = replyCopy.requesterReaction
              ? replyCopy.requesterReaction.type : null
            replyCopy.requesterReaction = action.reaction
            editReactionsCount(
              replyCopy.reactionsCount, action.reaction.type, prevReactionType
            )
            replaceComment(rootCopy.replies, replyCopy)
            replaceComment(postCopy.comments, rootCopy)
          }
        }
      }
      else {
        let comment = findComment(post.comments, action.commentId)
        if (!!comment) {
          let commentCopy = copyComment(comment)
          let prevReactionType = commentCopy.requesterReaction
            ? commentCopy.requesterReaction.type : null
          commentCopy.requesterReaction = action.reaction
          editReactionsCount(
            commentCopy.reactionsCount, action.reaction.type, prevReactionType
          )
          replaceComment(postCopy.comments, commentCopy)
        }
      }
      return returnStateWithReplacedPost(state, postCopy, action.place)
    }
    case EDIT_COMMENT_REACTION: {
      let post = findPost(state, action.postId, action.place)
      if (!post) return { ...state }

      let postCopy = copyPost(post)
      postCopy.comments = [...postCopy.comments]
      if (action.rootId) {
        let root = findComment(post.comments, action.rootId)
        if (root) {
          let reply = findComment(root.replies, action.commentId)
          let rootCopy = copyComment(root)
          rootCopy.replies = [...rootCopy.replies]
          if (reply) {
            let replyCopy = copyComment(reply)
            let prevReactionType = replyCopy.requesterReaction
              ? replyCopy.requesterReaction.type : null
            replyCopy.requesterReaction = action.reaction
            editReactionsCount(
              replyCopy.reactionsCount, action.reaction.type, prevReactionType
            )
            replaceComment(rootCopy.replies, replyCopy)
            replaceComment(postCopy.comments, rootCopy)
          }
        }
      } else {
        let comment = findComment(post.comments, action.commentId)
        if (comment) {
          let commentCopy = copyComment(comment)
          let prevReactionType = commentCopy.requesterReaction
            ? commentCopy.requesterReaction.type : null
          commentCopy.requesterReaction = action.reaction
          editReactionsCount(
            commentCopy.reactionsCount, action.reaction.type, prevReactionType
          )
          replaceComment(postCopy.comments, commentCopy)
        }
      }

      return returnStateWithReplacedPost(state, postCopy, action.place)
    }
    case DELETE_COMMENT_REACTION: {
      let post = findPost(state, action.postId, action.place)
      if (!post) return { ...state }

      let postCopy = copyPost(post)
      postCopy.comments = [...postCopy.comments]
      if (action.rootId) {
        let root = findComment(post.comments, action.rootId)
        if (root) {
          let rootCopy = copyComment(root)
          let reply = findComment(root.replies, action.commentId)
          if (reply) {
            let replyCopy = copyComment(reply)
            let requesterReactionType = replyCopy.requesterReaction
              ? replyCopy.requesterReaction.type : null
            replyCopy.requesterReaction = null
            editReactionsCount(
              replyCopy.reactionsCount, null, requesterReactionType
            )
            replaceComment(rootCopy.replies, replyCopy)
            replaceComment(postCopy.comments, rootCopy)
          }
        }
      }
      else {
        let comment = findComment(post.comments, action.commentId)
        if (comment) {
          let commentCopy = copyComment(comment)
          let requesterReactionType = commentCopy.requesterReaction
            ? commentCopy.requesterReaction.type : null
          commentCopy.requesterReaction = null
          editReactionsCount(
            commentCopy.reactionsCount, null, requesterReactionType
          )
          replaceComment(postCopy.comments, commentCopy)
        }
      }
      return returnStateWithReplacedPost(state, postCopy, action.place)
    }
    default:
      return state;
  }
}

export const actions = {
  setProfilePost: (post: PostType | null) => ({
    type: SET_PROFILE_POST, post
  } as const),
  setProfilePosts: (
    posts: Array<PostType>, cursor: string | null, count: number | null
  ) => ({
    type: SET_PROFILE_POSTS, posts, cursor, count
  } as const),
  setFeed: (posts: Array<PostType>, cursor: string | null) => ({
    type: SET_FEED, posts, cursor
  } as const),
  addPosts: (posts: Array<PostType>, cursor: string | null) => ({
    type: ADD_PROFILE_POSTS, posts, cursor
  } as const),
  addFeedPosts: (posts: PostType[], cursor: string | null) => ({
    type: ADD_FEED_POSTS, posts, cursor
  } as const),
  setNewPostPhoto: (photo: PhotoType) => ({
    type: SET_NEW_POST_PHOTO, photo
  } as const),
  removePost: (postId: string) => ({
    type: REMOVE_POST, postId
  } as const),
  setPostIsDeleted: (postId: string, isDeleted: boolean, place: Place) => ({
    type: SET_POST_IS_DELETED, postId, isDeleted, place
  } as const),
  setCommentIsDeleted: (
    commentId: string, isDeleted: boolean,
    postId: string, rootId: string | null, place: Place
  ) => ({
    type: SET_COMMENT_IS_DELETED, commentId,
    isDeleted, postId, rootId, place
  } as const
  ),
  setComments: (
    comments: Array<PostCommentType>, allCommentsCount: number,
    postId: string, place: Place
  ) => ({
    type: SET_COMMENTS, postId, comments, allCommentsCount, place
  } as const),
  setReplies: (
    replies: Array<PostCommentType>, allRepliesCount: number,
    postId: string, commentId: string, place: Place
  ) => (
    {
      type: SET_REPLIES, postId, commentId, replies, allRepliesCount, place
    } as const
  ),
  setPostReactions: (
    postId: string, reactions: Array<ReactionType>,
    reactionsCount: ReactionsCountItem[],
    offsetId: string | null, place: Place
  ) => (
    { type: SET_POST_REACTIONS, postId, reactions, reactionsCount, offsetId, place } as const
  ),
  removeNewPostPhoto: (src: string) => ({
    type: REMOVE_NEW_POST_PHOTO, src
  } as const),
  cleanNewPostPhotos: () => ({
    type: CLEAN_NEW_POST_PHOTOS
  } as const),
  clearPostComments: (postId: string, place: Place) => ({
    type: CLEAR_POST_COMMENTS, postId, place
  } as const),
  addPost: (post: PostType) => (
    { type: ADD_POST_TO_PROFILE_POSTS, post } as const
  ),
  addComment: (
    postId: string, rootId: string | null,
    repliedId: string | null,
    comment: PostCommentType, place: Place
  ) => ({
    type: ADD_COMMENT, postId, rootId, repliedId, comment, place
  } as const),
  deleteCurrentUserPostReaction: (
    postId: string, reactionId: string, place: Place
  ) => (
    { type: DELETE_REACTION, postId, reactionId, place } as const
  ),
  editCurrentUserPostReaction: (
    postId: string, reaction: ReactionType, type: number, place: Place
  ) => (
    { type: EDIT_REACTION, postId, reaction, place } as const
  ),
  addCurrentUserPostReaction: (
    postId: string, reaction: ReactionType, place: Place
  ) => (
    { type: ADD_CURRENT_USER_REACTION, postId, reaction, place } as const
  ),
  replaceCurrentUserPostReaction: (
    postId: string, reaction: ReactionType, place: Place
  ) => (
    { type: REPLACE_CURRENT_USER_REACTION, postId, reaction, place } as const
  ),
  addCurrentUserCommentReaction: (
    postId: string, commentId: string, rootId: string | null,
    reaction: ReactionType, place: Place
  ) => ({
    type: ADD_CURRENT_USER_COMMENT_REACTION,
    postId, commentId, rootId, reaction, place
  } as const),
  replaceCurrentUserCommentReaction: (
    postId: string, commentId: string, rootId: string | null,
    reaction: ReactionType, place: Place
  ) => ({
    type: REPLACE_CURRENT_USER_COMMENT_REACTION,
    postId, commentId, rootId, reaction, place
  } as const),
  setCommentReactions: (
    postId: string, commentId: string, rootId: string | null,
    reactions: Array<ReactionType>, reactionsCount: Array<ReactionsCountItem>,
    offsetId: string | null, place: Place
  ) => ({
    type: SET_COMMENT_REACTIONS, postId, commentId, rootId,
    reactions, reactionsCount, offsetId, place
  } as const),
  deleteCurrentUserCommentReaction: (
    postId: string, commentId: string, rootId: string | null,
    reactionId: string, place: Place
  ) => ({
    type: DELETE_COMMENT_REACTION, postId,
    commentId, rootId, reactionId, place
  } as const),
  editCurrentUserCommentReaction: (
    postId: string, commentId: string,
    rootId: string | null, reaction: ReactionType, place: Place
  ) => ({
    type: EDIT_COMMENT_REACTION, postId, commentId, rootId, reaction, place
  } as const),
  setNewPostError: (text: string) => (
    { type: ADD_NEW_POST_ERROR, text: text } as const
  ),
  setConnection: (connection: ConnectionType | null) => (
    { type: SET_CONNECTION, connection } as const
  ),
  editPost: (postId: string, post: PostType, place: Place) => (
    { type: PUT_POST, postId, post, place } as const
  ),
  patchPost: (postId: string, property: string, value: any, place: Place) => (
    { type: PATCH_POST, postId, property, value, place } as const
  ),
  editPostComment: (
    postId: string, commentId: string, comment: PostCommentType,
    rootId: string | null, place: Place
  ) => ({
    type: EDIT_POST_COMMENT, postId, commentId, comment, rootId, place
  } as const),
  setPostsOwnerAndAllCount: (id: string, count: number) => (
    { type: SET_OWNER_ID_AND_POSTS_COUNT, id, count } as const
  ),
  cleanProfilePosts: () => (
    { type: CLEAN } as const
  ),
  initializeFeed: () => (
    { type: INITIALIZE_FEED } as const
  )
}

export let removeNewPostPhoto = (src: string): ThunkType => {
  return async (dispatch) => {
    dispatch(actions.removeNewPostPhoto(src))
  }
}
export let cleanNewPostPhotos = (): ThunkType => {
  return async (dispatch) => {
    dispatch(actions.cleanNewPostPhotos())
  }
}

export let setPostsOwnerAndAllCount = (id: string, count: number): ThunkType => {
  return async (dispatch) => {
    dispatch(actions.setPostsOwnerAndAllCount(id, count))
  }
}

export let cleanProfilePosts = (): ThunkType => async (dispatch) => {
  dispatch(actions.cleanProfilePosts());
}

export let initFeed = (): ThunkType => async (dispatch) => {
  dispatch(actions.initializeFeed());
}

export let getMoreFeedPosts = (count: number | null, cursor: string): ThunkType => {
  return async (dispatch) => {
    let response = await feedAPI.getFeedPosts(count, cursor)
    if (response.status === 200) {
      dispatch(actions.addFeedPosts(response.data.items, response.data.cursor));
    }
    return response
  }
}

export let getFeedPosts = (count: number | null): ThunkType => {
  return async (dispatch) => {
    let response = await feedAPI.getFeedPosts(count, null)

    if (response.status === HttpStatusCode.OK) {
      const responseData = response.data
      dispatch(actions.setFeed(responseData.items, responseData.cursor))
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
  let response = await profileAPI.getPosts(
    userId, count, cursor, order, commentsCount, commentsOrder
  )

  if (response.status === 200) {
    dispatch(actions.setProfilePosts(
      response.data.items, response.data.cursor, response.data.allPostsCount
    ));
  }
  return response
}

export let getPost = (
  postId: string,
  commentsCount: number | undefined,
  commentsOrder: string | undefined
): ThunkType => async (dispatch) => {
  let response = await profileAPI.getPost(postId, commentsCount, commentsOrder)
  if (response.status === 200) {
    dispatch(actions.setProfilePost(response.data.post));
  }
}

export let addPostPhoto = (
  file: any, addCreator: string, albumID: string
): ThunkType => {
  return async (dispatch) => {
    let response: any = await photosAPI.addPhoto(file, addCreator, albumID, {})
    if (response.status === 201) {
      let newPhotoResponse: any = await photosAPI.getPhoto(response.data.id)
      if (newPhotoResponse.status === 200) {
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
  let response = await profileAPI.getPosts(
    userId, count, cursor, order, commentsCount, commentsOrder
  )

  if (response.status === 200) {
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

export let clearPostComments = (
  postId: string, place: Place = PROFILE_POSTS
): ThunkType => {
  return async (dispatch) => {
    dispatch(actions.clearPostComments(postId, place))
  }
}

export let deletePost = (
  postID: string, place: Place = PROFILE_POSTS
): ThunkType => {
  return async (dispatch) => {
    let response = await profileAPI.deletePost(postID)
    if (response.status === 200) {
      dispatch(actions.setPostIsDeleted(postID, true, place))
    }
    return response
  }
}

export let restorePost = (
  postID: string, place: Place = PROFILE_POSTS
): ThunkType => {
  return async (dispatch) => {
    let response = await profileAPI.restorePost(postID)
    if (response.status === 200) {
      dispatch(actions.setPostIsDeleted(postID, false, place))
    }
    return response
  }
}

export let deleteComment = (
  commentID: string, postId: string,
  rootId: string | null, place: Place = PROFILE_POSTS
): ThunkType => {
  return async (dispatch) => {
    let response = await profileAPI.deleteComment(commentID)
    if (response.status === 200) {
      dispatch(actions.setCommentIsDeleted(commentID, true, postId, rootId, place))
    }
    return response
  }
}

export let restoreComment = (
  commentID: string, postId: string, rootId: string | null, place: Place = PROFILE_POSTS
): ThunkType => {
  return async (dispatch) => {
    let response = await profileAPI.restoreComment(commentID)
    if (response.status === 200) {
      dispatch(actions.setCommentIsDeleted(commentID, false, postId, rootId, place))
    }
    return response
  }
}

export let getComments = (
  userId: string | null,
  postId: string,
  offsetId: string | null,
  count: number | null,
  order: string | null,
  place: Place = PROFILE_POSTS
): ThunkType => async (dispatch) => {
  let response = await profileAPI.getComments(userId, postId, offsetId, count, order)
  if (response.status === 200) {
    dispatch(actions.setComments(
      response.data.items, response.data.allCommentsCount, postId, place
    ))
  }
  return response
}

export let getReplies = (
  userId: string | null,
  postId: string,
  commentId: string,
  offsetId: string | null,
  count: number | null,
  place: Place = PROFILE_POSTS
): ThunkType => async (dispatch) => {
  try {
    let response = await profileAPI.getReplies(
      userId, commentId, offsetId, `${count}`
    )
    if (response.status === 200) {
      dispatch(actions.setReplies(
        response.data.items, response.data.allRepliesCount,
        postId, commentId, place
      ));
    }
  } catch (e) {
    // const error = e as AxiosError
  }
}

export let getReactions = (
  postId: string,
  offsetId: string | null,
  count: number | null,
  place: Place = PROFILE_POSTS
): ThunkType => async (dispatch) => {
  let response = await profileAPI.getPostReactions(postId, offsetId, count)
  if (response.status === 200) {
    let data = response.data
    dispatch(actions.setPostReactions(
      postId, data.reactions, data.reactionsCount, offsetId, place
    ))
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
      let response = await profileAPI.createPost(
        text, attachments, isPublic, commentingIsDisabled,
        reactionsAreDisabled, sharedId
      )
      let getPostResponse = await profileAPI.getPost(response.data.id)
      if (getPostResponse.status === 200) {
        dispatch(actions.addPost(getPostResponse.data.post));
      }
    } catch (e) {
      const error = e as AxiosError
      if (!error.response) {
        dispatch(actions.setNewPostError('Не удалось создать пост'))
      } else if (error.response && error.response.status === 422) {

      }
    }
  }
}

export let editPost = (
  postId: string,
  text: string,
  attachments: [],
  disableComments: boolean,
  isPublic: boolean,
  place: Place = PROFILE_POSTS
): ThunkType => {
  return async (dispatch: any) => {
    let response = await profileAPI.editPost(
      postId, text, attachments, disableComments, isPublic
    )

    if (response.status === 200) {
      let getPostResponse = await profileAPI.getPost(postId)
      if (getPostResponse.status === 200) {
        dispatch(actions.editPost(postId, getPostResponse.data.post, place));
      }

    }
  }
}

export let patchPost = (
  postId: string, property: string, value: any, place: Place = PROFILE_POSTS
): ThunkType => {
  return async (dispatch: any) => {
    let response = await profileAPI.patchPost(postId, property, value)
    if (response.status === 200) {
      dispatch(actions.patchPost(postId, property, value, place));
    }
  }
}

export let editPostComment = (
  postId: string, commentId: string, text: string,
  attachmentId: string | null, rootId: string | null, place: Place = PROFILE_POSTS
): ThunkType => {
  return async (dispatch: any) => {
    let response = await profileAPI.editComment(commentId, text, attachmentId)

    if (response.status === 200) {
      response = await profileAPI.getComment(commentId, 0)
      if (response.status === 200) {
        dispatch(actions.editPostComment(
          postId, commentId, response.data.comment, rootId, place
        ))
      }
    }
  }
}

export let createComment = (
  postId: string,
  text: string,
  attachmentId: string | null,
  rootId: string | null,
  repliedId: string | null,
  place: Place = PROFILE_POSTS
): ThunkType => {
  return async (dispatch: any) => {
    let response = await profileAPI.createComment(
      postId, text, attachmentId, repliedId
    )
    if (response && response.status === 201) {
      let createdId = response.data.id
      response = await profileAPI.getComment(createdId, 0)
      if (response.status === 200) {
        dispatch(actions.addComment(
          postId, rootId, repliedId, response.data.comment, place
        ))
      }
    }
    return response
  }
}

export let createPostReaction = (
  postId: string,
  type: number,
  place: Place = PROFILE_POSTS
): ThunkType => {
  return async (dispatch: any) => {
    try {
      let response = await profileAPI.createPostReaction(postId, type)
      if (response.status === 201) {
        let createdReactionId = response.data.id

        let getCreatedReactionResponse = await profileAPI.getPostReaction(
          postId, createdReactionId
        )
        if (getCreatedReactionResponse.status === 200) {
          let reaction = getCreatedReactionResponse.data.reaction
          dispatch(actions.addCurrentUserPostReaction(postId, reaction, place));
        }
      }
    }
    catch (e) {
      const error = e as AxiosError
      if (error.response) {
        if (error.response.status === 422 && error.response.data.errorCode === 228) {
          let createdReactionId = error.response.data.reactionId

          let editResponse = await profileAPI.editPostReaction(
            postId, createdReactionId, type
          )
          if (editResponse.status === 200) {
            let getResponse = await profileAPI.getPostReaction(
              postId, createdReactionId
            )
            if (getResponse.status === 200) {
              let reaction = getResponse.data.reaction
              dispatch(actions.addCurrentUserPostReaction(postId, reaction, place))
            }
          }

          // let getCreatedReactionResponse = await profileAPI.getPostReaction(
          // postId, createdReactionId
          // )

          // if(getCreatedReactionResponse.status === 200) {
          //   let reaction = getCreatedReactionResponse.data.reaction
          //   dispatch(actions.addCurrentUserPostReaction(postId, reaction));
          // }

        }
        // dispatch(getReactions(postId, null, null))
      }
    }
    finally {
      dispatch(getReactions(postId, null, null, place))
    }
  }
}

export let editPostReaction = (
  postId: string,
  reactionId: string,
  type: number,
  place: Place = PROFILE_POSTS
): ThunkType => {
  return async (dispatch: any) => {
    try {
      let response = await profileAPI.editPostReaction(postId, reactionId, type)
      if (response.status === 200) {
        try {
          let getResponse = await profileAPI.getPostReaction(postId, reactionId)
          if (getResponse.status === 200) {
            dispatch(actions.editCurrentUserPostReaction(
              postId, getResponse.data.reaction, type, place
            ))
          }
        } catch (e) { }

        let response = await profileAPI.getPostReactions(postId, null, null)
        if (response.status === 200) {
          let data = response.data
          await dispatch(actions.setPostReactions(
            postId, data.reactions, data.reactionsCount, null, place
          ))
        }
      }
    }
    catch (e) {
      const error = e as AxiosError
      if (error.response) {
        if (error.response.status === 404) {
          try {
            let response = await profileAPI.createPostReaction(postId, type)
            if (response.status === 201) {
              let createdReactionId = response.data.id

              let getCreatedReactionResponse = await profileAPI.getPostReaction(
                postId, createdReactionId
              )
              if (getCreatedReactionResponse.status === 200) {
                dispatch(actions.replaceCurrentUserPostReaction(
                  postId, getCreatedReactionResponse.data.reaction, place
                ))
              }
            }
          }
          catch (e) {
            const error = e as AxiosError
            if (error.response) {
              if (error.response.status === 422
                && error.response.data.errorCode === 228
              ) {
                let createdReactionId = error.response.data.reactionId

                let editResponse = await profileAPI.editPostReaction(
                  postId, createdReactionId, type
                )
                if (editResponse.status === 200) {
                  let getResponse = await profileAPI.getPostReaction(
                    postId, createdReactionId
                  )
                  if (getResponse.status === 200) {
                    let reaction = getResponse.data.reaction
                    dispatch(actions.addCurrentUserPostReaction(
                      postId, reaction, place
                    ))
                  }
                }

                // let getCreatedReactionResponse = await profileAPI.getPostReaction(
                // postId, createdReactionId
                // )

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
  reactionId: string,
  place: Place = PROFILE_POSTS
): ThunkType => {
  return async (dispatch: any) => {
    try {
      let response = await profileAPI.deletePostReaction(postId, reactionId)

      if (response.status === 200) {
        dispatch(actions.deleteCurrentUserPostReaction(postId, reactionId, place))
      }
      dispatch(getReactions(postId, null, null))
    } catch (e) {
      const error = e as AxiosError
      if (error.response) {
        if (error.response.status === 404) {
          dispatch(actions.deleteCurrentUserPostReaction(postId, reactionId, place))
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
  type: number,
  place: Place = PROFILE_POSTS
): ThunkType => {
  return async (dispatch: any) => {
    try {
      let response = await profileAPI.createCommentReaction(commentId, type)
      if (response.status === 201) {
        let createdReactionId = response.data.id
        let getCreatedReactionResponse = await profileAPI.getCommentReaction(
          commentId, createdReactionId
        )

        if (getCreatedReactionResponse.status === 200) {
          let reaction = getCreatedReactionResponse.data.reaction
          await dispatch(actions.addCurrentUserCommentReaction(
            postId, commentId, rootId, reaction, place
          ))
        }
      }
    }
    catch (e) {
      const error = e as AxiosError
      if (error.response) {
        if (error.response.status === 422 && error.response.data.code === 80) {
          let createdReactionId = error.response.data.reactionId
          let getCreatedReactionResponse = await profileAPI.getCommentReaction(
            commentId, createdReactionId
          )

          if (getCreatedReactionResponse.status === 200) {
            let reaction = getCreatedReactionResponse.data.reaction
            if (reaction.type === type) {
              await dispatch(actions.addCurrentUserCommentReaction(
                postId, commentId, rootId, reaction, place
              ))
            }
            else {
              let response = await profileAPI.editCommentReaction(
                commentId, reaction.id, type
              )
              if (response.status === 200) {
                let getReactionResponse = await profileAPI.getCommentReaction(
                  commentId, reaction.id
                )
                if (getReactionResponse.status === 200) {
                  dispatch(actions.addCurrentUserCommentReaction(
                    postId, commentId, rootId,
                    getReactionResponse.data.reaction, place
                  ))
                }
              }
            }
          }
        }
      }
    }
    finally {
      dispatch(getCommentReactions(postId, commentId, rootId, null, null, place))
    }
  }
}

export let editCommentReaction = (
  postId: string,
  commentId: string,
  rootId: string | null,
  reactionId: string,
  type: number,
  place: Place = PROFILE_POSTS
): ThunkType => {
  return async (dispatch: any) => {
    try {
      let response = await profileAPI.editCommentReaction(
        commentId, reactionId, type
      )

      if (response.status === 200) {
        try {
          let getResponse = await profileAPI.getCommentReaction(
            commentId, reactionId
          )
          if (getResponse.status === 200) {
            dispatch(actions.editCurrentUserCommentReaction(
              postId, commentId, rootId, getResponse.data.reaction, place
            ))
          }
        } catch (e) {
          // const error = e as AxiosError
        }
      }
      // dispatch(getCommentReactions(postId, commentId, rootId, null, null))
    }
    catch (e) {
      const error = e as AxiosError
      if (error.response) {
        if (error.response.status === 404) {
          // dispatch(actions.deleteCurrentUserCommentReaction(
          //   postId, commentId, rootId, reactionId
          // ))
          // await dispatch(createCommentReaction(postId, commentId, rootId, type))
          let response = await profileAPI.createCommentReaction(commentId, type)
          if (response.status === 201) {
            let createdReactionId = response.data.id
            let getCreatedReactionResponse = await profileAPI.getCommentReaction(
              commentId, createdReactionId
            )

            if (getCreatedReactionResponse.status === 200) {
              let reaction = getCreatedReactionResponse.data.reaction
              await dispatch(actions.replaceCurrentUserCommentReaction(
                postId, commentId, rootId, reaction, place
              ))
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
  reactionId: string,
  place: Place = PROFILE_POSTS
): ThunkType => {
  return async (dispatch: any) => {
    try {
      let response = await profileAPI.deleteCommentReaction(commentId, reactionId)

      if (response.status === 200) {
        dispatch(actions.deleteCurrentUserCommentReaction(
          postId, commentId, rootId, reactionId, place
        ))
      }
    } catch (e) {
      const error = e as AxiosError
      if (error.response) {
        if (error.response.status === 404) {
          dispatch(actions.deleteCurrentUserCommentReaction(
            postId, commentId, rootId, reactionId, place
          ))
        }
      }
    } finally {
      // обновление количества реакций, это делается для получения актуального
      // количества реакций
      dispatch(getCommentReactions(postId, commentId, rootId, null, null, place))
    }
  }
}

export let getCommentReactions = (
  postId: string,
  commentId: string,
  rootId: string | null,
  offsetId: string | null,
  count: number | null,
  place: Place = PROFILE_POSTS
): ThunkType => {
  return async (dispatch) => {
    let response = await profileAPI.getCommentReactions(commentId, null, null)
    if (response.status === 200) {
      let data = response.data
      dispatch(actions.setCommentReactions(
        postId, commentId, rootId, data.reactions,
        data.reactionsCount, null, place
      ))
    }
  }
}

export const copyPost = (post: ProfilePostType): ProfilePostType => {
  const reactionsCount: Array<ReactionsCountItem> = []
  post.reactionsCount.forEach(item => {
    reactionsCount.push({ type: item.type, count: item.count })
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

function findComment(
  comments: PostCommentType[], commentId: string
): PostCommentType | undefined {
  return comments.find(c => c.id === commentId)
}

const editReactionsCount = (
  reactionsCount: ReactionsCountItem[],
  newType: number | null, prevType: number | null
) => {
  if (prevType) {
    let prevReactionCountInfo = reactionsCount.find(item => item.type === prevType)
    if (prevReactionCountInfo) {
      prevReactionCountInfo.count--
    }
  }
  if (newType) {
    let newReactionCountInfo = reactionsCount.find(item => item.type === newType)
    if (newReactionCountInfo) {
      newReactionCountInfo.count++
    } else {
      reactionsCount.push({ type: newType, count: 1 })
    }
  }
}

// function setPostIsDeleted (post: ProfilePostType, isDeleted: boolean) {
//   let postCopy = copyPost(post)
//   postCopy.isDeleted = isDeleted
//   return postCopy
// }

function replacePost(posts: Array<ProfilePostType>, newPost: PostType) {
  const postsCopy = [...posts]
  const original = posts.find(p => p.id === newPost.id)
  if (original) {
    postsCopy[postsCopy.indexOf(original)] = newPost
  }
  return postsCopy
}

function replaceComment(
  comments: PostCommentType[], commentCopy: PostCommentType
) {
  const original = comments.find(c => c.id === commentCopy.id)
  if (original) {
    comments[comments.indexOf(original)] = commentCopy
  }
}

// function findPost(posts: ProfilePostType[], postId: string): ProfilePostType | undefined {
//   return posts.find(post => post.id === postId)
// }

const returnStateWithReplacedPost = (
  state: InitialStateType, post: ProfilePostType, place: Place
): InitialStateType => {
  if (place === PROFILE_POSTS) {
    return { ...state, profilePosts: replacePost(state.profilePosts, post) }
  } else if (place === FEED) {
    return { ...state, feed: replacePost(state.feed, post) }
  } else if (place === PROFILE_POST) {
    return { ...state, profilePost: post }
  } else {
    return { ...state }
  }
}

function findPost(
  state: InitialStateType, postId: string, place: Place
): ProfilePostType | undefined {
  if (place === PROFILE_POSTS) {
    return state.profilePosts.find(p => p.id === postId)
  } else if (place === FEED) {
    return state.feed.find(p => p.id === postId)
  } else if (place === PROFILE_POST) {
    return !!state.profilePost
      && postId === state.profilePost.id
      ? state.profilePost : undefined
  }
}

type InitialStateType = typeof initialState
type ActionsType = InferActionsTypes<typeof actions>
type ThunkType = ThunkAction<void, AppStateType, unknown, ActionsType>

export default profilePostsReducer
