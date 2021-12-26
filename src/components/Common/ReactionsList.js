import React from 'react'

import { Paper } from '@material-ui/core'
import { useStyles } from './ReactionsListStyles.js';
import reactionsData from './ReactionsData.ts'

const ReactionsList = React.memo(props => {

  const {onReactionClick} = props

  const classes = useStyles();

  const onReactionHover = (e) => {
    e.target.width = 40
    e.target.height = 40
  }

  const onReactionUnhover = (e) => {
    e.target.width = 32
    e.target.height = 32
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