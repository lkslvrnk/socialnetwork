import { Paper } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import React, {useState, useEffect, useRef} from 'react';

const PostSkeleton = (props) => {

  return (
    <Paper style={{ padding: 16, width: '100%', height: 200, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} >
      <div style={{display: 'flex'}}>
        <Skeleton style={{marginRight: 16}} variant='circle' height={48} width={48} />
        <Skeleton variant='text' height={20} width={150} />
      </div>
      <div style={{display: 'flex', justifyContent: 'space-evenly'}}>
        <Skeleton variant='text' height={20} width={30} />
        <Skeleton variant='text' height={20} width={30} />
        <Skeleton variant='text' height={20} width={30} />
      </div>
    </Paper>
  )
}

export default PostSkeleton
