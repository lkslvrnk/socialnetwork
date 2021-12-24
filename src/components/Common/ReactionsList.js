import React from 'react'

import { Paper } from '@material-ui/core'
import { useStyles } from './ReactionsListStyles.js';
import reactionsData from './ReactionsData.ts'

const ReactionsList = React.memo(props => {

  const {onReactionClick} = props

  const classes = useStyles();

  const onReactionHover = (e) => {
    e.target.width = 48
    e.target.height = 48
  }

  const onReactionUnhover = (e) => {
    e.target.width = 36
    e.target.height = 36
  }

  return (
    <Paper
      elevation={3}
      className={classes.reactionsContainer}
    >
      { reactionsData.map(reaction => {
          return (
            <div
              key={reaction.type}
              className={classes.reactionContainer}
              onClick={() => onReactionClick(reaction.type)}
            >
              <img
                className={classes.reactionImage}
                onMouseEnter={onReactionHover}
                onMouseLeave={onReactionUnhover}
                width='36' height='36'
                src={reaction.src}
                alt={reaction.emotion}
              />
            </div>
          )
        })
      }
    </Paper>
  )
})

export default ReactionsList;