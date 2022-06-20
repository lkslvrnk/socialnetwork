import { ThunkAction } from "redux-thunk"
import { profileAPI } from "../api/profile_api"
import HttpStatusCode from "../api/HttpStatusCode"
import { me } from "./auth_reducer"
import { AppStateType, InferActionsTypes } from "./redux_store"
import { loadUnreadChats } from "./chats_reducer"
import { createUlidId } from "../components/Chats/helperChatFunctions"


const INITIALIZED_SUCCESS = 'app/INITIALIZED_SUCCESS'
const SET_PRELOADER = 'app/SET-PRELOADER'
const SET_PROFILE_SETTINGS = 'app/SET_PROFILE_SETTINGS'
const SET_LANGUAGE = 'app/SET-LANGUAGE'
const SET_COMMON_ERROR = 'app/SET-COMMON-ERROR'
const SET_APPEARANCE = 'app/SET-APPEARANCE'
const SET_PAGE_ID = 'app/SET-PAGE-ID'
const CLEAN_SETTINGS = 'app/CLEAN-SETTINGS'
const SET_IS_ONLINE = 'app/SET-IS-ONLINE'

let navigatorLanguage = navigator.language.split('-')[0]
let language: string = localStorage.language || navigatorLanguage

if(!localStorage.language) {
  if(['en', 'ru', 'uk'].includes(language)) {
    localStorage.setItem('language', language)
  } else {
    localStorage.setItem('language', 'ru')
  }
}

let initialState = {
  initialized: false,
  preloader: null as boolean | null,
  language: language,
  commonError: null as string | null,
  appearance: 1,
  isOnline: true as boolean,
  windowId: createUlidId()
}

const appReducer = (state: InitialStateType = initialState, action: ActionsType): InitialStateType => {
  switch (action.type) {
    case INITIALIZED_SUCCESS: {
      return {...state, initialized: true}
    }
    case SET_IS_ONLINE: {
      return { ...state, isOnline: action.isOnline }
    }
    case SET_PRELOADER: {
      return { ...state, preloader: action.flag }
    }
    case SET_PROFILE_SETTINGS:
      return { ...state, ...action.settings }
    case SET_LANGUAGE:
      console.log(action)
      return { ...state, language: action.language }
    case SET_APPEARANCE:  
      return { ...state, appearance: action.appearance }
    case SET_COMMON_ERROR:
      return { ...state, commonError: action.error }
    case CLEAN_SETTINGS:
      return { ...state, language: localStorage.language || navigator.language}
    default:
      return state;
  }
}

export const actions = {
  initializedSuccess: () => ({ type: INITIALIZED_SUCCESS } as const),
  togglePreloader: (flag: boolean)  => ({ type: SET_PRELOADER, flag: flag } as const),
  setPageId: (pageId: string) => ({ type: SET_PAGE_ID, pageId: pageId } as const),
  setCommonError: (error: string) => ({ type: SET_COMMON_ERROR, error: error} as const),
  setLanguage: (language: string) => ({ type: SET_LANGUAGE, language: language } as const),
  setAppearance: (appearance: number) => ({ type: SET_APPEARANCE, appearance: appearance } as const),
  setSettings: (language: string, appearance: number) => ({ type: SET_PROFILE_SETTINGS, settings: { language, appearance }} as const),
  cleanSettings: () => ({type: CLEAN_SETTINGS} as const),
  setIsOnline: (isOnline: boolean) => ({type: SET_IS_ONLINE, isOnline} as const)
}

export const setCommonError = (error: string): ThunkType => {
  return (dispatch) => {
    dispatch(actions.setCommonError(error))
  }
}

export const changeLanguage = (id: string, language: string): ThunkType => {
  return (dispatch) => {
    return profileAPI.changeLanguage(id, language).then((response: any) => {
      if(response.status === HttpStatusCode.OK) {
        dispatch(actions.setLanguage(language))
      }
    })
  }
}

export const changeGuestLanguage = (language: string): ThunkType => {
  return (dispatch) => {
    localStorage.setItem('language', language)
    dispatch(actions.setLanguage(language))
  }
}

export const changeAppearance = (userID: string, appearance: boolean): ThunkType => {
  return async (dispatch) => {
    
    let appearanceNumber = appearance ? 1 : 0
    return profileAPI.changeAppearance(userID, appearanceNumber).then((response: any) => {
      if(response.status === HttpStatusCode.OK) {
        dispatch(actions.setAppearance(appearanceNumber))
      }
    })
  }
}

export let getUserSettings = (id: string): ThunkType => {
  return async (dispatch) => {
    let response = await profileAPI.getProfileSettings(id);
    if(response.status === HttpStatusCode.OK) {
      const responseData = response.data
      const language = responseData.language
      const appearance = responseData.theme
      dispatch(actions.setSettings(language, appearance))
    }
  }
}

export const cleanSettings = (): ThunkType => {
  return async (dispatch) => {
    dispatch(actions.cleanSettings())
  }
}

export const initializeApp = (): ThunkType => {
  return async (dispatch, getState) => {                                  
    try {
      await dispatch(me())
      const userId = getState().auth.id
      if(userId) {
        await dispatch(getUserSettings(userId))
        await dispatch(loadUnreadChats())
      }
      dispatch(actions.initializedSuccess());
    }
    catch(err) {
      console.log(err)
    }
   }
}

type InitialStateType = typeof initialState
type ActionsType = InferActionsTypes<typeof actions>
type ThunkType = ThunkAction<void, AppStateType, unknown, ActionsType>

export default appReducer;
