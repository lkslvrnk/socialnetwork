import React from 'react'
import { NavLink } from 'react-router-dom';
import { useTheme } from '@material-ui/core';

const StyledNavLink = props => {
  const {children, to} = props
  const theme = useTheme()

  return (
    <NavLink
      to={to}
      children={ children }
      style={{ color: theme.palette.text.primary }}
    />
  )
}

export default StyledNavLink