import { ThunkAction } from "redux-thunk"
import HttpStatusCode from "../api/HttpStatusCode"
import { AppStateType, InferActionsTypes } from "./redux_store"
import { SubscriptionType, ProfileType } from "../types/types"
import { subscriptionAPI } from "../api/subscription_api"
import { AxiosError } from "axios"

const SET_SUBSCRIPTIONS = 'subscriptions/SET-SUBSCRIPTIONS'
const SET_SUBSCRIPTION = 'subscriptions/SET-SUBSCRIPTION'

let initialState = {
  owner: null as null | ProfileType,
  subscriptions: null as Array<SubscriptionType> | null,
  allCount: null as number | null,
  cursor: null as string | null
}

const subscriptionsReducer = (state: InitialStateType = initialState, action: any): InitialStateType => {
  switch (action.type) {
    case SET_SUBSCRIPTIONS:
      return {...state, subscriptions: action.subscriptions, allCount: action.count, cursor: action.cursor}
    case SET_SUBSCRIPTION: {
      if(state.subscriptions) {
        let subscription = state.subscriptions.find(sub => sub.id === action.subscriptionId)
        if(subscription) {
          let index = state.subscriptions.indexOf(subscription)
          state.subscriptions[index] = action.subscription
  
          return {
            ...state,
            subscriptions: [...state.subscriptions]
          }
        }
      }
      return {...state}
    }
    default:
      return state;
  }
}

const actions = {
  setSubscriptions: (subscriptions: Array<SubscriptionType>, count: number) => (
    { type: SET_SUBSCRIPTIONS, subscriptions, count} as const
  ),
  setSubscription: (subscription: SubscriptionType | null) => ({type: SET_SUBSCRIPTION, subscription} as const)
}

export let createSubscription = (
  userId: string
): ThunkType => {
  return async (dispatch) => {
    try {
      let response = await subscriptionAPI.createSubscription(userId)
      if(response.status === 201) {
        await dispatch(getSubscription(response.data.id))
      }
    }
    catch (e) {
      const error = e as AxiosError
      if(error.response && error.response.status === 422) {
        let responseData = error.response.data
        
        if([33].includes(responseData.code)) {
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
      if(response.status === 200) {
        dispatch(actions.setSubscription(null))
      }
    }
    catch (e) {
      const error = e as AxiosError
      if(error.response && error.response.status === 404) {
        dispatch(actions.setSubscription(null))
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
      if(response.status === 200) {
        dispatch(actions.setSubscription(response.data.subscription))
      }
    }
    catch (e) {
      const error = e as AxiosError
      if(error.response && error.response.status === 404) {
        dispatch(actions.setSubscription(null))
      } 
    }
  }
}

export let getSubscriptionsOfUser = (userId: string, count: number, cursor: string | null): ThunkType => {
  return async (dispatch) => {
    
    let response = await subscriptionAPI.getSubscriptionsfUser(userId, count, cursor)

    if(response.status === HttpStatusCode.OK) {
      // const responseData = response.data
    }
  }
}

type InitialStateType = typeof initialState
type ActionsType = InferActionsTypes<typeof actions>
type ThunkType = ThunkAction<void, AppStateType, unknown, ActionsType>

export default subscriptionsReducer;
