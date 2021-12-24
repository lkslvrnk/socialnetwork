import React from 'react'
import {connect} from 'react-redux'

export const withRedirectToLogin = (Component) => {

    class RedirectComponent extends React.Component {
        render() {
            return <Component {...this.props} fromLogin='qweqwe' />
        }
    }

    let mapStateToProps = state => ({isAuth: state.auth.isAuth})
    
    return connect(mapStateToProps)(RedirectComponent)
}
