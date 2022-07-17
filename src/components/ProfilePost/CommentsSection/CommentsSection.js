import React, {useState, useEffect, useRef, useLayoutEffect } from 'react'
import {  useDispatch, useSelector } from 'react-redux'
import { useStyles } from './CommentsSectionStyles.js'
import Comment from '../Comment/Comment.js'
import NewComment from '../NewComment/NewComment.js'
import {
  getCurrentUserData, getCurrentUserId, getCurrentUserPicture
} from '../../../redux/auth_selectors'
import { getPostComments } from '../../../redux/profile_posts_selectors'
import { useTranslation } from 'react-i18next'
import { CircularProgress, Typography } from '@material-ui/core'
import {
  getComments,
  createComment
} from '../../../redux/profile_posts_reducer'
import { usePrevious } from '../../../hooks/hooks';

const CommentsSection = React.memo(props => {

  const {
    postId, commentsCount, commentingIsDisabled,
    userIsAuthenticated, postCreatorId, place
  } = props
  const classes = useStyles()
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const currentUserId = useSelector(getCurrentUserId)
  const comments = useSelector(state => getPostComments(state, postId, place))
  const picture = useSelector(getCurrentUserPicture)
  const currentUserPicture = picture
  const currentUserData = useSelector(getCurrentUserData)
  const currentUserFirstName = currentUserData.firstName
  const currentUserLastName = currentUserData.lastName

  const [showLoadMore, setShowLoadMore] = useState(false)
  const [commentsAreHidden] = useState(false)
  const [commentWithReplyFieldId, setCommentWithReplyFieldId] = useState(null)
  const reversed = [...comments].reverse()

  useEffect(() => {
    if(commentsCount && !comments.length) {
      dispatch(getComments(currentUserId, postId, null, 2, 'DESC', place))
    }
  }, [commentsCount, comments.length, currentUserId, postId, dispatch, place])

  const commentsLength = comments.length

  const commentsSectionRef = useRef(null)
  const prevHeight = useRef(commentsSectionRef.current?.getBoundingClientRect().height)
  const prevComments = usePrevious(comments)

  useLayoutEffect(() => {
    const currentHeight = commentsSectionRef.current?.getBoundingClientRect().height
    const prevLastCommentId = prevComments?.length ? prevComments[0].id : '0'
    const newCommentAdded = comments.length && comments[0].id > prevLastCommentId
    if(newCommentAdded && prevHeight.current && currentHeight
       && currentHeight > prevHeight.current
    ) {
      document.documentElement.scrollTop = document.documentElement.scrollTop
        + (currentHeight - prevHeight.current)
    }
  }, [commentsLength, comments, prevComments])

  useEffect(() => {
    prevHeight.current = commentsSectionRef.current?.getBoundingClientRect().height
  })

  useEffect(() => {
    setShowLoadMore(false)
  }, [commentsLength])

  const onShowMoreClick = () => {
    setShowLoadMore(true)    
    let offsetId = comments[comments.length - 1].id
    dispatch(getComments(currentUserId, postId, offsetId, 5, 'DESC', place))
  }

  const createCommentCallback = async (text) => {
    return dispatch(createComment(postId, text, null, null, place))
  }

  const renderNewCommentField = (
    <div className={classes.stickyNewCommentFieldContainer} >
      <NewComment
        onCreate={createCommentCallback}
        postId={postId}
        autoFocus={false}
        creatorPicture={currentUserPicture}
        place={place}
        creatorFirstName={currentUserFirstName}
        creatorLastName={currentUserLastName}
      />
    </div>
  )

  const renderShowMoreButton = (
    <div
      className={classes.showMore}
      onClick={onShowMoreClick}
    >
      <Typography variant='body2'>
        {t('Load previous')}
      </Typography>
      { showLoadMore &&
        <div style={{marginLeft: 8}} >
          <CircularProgress color='secondary' size={15} />
        </div>
      }
    </div>
  )

  const header = (
    <div className={classes.header}>
      { comments && commentsCount > comments.length && !commentsAreHidden &&
        renderShowMoreButton
      }
    </div>
  )

  return (
    <div ref={commentsSectionRef} className={ classes.commentsSection } >
      { commentsCount > 0 &&
        header
      }
      <div style={{ visibility: commentsAreHidden ? 'hidden' : 'visible' }}>
        { comments.length > 0 &&
          reversed.map(comment => {
            return (
              <Comment
                key={comment.id}
                postId={postId}
                postCreatorId={postCreatorId}
                commentData={comment}
                isReply={false}
                commentingIsDisabled={commentingIsDisabled}
                inList={true}
                commentWithReplyFieldId={commentWithReplyFieldId}
                setCommentWithReplyFieldId={setCommentWithReplyFieldId}
                userIsAuthenticated={userIsAuthenticated}
                place={place}
              />
            )
          })
        }

        { commentsCount > 0 && !comments.length &&
          <CircularProgress color='secondary' size={40} />
        }
        { userIsAuthenticated && !commentingIsDisabled &&
          renderNewCommentField
        } 
      </div>

  </div>
  )
})

export default CommentsSection




