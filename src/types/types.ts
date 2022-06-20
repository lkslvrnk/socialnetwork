export type ContactsType = {
  github: string
  vk: string
  facebook: string
  instagram: string
  twitter: string
  website: string
  youtube: string
  mainLink: string
}

export type ContentLinkType = {
  name: string
  path: string
  component: any
}

export type MessageType = {
  id: string
  text: string
  creatorId: string
  creatorName: string
  timestamp: number
}

export type PostType = {
  id: string
  text: string
  creator: PhotoCreatorType
  creatorId: string
  creatorName: string
  creatorAvatar: string
  photos: Array<PhotoType>
  isDeleted: boolean
  timestamp: number
  commentingIsDisabled: boolean
  comments: Array<PostCommentType>
  commentsCount: number
  offsetCommentId: string | null
  newComments: Array<PostCommentType> | null
  isPublic: boolean
  reactions: Array<ReactionType>
  requesterReaction: ReactionType | null
  reactionsCount: Array<ReactionsCountItem>
  reactionsAreDisabled: boolean
  shared: object | null
  attachments: []
  postsCount: number
}

export type ProfilePostType = {
  id: string
  text: string
  creator: PhotoCreatorType
  creatorId: string
  creatorName: string
  creatorAvatar: string
  photos: Array<PhotoType>
  isDeleted: boolean
  timestamp: number
  commentingIsDisabled: boolean
  comments: Array<PostCommentType>
  commentsCount: number
  offsetCommentId: string | null
  newComments: Array<PostCommentType> | null
  isPublic: boolean
  reactions: Array<ReactionType>
  requesterReaction: ReactionType | null
  reactionsCount: Array<ReactionsCountItem>
  reactionsAreDisabled: boolean
  shared: object | null
  attachments: []
  postsCount: number
}

export type PostCommentType = {
  creator: PhotoCreatorType
  id: string
  timestamp: number
  text: string
  repliesCount: number
  replies: Array<PostCommentType>
  newReplies: Array<PostCommentType> | null
  offsetReplyId: string | null
  deleted: boolean
  requesterReaction: ReactionType | null
  reactions: Array<ReactionType>
  reactionsCount: Array<ReactionsCountItem>
  replied: PostCommentType | null,
  attachment: any
}

export type ReactionsCountItem = {
  type: number
  count: number
}

export type ReactionType = {
  creator: PhotoCreatorType
  id: string
  timestamp: number
  type: number
}

export type AlbumType = {
  id: string
  name: string
}

export type PhotoType = {
  creator: PhotoCreatorType
  album: AlbumType
  id: string
  src: string
  timestamp: number
  width: number
  height: number
}

export type ProfilesRelationshipsType = {
  isOwnProfile: boolean
  requesterIsGuest: boolean
  usersAreFriends: boolean
  requesterIsSubscriber: boolean
  requestedIsSubscriber: boolean
  receivedFriendshipOffer: boolean
  offeredFriendship: boolean
  friendshipId: string | null
  requestedUserIsBanned: boolean
}

export type ProfileDetailedInfoType = {
  birthday: string
  gender: string
  city: string
  country: string,
  languages: Array<string>
}

export type ProfilePrivacyType = {
  closed: boolean
  isAcceptsMessages: boolean
  isAcceptsFriendship: boolean
  hiddenFriends: boolean
  audios: boolean
  videos: boolean
  groups: boolean
  detailedInfo: boolean
  notUserPosts: boolean
  comments: boolean
  post: boolean
  comment: boolean
}

export type ProfileType = {
  id: string
  avatar: PhotoType | null
  status: string
  firstName: string
  lastName: string
  birthday: object | null
  gender: string | null
  city: string | null
  country: string | null
  connection: null | ConnectionType
  subscription: null | SubscriptionType
  banned: boolean
  acceptMessages: boolean
  picture: ProfilePictureType | null
  cover: ProfileCoverType | null
  username: string
  acceptedConnections: Array<ConnectionType>
  allAcceptedConnections: number
  postsCount: number
  pictures: Array<ProfilePictureType>
  covers: Array<ProfileCoverType>
}

export type ProfilePictureType = {
  id: string
  creator: PhotoCreatorType
  timestamp: number
  versions: PictureVersionsType
}

export type ProfileCoverType = {
  id: string
  creator: PhotoCreatorType
  timestamp: number
  versions: PictureVersionsType
}

export type SimplePhotoType = {
  id: string
  src: string
}

export type PictureVersionsType = {
  cropped_large: string
  cropped_medium: string
  cropped_small: string
  extra_small: string
  large: string
  medium: string
  original: string
  small: string
}

export type ConnectionType = {
  id: string
  initiator: UserType
  target: UserType
  isAccepted: boolean
  deleted: boolean
  createdAt: number
}

export type ContactType = {
  id: string
  username: string
  picture: string | null
  firstname: string
  lastname: string
}

export type SubscriptionType = {
  id: string
  subscriber: UserType
  user: UserType 
  pauseDurationInDays: null | number
  pauseEnd: null | number
  pauseStart: null | number
}

export type UserType = {
  id: string
  firstName: string
  lastName: string
  picture: string
  username: string
}

export type UserDataType = {
  id: string
  firstName: string
  lastName: string
  email: string
  picture: string | null
  username: string
}

export type PhotoCreatorType = {
  id: string
  firstName: string
  lastName: string
  avatar: string
  username: string
}