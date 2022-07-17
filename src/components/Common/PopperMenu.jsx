import React from 'react'
import { MenuList, Paper, Popper } from '@material-ui/core';

const PopperMenu = ({children, dense, ...popperProps}) => {

  return (
    <Popper
      {...popperProps}
    >
      <Paper elevation={3} >
        <MenuList dense>
          {children}
        </MenuList>
      </Paper>
    </Popper>
  )
}

export default PopperMenu