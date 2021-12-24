import { PostType, PostCommentType, ProfileType, ReactionType, ReactionsCountItem } from '../types/types'
import { instance } from './api'

type GetPostsResponseType = {
  items: Array<PostType>,
  allPostsCount: number,
  cursor: string | null
}

type GetPostCommentsResponseType = {
  items: Array<PostCommentType>,
  allCommentsCount: number
}

type GetPostCommentReplyResponseType = {
  items: Array<PostCommentType>,
  allRepliesCount: number
}

type GetPostCommentResponseType = {
  comment: PostCommentType
}

type GetPostReactionsType = {
  reactions: Array<ReactionType>,
  reactionsCount: Array<ReactionsCountItem>
}

type GetPostResponseType = {
  post: PostType
}

export const profileAPI = {
  getUser: (userId: string) => instance.get<ProfileType>(`users/${userId}`),
  getUserIdByUsername: (username: string) => instance.get<string>(`users/${username}/id`),
  getUserByUsername: (username: string) => instance.get<ProfileType>(`users?username=${username}`),
  getUserAvatar: (userId: string) => instance.get<ProfileType>(`users/${userId}/avatar`),
  getUsersByIds: (ids: string) => instance.get<GetPostsResponseType>(`users?ids=${ids}`),
  getPosts: (userId: string, count: number | null, cursor: string | null, order: 'ASC' | 'DESC', commentsCount: number | null, commentsOrder: string | null) => {
    const countParam = count ? `&count=${count}` : ''
    const cursorParam = cursor ? `&cursor=${cursor}` : ''
    const orderParam = order ? `&order=${order}` : '' 
    const commentsCountParam = commentsCount ? `&comments-count=${commentsCount}` : ''
    const commentsOrderParam = commentsOrder ? `&comments-order=${commentsOrder}` : ''
    return instance.get<GetPostsResponseType>(`users/${userId}/posts?${cursorParam}${countParam}${orderParam}${commentsCountParam}${commentsOrderParam}`)
  },
  getComments: (userId: string | null, postId: string, offsetId: string | null, count: number | null, order: string | null) => {
    const offsetIdParam = offsetId ? `&offset-id=${offsetId}` : ''
    const countParam = count ? `&count=${count}` : ''
    const orderParam = order ? `&order=${order}` : ''
    return instance.get<GetPostCommentsResponseType>(
      `user-posts/${postId}/comments?${offsetIdParam}${countParam}${orderParam}`
    )
  },
  getComment: (commentId: string, repliesCount: number | null) => {
    const repliesCountParam = repliesCount ? `&replies-count=${repliesCount}` : ''
    return instance.get<GetPostCommentResponseType>(
      `user-post-comments/${commentId}?${repliesCountParam}`
    )
  },
  getReplies: (userId: string | null, commentId: string, offsetId: string | null, count: number | null) => {
    const offsetIdParam = offsetId ? `&offset-id=${offsetId}` : ''
    const countParam = count ? `&count=${count}` : ''
    return instance.get<GetPostCommentReplyResponseType>(
      `user-post-comments/${commentId}/replies?${offsetIdParam}${countParam}`
    )
  },
  getPost: (postId: string) => instance.get<GetPostResponseType>(`user-posts/${postId}`),
  getUserFullName: (interlocutorId: string) => instance.get<string>(`users/${interlocutorId}/fullname`),
  getStatus: (userId: string) => instance.get(`users/${userId}/status`),
  getProperty: (userId: string, propertyName: string) => instance.get(`users/${userId}/${propertyName}`),
  updateStatus: (userId: string, status: string) => instance.put(`users/${userId}/status`, { newValue: status }),
  getProfileSettings: (userId: string) => instance.get(`users/${userId}/settings`),
  changeLanguage: (userId: string, language: string) => instance.patch(`users/${userId}/settings`, { payload: {language: language}}),
  changeAppearance: (userId: string, appearance: number) => instance.patch(`users/${userId}/settings`, { payload: {theme: appearance} }),
  changeAvatar: (userId: string) => instance.post(`users/${userId}/avatar`),
  updateAvatar: (photo: any, x: string, y: string, width: string) => {
    let formData = new FormData()
    formData.append('photo', photo)
    //formData.append('medium', medium)
    formData.append('x', x)
    formData.append('y', y)
    formData.append('width', width)
    return instance.post(`profile-pictures`, formData, { headers: { 'Content-Type': 'multipart/form-data' }})
  },
  createPhoto: (image: any, addCreator: string, albumId: string) => {
    let formData = new FormData()
    formData.append('image', image)
    formData.append('addCreator', addCreator)
    formData.append('albumID', albumId)
    return instance.post(`photos/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  createComment: (postId: string, text: string, attachmentId: string | null, repliedId: string | null) => {
    return instance.post(`user-posts/${postId}/comments`, {
      text: text,
      replied_id: repliedId,
      attachment: attachmentId
    })
  },
  editPostReaction: (postId: string, reactionId: string, type: number) => {
    return instance.patch(`user-posts/${postId}/reactions/${reactionId}`, {
      type: type
    })
  },
  getPostReaction: (postId: string, reactionId: string) => {
    return instance.get(`user-posts/${postId}/reactions/${reactionId}`)
  },
  getPostReactions: (postId: string, offsetId: string | null, count: number | null) => {
    const offsetIdParam = offsetId ? `&offset-id=${offsetId}` : ''
    const countParam = count ? `&count=${count}` : ''
    return instance.get<GetPostReactionsType>(`user-posts/${postId}/reactions?${offsetIdParam}${countParam}`)
  },
  deletePostReaction: (postId: string, reactionId: string) => {
    return instance.delete(`user-posts/${postId}/reactions/${reactionId}`)
  },
  createPostReaction: (postId: string, type: number) => {
    return instance.post(`user-posts/${postId}/reactions`, {type: type})
  },
  createCommentReaction: (commentId: string, type: number) => {
    return instance.post(`user-post-comments/${commentId}/reactions`, {type: type})
  },
  deleteCommentReaction: (commentId: string, reactionId: string) => {
    return instance.delete(`user-post-comments/${commentId}/reactions/${reactionId}`)
  },
  editCommentReaction: (commentId: string, reactionId: string, type: number) => {
    return instance.patch(`user-post-comments/${commentId}/reactions/${reactionId}`, {
      type: type
    })
  },
  getCommentReaction: (commentId: string, reactionId: string) => {
    return instance.get(`user-post-comments/${commentId}/reactions/${reactionId}`)
  },
  getCommentReactions: (commentId: string, offsetId: string | null, count: number | null) => {
    const offsetIdParam = offsetId ? `&offset-id=${offsetId}` : ''
    const countParam = count ? `&count=${count}` : ''
    return instance.get<GetPostReactionsType>(`user-post-comments/${commentId}/reactions?${offsetIdParam}${countParam}`)
  },
  getProfilePicture: (pictureId: string) => {
    return instance.get(`profile-pictures/${pictureId}`)
  },

  createPost: (
    text: string,
    attachments: [],
    isPublic: number,
    commentingIsDisabled: number,
    reactionsAreDisabled: number,
    sharedId: string | null
  ) => {
    return instance.post(`user-posts`, {
      text: text,
      attachments: attachments,
      is_public: isPublic,
      disable_comments: commentingIsDisabled,
      disable_reactions: reactionsAreDisabled,
      shared: sharedId,
    })
  },
  editPost: (
    postId: string,
    text: string,
    attachments: [],
    disableComments: boolean,
    isPublic: boolean
  ) => {

    return instance.put(`user-posts/${postId}`, {
      text: text,
      attachments: attachments,
      is_public: +isPublic,
      disable_comments: +disableComments,
      disable_reactions: 0,
    })
  },
  patchPost: ( postId : string, property: string, value: any) => {
    return instance.patch(`user-posts/${postId}`, {
      property: property,
      value: value
    })
  },
  deletePost: (postId: string) => instance.patch(`user-posts/${postId}`, { property: 'deleted', value: 1}),
  restorePost: (postId: string) => instance.patch(`user-posts/${postId}`, { property: 'deleted', value: 0}),
  deleteComment: (commentId: string) => instance.patch(`user-post-comments/${commentId}`, { property: 'deleted', value: 1}),
  restoreComment: (commentId: string) => instance.patch(`user-post-comments/${commentId}`, { property: 'deleted', value: 0}),  
  editComment: (
    commentId: string,
    text: string,
    attachmentId: string | null
  ) => {
    return instance.put(`user-post-comments/${commentId}`, {
      text: text,
      attachment: attachmentId
    })
  },
}