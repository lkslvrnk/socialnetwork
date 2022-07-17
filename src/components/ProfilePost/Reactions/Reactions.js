import React, { useEffect, useState } from 'react'
import IconButton from "@material-ui/core/IconButton"
import AddReactionIcon from '@mui/icons-material/AddReaction'
import classNames from 'classnames'
import { useStyles } from './ReactionsStyles.js';
import './ReactionAnimationStyles.css'
import ReactionsList from '../../Common/Reactions/ReactionsList.js'
import reactionsData from '../../Common/Reactions/ReactionsData.ts'
import { ClickAwayListener, Popper } from '@material-ui/core';
import Preloader from '../../Common/Preloader/Preloader.jsx';
import { usePrevious } from '../../../hooks/hooks.js';

const Reactions = React.memo(props => {
  const {
    currentUserReaction, onCreateReaction,
    onEditReaction, onDeleteReaction
  } = props

  const classes = useStyles();
  const [animation, setAnimation] = useState(false);
  const [anchor, setAnchor] = useState(null)
  const [reactionIsDeleting, setReactionIsDeleting] = useState(false)
  const [reactionIsCreating, setReactionIsCreating] = useState(false)

  const animate = () => {
    if (!animation) {
      setAnimation(true);
      setTimeout(() => setAnimation(false), 500);
    }
  }

  let reactionType = currentUserReaction ? currentUserReaction.type : null
  const prevCurrentUserReaction = usePrevious(currentUserReaction)

  useEffect(() => {
    (function () {
      setReactionIsDeleting(false)
      setReactionIsCreating(false)
      if (currentUserReaction && prevCurrentUserReaction
        && (currentUserReaction.type !== prevCurrentUserReaction.type)
      ) {
        animate()
      } else if (currentUserReaction && prevCurrentUserReaction === null) {
        animate()
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserReaction])

  const openPopper = (e) => {
    let target = e.currentTarget

    if (!Boolean(anchor)) {
      setAnchor(target)
    }
  }

  const closePopper = (e) => {
    setAnchor(null)
  }

  const deleteReaction = () => {
    if (currentUserReaction) {
      setAnchor(null)
      setReactionIsDeleting(true)
      onDeleteReaction()
    }
  }

  const createReaction = (reactionNumber) => {
    if (!currentUserReaction) {
      setReactionIsCreating(true)
      onCreateReaction(reactionNumber)
    }
  }

  const editReaction = (reactionNumber) => {
    if (currentUserReaction) {
      setReactionIsCreating(true)
      onEditReaction(reactionNumber)
        .then(() => animate())
    }
  }

  const onReactionClick = reactionNumber => {
    setAnchor(null)
    if (currentUserReaction) {
      editReaction(reactionNumber)
    } else {
      createReaction(reactionNumber)
    }
  }

  return (
    <ClickAwayListener onClickAway={closePopper} >
      <div>
        <div className={classes.addReactionButtonWrapper}>
          <IconButton
            onClick={openPopper}
            disableRipple
          >
            {reactionType
              ? <div className={classes.currentReactionImageContainer}>
                <img
                  className={classNames(
                    (animation ? `shake` : null),
                    classes.currentReactionImage
                  )}
                  width='30' height='30'
                  src={reactionsData[reactionType - 1].src}
                  alt={reactionsData[reactionType - 1].emotion}
                />
              </div>
              :
              <AddReactionIcon style={{ fontSize: '24px' }} />
            }
          </IconButton>

          {(reactionIsCreating || reactionIsDeleting) &&
            <div className={classes.addReactionButtonProgress}>
              <Preloader size={48} />
            </div>
          }
        </div>

        <Popper
          open={Boolean(anchor)}
          anchorEl={anchor}
          placement='top'
          modifiers={{
            offset: { enabled: true, offset: '40, 0' }
          }}
          transition
        >
          <ReactionsList
            onReactionClick={onReactionClick}
            onDelete={deleteReaction}
            showDelete={!!currentUserReaction}
          />
        </Popper>
      </div>
    </ClickAwayListener>
  )
})

export default Reactions;