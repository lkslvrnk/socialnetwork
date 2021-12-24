import React from 'react'
import { makeStyles, MenuList, Paper, Popper } from '@material-ui/core';

const useStyles = makeStyles(theme => {
  return {
    border: {
      border: `1px solid ${theme.palette.divider}`
    }
  }
})

const PopperMenu2 = ({children, dense, ...popperProps}) => {
  const classes = useStyles();

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

export default PopperMenu2