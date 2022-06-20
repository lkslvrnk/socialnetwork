import { authAPI } from '../api/auth_api'
import { stopSubmit } from 'redux-form'
import { AppStateType, InferActionsTypes } from './redux_store'
import { ThunkAction } from 'redux-thunk'
import HttpStatusCode from '../api/HttpStatusCode'
import { cleanSettings, getUserSettings } from './app_reducer'
import { AxiosError } from 'axios'
import { connectionAPI } from '../api/connection_api'
import { profileAPI } from '../api/profile_api'
import { clean, loadUnreadChats } from './chats_reducer'
import { UserDataType, UserType } from '../types/types'
import { createUser } from '../components/Chats/helperChatFunctions'

const SET_USER_DATA = 'auth/SET-USER-DATA'
const SET_PICTURE = 'auth/SET-PICTURE'
const CLEAN_USER_DATA = 'auth/CLEAN-USER-DATA'
const SET_LAST_REQUESTS_CHECK = 'auth/SET-LAST-REQUESTS-CHECK'
const INCREMENT_NEW_REQUESTS_COUNT = 'auth/INCREMENT-NEW-REQUESTS-COUNT'
const SET_NEW_REQUESTS_COUNT = 'auth/SET-NEW-REQUESTS-COUNT'

let initialState = {
  userData: null as UserDataType | null,
  id: null as string | null,
  username: null as string | null,
  firstName: null as string | null,
  lastName: null as string | null,
  email: null as string | null,
  avatar: null as string | null,
  lastRequestsCheck: 0 as number,
  newRequestsCount: 0 as number,
  expiresIn: null as number | null,
  currentLanguage: 'ru',
  isAuth: false
}

const authReducer = (state: InitialStateType = initialState, action: ActionsType): InitialStateType => {
  switch (action.type) {
    case SET_USER_DATA:
      console.log()
      return {
        ...state,
        ...action.userData,
        avatar: action.userData.picture,
        lastRequestsCheck: action.lastRequestsCheck,
        newRequestsCount: action.newRequestsCount,
        userData: action.userData
      }
    case SET_LAST_REQUESTS_CHECK:
      return {
        ...state,
        lastRequestsCheck: action.lastRequestsCheck,
        newRequestsCount: 0
      }
    case INCREMENT_NEW_REQUESTS_COUNT: {
      return {
        ...state,
        newRequestsCount: state.newRequestsCount + 1
      }
    }
    case SET_NEW_REQUESTS_COUNT: {
      return {
        ...state,
        newRequestsCount: action.count
      }
    }
    case SET_PICTURE:
      return {...state, avatar: action.picture}
    case CLEAN_USER_DATA:
      return {...state,
        avatar: null,
        isAuth: false,
        id: null,
        username: null,
        email: null,
        expiresIn: null,
        userData: null
      }
    default:
      return state
  }
}

export const actions = {
  setUserData: (userData: UserDataType, isAuth: boolean, lastRequestsCheck: number, newRequestsCount: number) => ({
    type: SET_USER_DATA,
    userData: {...userData, isAuth},
    lastRequestsCheck,
    newRequestsCount
  } as const),
  cleanUserData: () => ({
    type: CLEAN_USER_DATA
  } as const),
  setProfilePicture: (picture: string) => ({
    type: SET_PICTURE,
    picture
  } as const),
  setLastRequestsCheck: (lastRequestsCheck: number) => ({
    type: SET_LAST_REQUESTS_CHECK,
    lastRequestsCheck
  } as const),
  incrementNewRequestsCount: () => ({
    type: INCREMENT_NEW_REQUESTS_COUNT
  } as const),
  setNewRequestsCount: (count: number) => ({
    type: SET_NEW_REQUESTS_COUNT,
    count
  } as const)
}

