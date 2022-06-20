import React from 'react'
import { makeStyles } from "@material-ui/core/styles";
import { CircularProgress, MenuItem } from '@material-ui/core';

export const useStyles = makeStyles(theme => ({
  root: {
    position: 'relative'
  },
  progress: {
    ...theme.styles.twoDimensionsCentering,
    position: 'absolute',
    top: '0', left: 0, right: 0, bottom: 0
  }
}))

export default (props) => {
  const {enableProgress, children, progressSize, ...rest} = props

  const classes = useStyles()

  return (
    <div className={classes.root} >
      <MenuItem {...rest}  >
        { children }
      </MenuItem>
      { enableProgress && 
        <div className={classes.progress} >
          <CircularProgress
            color='secondary'
            size={ progressSize }
          />
        </div>
      }
    </div>
  )
}