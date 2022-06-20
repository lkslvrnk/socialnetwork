import React from 'react'
import { makeStyles } from "@material-ui/core/styles";
import { CircularProgress, IconButton } from '@material-ui/core';

export const useStyles = makeStyles(theme => ({
  progress: {
    ...theme.styles.twoDimensionsCentering,
    position: 'absolute',
    top: '0', left: 0, right: 0, bottom: 0,
  }
}))

const IconButtonWithCircularProgress = (props) => {
  const {enableProgress, children, progressColor = 'primary', size, ...buttonProps} = props
  const classes = useStyles()

  let progressSize = 0
  if(size === 'small') {
    progressSize = 30
  } else if(!size || size === 'medium') {
    progressSize = 48
  } else {
    progressSize = 48
  }

  return (
    <div
      style={{
        width: progressSize,
        height: progressSize,
        position: 'relative',
        // border: '1px solid white'
      }}
    >
      <IconButton size={size} {...buttonProps}>
        { children }
      </IconButton>

      { enableProgress && <div className={classes.progress}>
        <CircularProgress size={progressSize} color={progressColor}/>
      </div>
      }
    </div>
  )
}

export default IconButtonWithCircularProgress