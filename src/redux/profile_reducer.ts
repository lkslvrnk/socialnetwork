
import { profileAPI } from '../api/profile_api'
import { stopSubmit } from 'redux-form'
import {
  ProfileType, PostType, PhotoType, ConnectionType,
  SubscriptionType, ProfileCoverType
} from '../types/types'
import { ThunkAction } from 'redux-thunk'
import { AppStateType, InferActionsTypes } from './redux_store'
import { connectionAPI } from '../api/connection_api'
import { setProfilePicture } from './auth_reducer'
import { subscriptionAPI } from '../api/subscription_api'
import {
  cleanProfilePosts, setPostsOwnerAndAllCount
} from './profile_posts_reducer'
import { AxiosError } from 'axios'

const SET_USER_PROFILE = 'profile/SET-USER-PROFILE'
const SET_STATUS = 'profile/SET-STATUS';
const CLEAN_PROFILE = 'profile/CLEAN-PROFILE';
const SET_CONNECTION = 'profile/SET-CONNECTION'
const ACCEPT_CONNECTION = 'profile/ACCEPT-CONNECTION'
const SET_SUBSCRIPTION = 'profile/SET-SUBSCRIPTION'
const SET_COVER = 'profile/SET-COVER'

let initialState = {
  profile: null as ProfileType | null,
  profileLoaded: false,
  posts: [] as Array<PostType>,
  postsLoaded: false,
  postsCursor: null as string | null,
  newPostText: '',
  newPostPhotos: [] as Array<PhotoType>,
  newPostForm: { error: '' },
  commentPhotos: []
}

const profileReducer = (
  state: InitialStateType = initialState, action: ActionsType
): InitialStateType => {
  switch (action.type) {
    case ACCEPT_CONNECTION: {
      if (state.profile) {
        if (state.profile.connection) {
          state.profile.connection.isAccepted = true
          state.profile = { ...state.profile }
        }
      }
      return { ...state }
    }
    case SET_CONNECTION: {
      if (state.profile) {
        state.profile.connection = action.connection
        state.profile = { ...state.profile }
      }
      return { ...state }
    }
    case SET_SUBSCRIPTION: {
      if (state.profile) {
        state.profile.subscription = action.subscription
        state.profile = { ...state.profile }
      }
      return { ...state }
    }
    case SET_USER_PROFILE: {
      return { ...state, profile: action.profile, profileLoaded: true }
    }
    case SET_STATUS: {
      return {
        ...state,
        profile: state.profile
          ? { ...state.profile, status: action.status } : null
      }
    }
    case CLEAN_PROFILE: {
      return {
        ...state, profileLoaded: false,
        postsLoaded: false, posts: [], profile: null
      }
    }
    case SET_COVER: {
      if (state.profile && state.profile.id === action.cover.creator.id) {
        return { ...state, profile: { ...state.profile, cover: action.cover } }
      }
      return { ...state }
    }
    default:
      return state
  }
}

export const actions = {
  setUserProfile: (profile: ProfileType | null) => ({
    type: SET_USER_PROFILE, profile: profile
  } as const),
  setStatus: (status: string) => ({
    type: SET_STATUS, status: status
  } as const),
  cleanProfile: () => ({ type: CLEAN_PROFILE } as const),
  setConnection: (connection: ConnectionType | null) => ({
    type: SET_CONNECTION, connection
  } as const),
  acceptConnection: () => ({ type: ACCEPT_CONNECTION } as const),
  setSubscription: (subscription: SubscriptionType | null) => ({
    type: SET_SUBSCRIPTION, subscription
  } as const),
  setCover: (cover: ProfileCoverType) => ({
    type: SET_COVER, cover
  } as const)
}
export let cleanProfile = (): ThunkType => {
  return async (dispatch) => {
    dispatch(cleanProfilePosts())
    dispatch(actions.cleanProfile())
  }
}

export let getProfilePicture = (pictureId: string): ThunkType => {
  return async (dispatch) => {
    try {
      let response = await profileAPI.getProfilePicture(pictureId)
      if (response.status === 200) {
        dispatch(setProfilePicture(
          response.data.picture.versions['cropped_medium']
        ))
      }
      return response
    }
    catch (e) {
      // const error = e as AxiosError
    }
  }
}

export let getUserById = (userId: string): ThunkType => {
  return async (dispatch) => {
    try {
      let response = await profileAPI.getUser(userId)
      if (response.status === 200) {
        dispatch(actions.setUserProfile({ ...response.data }))
        let id = response.data.id
        let allPostsCount = response.data.postsCount
        dispatch(setPostsOwnerAndAllCount(id, allPostsCount))
      }
      return response
    }
    catch (e) {
      const error = e as AxiosError
      if (error.response && error.response.status === 404) {
        dispatch(actions.setUserProfile(null));
      }
    }
  }
}

export let getUserByUsername = (username: string): ThunkType => {
  return async (dispatch) => {
    try {
      let response = await profileAPI.getUserByUsername(username)
      if (response.status === 200) {
        dispatch(actions.setUserProfile({ ...response.data }));
      }
      return response
    }
    catch (e) {
      const error = e as AxiosError
      if (error.response && error.response.status === 404) {
        dispatch(actions.setUserProfile(null));
      }
    }
  }
}

