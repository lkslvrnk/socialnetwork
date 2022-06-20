import { Divider, Paper } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import React from 'react';
import { useStyles } from './ChatStyles';

const ChatSkeleton = () => {
  const classes = useStyles();

  return (
    <Paper className={classes.container} >
      <header className={classes.header} >
        <div style={{marginLeft: 8}}>
          <Skeleton  variant='circle' height={30} width={30} />
        </div>
        <Skeleton style={{marginLeft: 8, marginRight: 8}} variant='circle' height={40} width={40} />
        <Skeleton variant='text' height={25} width={150} />
      </header>
      <Divider />
      <div style={{marginBottom: 5}} className={classes.dialogueBody} >
        {[{n:3,w:200},{n:4,w:250},{n:5,w:100},{n:6,w:150},{n:7,w:150}].map((m, index) => {
          return (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: (m.n % 2) === 0 ? 'flex-start' : 'flex-end'
              }}
            >
              <Skeleton
                variant='rect' height={30} width={m.w}
                style={{borderRadius: 5, margin: 2}}
              />
            </div>
          )
        })}
      </div>
      <Divider />
      <header className={classes.header} style={{minHeight: 55}} >
        <div style={{marginLeft: 'auto', marginRight: '8px'}}>
          <Skeleton variant='circle' height={30} width={30} />
        </div>
      </header>
    </Paper>
  )
}

export default ChatSkeleton