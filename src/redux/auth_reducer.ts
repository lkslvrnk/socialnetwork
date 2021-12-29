import { authAPI } from '../api/auth_api'
import { stopSubmit } from 'redux-form'
import { AppStateType, InferActionsTypes } from './redux_store'
import { ThunkAction } from 'redux-thunk'
import HttpStatusCode from '../api/HttpStatusCode'
import { cleanSettings, getUserSettings } from './app_reducer'
import { AxiosError } from 'axios'

const SET_USER_DATA = 'auth/SET-USER-DATA'
const SET_PICTURE = 'auth/SET-PICTURE'

let initialState = {
  id: null as string | null,
  username: null as string | null,
  email: null as string | null,
  avatar: null as string | null,
  expiresIn: null as number | null,
  currentLanguage: 'ru',
  isAuth: false
}

const authReducer = (state: InitialStateType = initialState, action: ActionsType): InitialStateType => {
  switch (action.type) {       
    case SET_USER_DATA:
      return {...state, ...action.data}
    case SET_PICTURE:
      return {...state, avatar: action.picture}
    default:
      return state
  }
}

const actions = {
  setUserData: (data: any, isAuth: boolean) => ({
    type: SET_USER_DATA,
    data: {...data, isAuth}
  } as const),
  setProfilePicture: (picture: string) => ({
    type: SET_PICTURE,
    picture: picture
  } as const),
}

export let signUp = (
  email: string,
  password: string,
  repeatedPassword: string,
  firstName: string,
  lastName: string,
  username: string,
  gender: string,
  birthday: string,
  language: string,
): ThunkType => {
  return async (dispatch: any) => {

    try {
      await authAPI.signUp(email, password, repeatedPassword, firstName, lastName, username, gender, birthday, language)
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
      if(response.status === HttpStatusCode.CREATED) {
        localStorage.setItem('JWT', response.data.jwt)
        await dispatch(me())
        dispatch(getUserSettings(state().auth.id))
      }
    } catch(err) {
      if(err && err.response && err.response.status === 403) {
        const errors = err.response.data.errors
        dispatch(stopSubmit('login', {_error: errors}))
      } else if(!err.response) {
        dispatch(stopSubmit('login', {_error: 'Неизвестная ошибка'}))
      }
      return err
    }
  }
}

export let logOut = (history: any): ThunkType => {
  return async (dispatch) => {
    authAPI.removeJWT()
    localStorage.removeItem('pendingMessages')
    dispatch(actions.setUserData({id: null, email: null, avatar: null, expiresIn: null}, false))
    dispatch(cleanSettings())
    // history.push('/login')
  }
}

export let me = (): ThunkType => {
  return async (dispatch) => {
    let response = await authAPI.me()
    if(response && response.status === HttpStatusCode.OK && response.data.id) {
      dispatch(actions.setUserData(response.data, true))
    } else {
      dispatch(actions.setUserData({id: null, email: null, avatar: null}, false))
    }

    return response
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

