import React from 'react'

import { Paper } from '@material-ui/core'
import { useStyles } from './ReactionsListStyles.js';
import reactionsData from './ReactionsData.ts'

const ReactionsList = React.memo(props => {

  const {onReactionClick, showDelete, onDelete} = props

  const classes = useStyles();

  // const onReactionHover = (e) => {
  //   e.target.width = 40
  //   e.target.height = 40
  // }

  // const onReactionUnhover = (e) => {
  //   e.target.width = 32
  //   e.target.height = 32
  // }

  return (
    <Paper
      elevation={3}
      className={classes.reactionsContainer}
    >
      { showDelete && <div
          className={classes.reactionContainer}
          onClick={onDelete}
        >
          <div
            className={classes.reactionImage}
            style={{backgroundImage: `url(/images/reactions/delete.png)`}}
          />
        </div>
      }
      { reactionsData.map(reaction => {
          return (
            <div
              key={reaction.type}
              className={classes.reactionContainer}
              onClick={() => onReactionClick(reaction.type)}
            >
              <div
                className={classes.reactionImage}
                // onMouseEnter={onReactionHover}
                // onMouseLeave={onReactionUnhover}
                // width='32' height='32'
                style={{backgroundImage: `url(${reaction.src})`}}
              />
            </div>
          )
        })
      }
    </Paper>
  )
})

export default ReactionsList;