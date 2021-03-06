import React from 'react'
import { makeStyles } from "@material-ui/core/styles";
import { Button, CircularProgress } from '@material-ui/core';

export const useStyles = makeStyles(theme => ({
  progress: {
    ...theme.styles.twoDimensionsCentering,
    position: 'absolute',
    top: '0', left: 0, right: 0, bottom: 0
  }
}))

const ButtonWithCircularProgress = (props) => {
  const {enableProgress, children, progressSize = 32, progressColor = 'secondary', fullWidth, ...buttonProps} = props
  const classes = useStyles()

  return (
    <div style={{width: fullWidth ? '100%' : 'auto', display: 'inline-block', position: 'relative'}}>
      <Button fullWidth={fullWidth} {...buttonProps}>
        { children }
      </Button>
      { enableProgress &&
        <div className={classes.progress}>
          <CircularProgress size={progressSize} color={progressColor}/>
        </div>
      }
    </div>
  )
}

export default ButtonWithCircularProgress