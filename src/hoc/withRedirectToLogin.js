import React from 'react'
import {connect} from 'react-redux'
import { Redirect } from 'react-router-dom'

export const withRedirectToLogin = (Component) => {

    class RedirectComponent extends React.Component {
        render() {
            let {isAuth, ...restProps} = this.props

            if (!isAuth) {
                return <Redirect to="/login"/>
            }            
            return <Component {...restProps}  />
        }
    }

    let mapStateToProps = state => ({isAuth: state.auth.isAuth})
    
    return connect(mapStateToProps)(RedirectComponent)
}
