import React from 'react'
import { Typography } from '@material-ui/core';
import { NavLink } from 'react-router-dom';

const TypographyLink = props => {
  const {children, color, ...restProps} = props

  let textColor = color || 'textPrimary' // Если color не передан в пропсах, то делаем цвет текста textPrimary, чтобы текст не был синим

  return (
    <Typography
      color={textColor}
      {...restProps}
      component={NavLink}
    >
      {children}
    </Typography>
  )
}

export default TypographyLink