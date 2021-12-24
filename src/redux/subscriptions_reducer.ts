import { ThunkAction } from "redux-thunk"
import HttpStatusCode from "../api/HttpStatusCode"
import { AppStateType, InferActionsTypes } from "./redux_store"
import { SubscriptionType, ProfileType } from "../types/types"
import { subscriptionAPI } from "../api/subscription_api"

const SET_SUBSCRIPTIONS = 'connections/SET-SUBSCRIPTIONS'

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
    default:
      return state;
  }
}

const actions = {
  setSubscriptions: (subscriptions: Array<SubscriptionType>, count: number) => (
    { type: SET_SUBSCRIPTIONS, subscriptions, count} as const
  ),
}

export let getSubscriptionsOfUser = (userId: string, count: number, cursor: string | null): ThunkType => {
  return async (dispatch) => {
    
    let response = await subscriptionAPI.getSubscriptionsfUser(userId, count, cursor)

    if(response.status === HttpStatusCode.OK) {
      const responseData = response.data
    }
  }
}

type InitialStateType = typeof initialState
type ActionsType = InferActionsTypes<typeof actions>
type ThunkType = ThunkAction<void, AppStateType, unknown, ActionsType>

export default subscriptionsReducer;