export let updateAvatar = (
  photo: any, x: string, y: string, width: string, userId: string
): ThunkType => {
  return async (dispatch) => {
    let response = await profileAPI.updateAvatar(photo, x, y, width)
    if (response.status === 201) {
      dispatch(cleanProfile())
      dispatch(getUserById(userId))
      dispatch(getProfilePicture(response.data.id))
    }
  }
}

export let updateCover = (
  photo: any, x: string, y: string, width: string, userId: string
): ThunkType => {
  return async (dispatch) => {
    let response = await profileAPI.createCover(photo, x, y, width)
    if (response.status === 201) {
      let coverResp = await profileAPI.getProfileCover(response.data.id)
      dispatch(actions.setCover(coverResp.data.cover))
    }
  }
}

export let createPhoto = (image: any): ThunkType => async (dispatch) => {
  let response = await profileAPI.createPhoto(image, '0', '-1')
  return response
}

export let updateStatus = (userId: string, status: string): ThunkType => {
  return async (dispatch) => {
    const response = await profileAPI.updateStatus(userId, status)

    if (response.status === 200) {
      dispatch(actions.setStatus(status))
    } else {
      let errorText = 'hz_' + response.status
      if (response.status === 404) {
        errorText = 'not found'
      }
      dispatch(stopSubmit('statusForm', { 'status': errorText }))
    }
  }
}

export let createConnection = (
  userId: string,
  subscribe: number
): ThunkType => {
  return async (dispatch) => {
    try {
      let response = await connectionAPI.createConnection(userId, subscribe)
      if (response.status === 201) {
        let getResponse = await connectionAPI.getConnection(response.data.id)
        if (getResponse.status === 200) {
          dispatch(actions.setConnection(getResponse.data.connection))
        }
      }
    }
    catch (e) {
      const error = e as AxiosError
      if (error.response && error.response.status === 422) {
        let responseData = error.response.data

        if ([22, 23, 24].includes(responseData.code)) {
          await dispatch(getConnection(responseData.connection_id))
        }
      }
    }
  }
}

export let createSubscription = (
  userId: string
): ThunkType => {
  return async (dispatch) => {
    try {
      let response = await subscriptionAPI.createSubscription(userId)
      if (response.status === 201) {
        await dispatch(getSubscription(response.data.id))
      }
    }
    catch (e) {
      const error = e as AxiosError
      if (error.response && error.response.status === 422) {
        let responseData = error.response.data

        if ([33].includes(responseData.code)) {
          await dispatch(getSubscription(responseData.subscription_id))
        }
      }
    }
  }
}

export let deleteSubscription = (
  subscriptionId: string
): ThunkType => {
  return async (dispatch) => {
    try {
      let response = await subscriptionAPI.deleteSubscription(subscriptionId)
      if (response.status === 200) {
        dispatch(actions.setSubscription(null))
      }
    }
    catch (e) {
      const error = e as AxiosError
      if (error.response) {
        if (error.response.status === 404) {
          dispatch(actions.setSubscription(null))
        }
      }
    }
  }
}

export let acceptConnection = (
  connectionId: string
): ThunkType => {
  return async (dispatch) => {
    try {
      let response = await connectionAPI.acceptConnection(connectionId)
      if (response.status === 200) {
        dispatch(actions.acceptConnection())
      }
    }
    catch (e) {
      const error = e as AxiosError
      if (error.response) {
        if (error.response.status === 404) {
          dispatch(actions.setConnection(null))
        }
        else if (error.response.status === 422 && error.response.data.code === 222) {
          dispatch(actions.acceptConnection())
        }
      }

    }
  }
}

export let getConnection = (
  connectionId: string
): ThunkType => {
  return async (dispatch) => {
    try {
      let response = await connectionAPI.getConnection(connectionId)
      if (response.status === 200) {
        dispatch(actions.setConnection(response.data.connection))
      }
    }
    catch (e) {
      const error = e as AxiosError
      if (error.response && error.response.status === 404) {
        dispatch(actions.setConnection(null))
      }
    }
  }
}

export let getSubscription = (
  subscriptionId: string
): ThunkType => {
  return async (dispatch) => {
    try {
      let response = await subscriptionAPI.getSubscription(subscriptionId)
      if (response.status === 200) {
        dispatch(actions.setSubscription(response.data.subscription))
      }
    }
    catch (e) {
      const error = e as AxiosError
      if (error.response && error.response.status === 404) {
        dispatch(actions.setSubscription(null))
      }
    }
  }
}

export let deleteConnection = (
  connectionId: string
): ThunkType => {
  return async (dispatch) => {
    try {
      let response = await connectionAPI.deleteConnection(connectionId)
      if (response.status === 200) {
        dispatch(actions.setConnection(null))
      }
    }
    catch (e) {
      const error = e as AxiosError
      if (error.response && error.response.status === 404) {
        dispatch(actions.setConnection(null))
      }
    }
  }
}

type InitialStateType = typeof initialState
type ActionsType = InferActionsTypes<typeof actions>
type ThunkType = ThunkAction<void, AppStateType, unknown, ActionsType>

export default profileReducer