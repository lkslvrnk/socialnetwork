import React, {useState, useEffect } from 'react'
import {  useDispatch, useSelector } from 'react-redux'
import { useStyles } from './CommentsSectionStyles.js'
import Comment from '../Comment/Comment.js'
import NewComment from '../NewComment.js'
import SimpleText from '../../Common/SimpleText.jsx'
import { getCurrentUserId, getCurrentUserPicture } from '../../../redux/auth_selectors'
import { getPostComments } from '../../../redux/profile_posts_selectors'
import { useTranslation } from 'react-i18next'
import { imagesStorage } from '../../../api/api'
import { CircularProgress } from '@material-ui/core'
import {
  getComments,
  createComment
} from '../../../redux/profile_posts_reducer'

const CommentsSection = React.memo(props => {

  const { postId, commentsCount, commentingIsDisabled, userIsAuthenticated, postCreatorId } = props
  const classes = useStyles()
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const currentUserId = useSelector(getCurrentUserId)
  const comments = useSelector(state => getPostComments(state, postId))
  const picture = useSelector(getCurrentUserPicture)
  const currentUserPicture = `${imagesStorage}/${picture}`

  const [qwe, setQwe] = useState(false)
  const [commentsAreHidden] = useState(false)
  const [commentWithReplyFieldId, setCommentWithReplyFieldId] = useState(null)
  const reversed = [...comments].reverse()

  useEffect(() => {
    if(commentsCount && !comments.length) {
      dispatch(getComments(currentUserId, postId, null, 2, 'DESC'))
    }
  }, [commentsCount, comments.length, currentUserId, postId, dispatch])
  const commentsLength = comments.length

  useEffect(() => {
    setQwe(false)
  }, [commentsLength])

  const onShowMoreClick = () => {
    setQwe(true)    
    let offsetId = comments[comments.length - 1].id
    dispatch(getComments(currentUserId, postId, offsetId, 5, 'DESC'))
  }

  const createCommentCallback = async (text) => {
    return dispatch(createComment(postId, text, null, null))
  }

  const renderNewCommentField = (
    <div className={classes.stickyNewCommentFieldContainer} >
      <NewComment
        onCreate={createCommentCallback}
        postId={postId}
        autoFocus={false}
        creatorPicture={currentUserPicture}
      />
    </div>
  )

  const renderShowMoreButton = (
    <div
      className={classes.showMore}
      onClick={onShowMoreClick}
    >
      <SimpleText>{t('Load previous')}</SimpleText>
      { qwe &&
        <div style={{marginLeft: 8}} >
          <CircularProgress color='secondary' size={15} />
        </div>
      }
    </div>
  )

  const header = (
    <div style={{display: 'flex', justifyContent: 'space-between', padding: '0 16px' }}>
      { comments && commentsCount > comments.length && !commentsAreHidden &&
        renderShowMoreButton
      }
    </div>
  )

  return (
    <div className={ classes.commentsSection } >
      { commentsCount > 0 && header }

      <div style={{ display: commentsAreHidden ? 'none' : 'block' }}>
        { comments.length > 0 &&
          reversed.map((comment, index) => {
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
              />
            )
          })
        }

        { commentsCount > 0 && !comments.length
          && <CircularProgress color='secondary' size={40} />
        }
        { userIsAuthenticated && !commentingIsDisabled && renderNewCommentField } 
      </div>

  </div>
  )
})

export default CommentsSection




