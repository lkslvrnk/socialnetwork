import React from 'react'
import { Typography } from '@material-ui/core';
import { NavLink } from 'react-router-dom';

const TextLink = props => {
  const {children, to, color, variant} = props

  return (
    <NavLink
      to={to}
      children={
        <Typography
          variant={variant}
          color={color ? color : 'textPrimary'}
        >
          {children}
        </Typography>
      }
    />
  )
}

export default TextLink