export let signUp = (
  email: string,
  password: string,
  repeatedPassword: string,
  firstName: string,
  lastName: string,
  username: string,
  sex: string,
  birthday: string,
  language: string,
): ThunkType => {
  return async (dispatch: any) => {

    try {
      await authAPI.signUp(email, password, repeatedPassword, firstName, lastName, username, sex, birthday, language)
    } catch (e) {
      const err = e as AxiosError
      if(err.response) {
        const status = err.response.status
        if(status === HttpStatusCode.FORBIDDEN) {
          const errors = err.response.data.errors
          dispatch(stopSubmit('signup', {_error: errors}))
        } else if(status === HttpStatusCode.CONFLICT) {
          const code = err.response.data.code
          if(code === 70) {
            dispatch(stopSubmit('signup', {email: 'Email taken'}))
          } else if(code === 71) {
            dispatch(stopSubmit('signup', {nickname: 'Nickname taken'}))
          } else if(code === 72) {
            dispatch(stopSubmit('signup', {_error: 'Email or nickname taken'}))
          }
        }
      }
      else {
        dispatch(stopSubmit('signup', {_error: 'Error'}))
      }
      throw err
    }
  }
}

export let logIn = (email: string, password: string): ThunkType => {
  return async (dispatch: any, state: any) => {

    try {
      let response = await authAPI.logIn(email, password)
      // console.log(response)
      if(response.status === HttpStatusCode.CREATED) {
        localStorage.setItem('JWT', response.data.jwt)
        await dispatch(me())
        await dispatch(getUserSettings(state().auth.id))
        dispatch(loadUnreadChats())
      }
    } catch(err) {
      if(err && err.response && err.response.status === 403) {
        const errors = err.response.data.errors
        dispatch(stopSubmit('login', {_error: 'Wrong email or password'}))
      } else if(!err.response) {
        dispatch(stopSubmit('login', {_error: 'Unknown error'}))
      }
      throw err
    }
  }
}

export let logOut = (history: any): ThunkType => {
  return async (dispatch) => {
    authAPI.removeJWT()
    // localStorage.removeItem('pendingMessages')
    dispatch(actions.cleanUserData())
    dispatch(clean())
    dispatch(cleanSettings())
    // history.push('/login')
  }
}

export let me = (): ThunkType => {
  return async (dispatch) => {
    try {
      let response = await authAPI.me()
      if(response.status === HttpStatusCode.OK && response.data.id) {
        let requestsResponse = await connectionAPI.getConnectionsOfUser(response.data.id, 0, null, 'incoming', true, false, response.data.lastRequestsCheck)
        if(requestsResponse.status === 200) {
          const respData = response.data
          const userData: UserDataType = {
            id: respData.id,
            firstName: respData.firstName,
            lastName: respData.lastName,
            email: respData.email,
            picture: respData.picture,
            username: respData.username
          }
          dispatch(actions.setUserData(userData, true, response.data.lastRequestsCheck, requestsResponse.data.allCount))
        }
      }
    } catch (e) {
      dispatch(actions.cleanUserData())
    }
    
  }
}

export const getNewRequestsCount = (userId: string): ThunkType => {
  return async (dispatch, getState) => {
    try {
      let response = await connectionAPI.getConnectionsOfUser(userId, 0, null, 'incoming', true, false, getState().auth.lastRequestsCheck)
      dispatch(actions.setNewRequestsCount(response.data.allCount))
    } catch (e) {
      dispatch(actions.cleanUserData())
    }
    
  }
}

export const checkRequests = (userId: string): ThunkType => {
  return async (dispatch) => {
    try {
      let response = await profileAPI.patch(userId, {'last_requests_check': "now"})
      if(response.status === HttpStatusCode.OK) {
        dispatch(actions.setLastRequestsCheck(Date.now()))
      }
    } catch (e) {
      dispatch(actions.cleanUserData())
    }
    
  }
}

export let facebookLogIn = (): ThunkType => {
  return async (dispatch) => {
    authAPI.setJWT()
    dispatch(me())
  }
}

export let setProfilePicture = (picture: string): ThunkType => {
  return async (dispatch) => {
    return dispatch(actions.setProfilePicture(picture))
  }
}

type InitialStateType = typeof initialState
type ActionsType = InferActionsTypes<typeof actions>
type ThunkType = ThunkAction<Promise<any>, AppStateType, unknown, ActionsType>

export default authReducer

