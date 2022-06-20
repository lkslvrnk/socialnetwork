import React from 'react'
import { Typography } from '@material-ui/core';

const SimpleText = props => {
  const {children, bold, color} = props

  return (
    <Typography
      variant={'body2'}
      color={color}
      style={{
        fontWeight: bold ? 600 : 400
      }}
    >
      {children}
    </Typography>
  )
}

export default SimpleText