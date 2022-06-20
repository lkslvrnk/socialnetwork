import React from 'react'
import CircularProgress from '@material-ui/core/CircularProgress';

const Preloader = (props) => {
    return <CircularProgress size={props.size} color={props.color} style={{display: 'block'}}/>
}

export default Preloader
