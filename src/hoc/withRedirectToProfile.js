import React from 'react'
import {connect} from 'react-redux'

export const withRedirectToProfile = (Component) => {

  const RedirectComponent = props => {
    return <Component />
  }

  return connect(state => (
    {
      isAuth: state.auth.isAuth,
      userId: state.auth.id
    }
  ))(RedirectComponent)
}