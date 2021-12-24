import React from 'react';
import { useStyles } from './ConnectionsStyles';
import Skeleton from '@material-ui/lab/Skeleton';

const ConnectionSkeleton: React.FC = React.memo(props => {
  const classes = useStyles();

  return (
    <div style={{ padding: 16, display: 'flex'}}>
      <Skeleton variant="circle" width={80} height={80} style={{marginRight: 16}} />
      <div>
        <Skeleton variant="text" width={130} height={20} />
      </div>
    </div>
  )
})

export default ConnectionSkeleton