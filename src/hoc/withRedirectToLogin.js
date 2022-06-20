import React from 'react'
import {connect} from 'react-redux'
import { Redirect } from 'react-router-dom'

export const withRedirectToLogin = (Component) => {

    class RedirectComponent extends React.Component {
        render() {
            let {id, ...restProps} = this.props
            // console.log(id)
            if (!id) {
                return <Redirect to="/login"/>
            }            
            return <Component {...restProps}  />
        }
    }

    let mapStateToProps = state => ({id: state.auth.id})
    
    return connect(mapStateToProps)(RedirectComponent)
}
