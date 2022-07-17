import { makeStyles, Paper, Typography } from '@material-ui/core';
import React from 'react';

export const useStyles = makeStyles(theme => {
  return {
    emptyList: {
      padding: theme.spacing(2),
      flexDirection: 'column',
      display: 'flex',
      alignItems: 'center'
    },
  }
})

type EmptyListStubPropsType = {
  imageSrc: string,
  containerWidth: number,
  containerHeight: number,
  text: string
}

const EmptyListStub: React.FC<EmptyListStubPropsType> = React.memo((props: EmptyListStubPropsType) => {
  const {imageSrc, containerWidth, containerHeight, text} = props

  const classes = useStyles();

  return (
    <Paper className={classes.emptyList}>
      <div
        style={{
          width: containerWidth,
          height: containerHeight,
          backgroundImage: `url(${imageSrc})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
      </div>
      <Typography variant='h6' >
        { text }
      </Typography>
    </Paper>
  )
})

export default EmptyListStub
