import React, {useState, useEffect} from 'react';
import Avatar from "@material-ui/core/Avatar";
import {useTranslation} from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux'
import { useStyles } from './CommentStyles';
import { usePrevious } from '../../../hooks/hooks';
import SimpleText from '../../Common/SimpleText';
import { CircularProgress, ClickAwayListener, IconButton, LinearProgress, MenuItem, MenuList, Paper, Popper, Typography } from '@material-ui/core';
import classNames from 'classnames';
import NewComment from '../NewComment';
import moment from 'moment'
import { ThumbDown, ThumbDownOutlined, ThumbUp, ThumbUpOutlined } from '@material-ui/icons';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { getReplies } from '../../../redux/profile_posts_reducer'
import { getCurrentUserId, getCurrentUserPicture } from '../../../redux/auth_selectors'
import Preloader from '../../Common/Preloader/Preloader';
import { createCommentReaction, deleteComment, deleteCommentReaction, editCommentReaction, restoreComment } from '../../../redux/profile_posts_reducer'
import { nFormatter } from '../../../helper/helperFunctions.js'
import { NavLink } from 'react-router-dom';
import { imagesStorage } from '../../../api/api';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import PopperMenu from '../../Common/PopperMenu';
import MenuListItemWithProgress from '../../Common/MenuListItemWithProgress';

const Comment = React.memo(props => {
  const {
    postId,
    postCreatorId,
    commentData,
    currentUserReaction,
    isReply,
    commentingIsDisabled,
    onRespond,
    userIsAuthenticated
  } = props

  const classes = useStyles({isReply: isReply})
  const { t } = useTranslation()
  const dispatch = useDispatch()

  const [showReplyField, setShowReplyField] = useState(false)
  const [showReplies, setShowReplies] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [menuAnchor, setMenuAnchor] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [restoreError, setRestoreError] = useState('')
  const [isReacting, setIsReacting] = useState(0)
  const [replied, setReplied] = useState(commentData)
  const [editMode, setEditMode] = useState(false)
  const [repliesAreLoading, setRepliesAreLoading] = useState(false)
  const [focusTrigger, triggerFocus] = useState(false)

  const prevCommentingIsDisabled = usePrevious(commentingIsDisabled)
  const currentUserId = useSelector(getCurrentUserId)
  const currentUserPicture = useSelector(getCurrentUserPicture)

  const isOwnPost = currentUserId === postCreatorId
  const isOwnComment = currentUserId === commentData.creator.id
  let newCommentCreatorPicture = `${imagesStorage}/${currentUserPicture}`
  let creatorPicture = `${imagesStorage}/${commentData.creator.picture}`

  const onRespondToReplyClick = (comment) => {
    setReplied(comment)
    setShowReplyField(true)
    triggerFocus(prev => !prev)
  }

  function handleRespond() {
    if(onRespond) {
      onRespond(commentData)
    } else {
      setShowReplyField(true)
      triggerFocus(prev => !prev)
      setReplied(commentData)
    }
  }

  const handleDelete = () => {
    setIsDeleting(true)
    dispatch(deleteComment(commentData.id, postId, commentData.rootId))
      .then(
        (response) => {
          setMenuAnchor(null)
          setIsDeleting(false)
        },
        (err) => {
          setMenuAnchor(null)
          setIsDeleting(false)
        }
      )
  }

  const handleRestore = () => {
    setIsRestoring(true)
    dispatch(restoreComment(commentData.id, postId, commentData.rootId))
    .then(
      (response) => {
        setIsRestoring(false)
      },
      (err) => {
        setRestoreError('Не удалось восстановить комментарий')
        setIsRestoring(false)
      }
    )
  }

  const replies = commentData.replies
  const reversedReplies = replies ? [...replies].reverse() : []

  useEffect(() => {
    if(prevCommentingIsDisabled !== commentingIsDisabled) {
      setShowReplyField(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentingIsDisabled])

  let likesInfo = commentData.reactionsCount.find(element => element.type === 1)
  let likesCount = nFormatter(likesInfo ? likesInfo.count : 0)

  let dislikesInfo = commentData.reactionsCount.find(element => element.type === 2)
  let dislikesCount = nFormatter(dislikesInfo ? dislikesInfo.count : 0)

  let likedByCurrentUser = commentData.requesterReaction && commentData.requesterReaction.type === 1
  let dislikedByCurrentUser = commentData.requesterReaction && commentData.requesterReaction.type === 2

  const handleRepliesLoad = () => {
    if(commentData.repliesCount > replies.length) {
      const lastReply = commentData.replies[commentData.replies.length - 1]
      const offsetId = lastReply ? lastReply.id : null
      setRepliesAreLoading(true)
      dispatch(getReplies(currentUserId, postId, commentData.id, offsetId, 3))
        .then(() => setRepliesAreLoading(false))
    }
  }

  const handleShowReplies = () => {
    if(showReplies) {
      return
    }
    setShowReplies(true)
    setRepliesAreLoading(true)
    if(commentData.repliesCount > replies.length && replies.length === 0) {
      dispatch(getReplies(currentUserId, postId, commentData.id, null, 2))
        .then(() => setRepliesAreLoading(false))
    }
  }

  const beforeReacting = (type) => {
    setIsReacting(type)
  }

  const onReactionClickEnd = () => {
    setIsReacting(0)
  }

  const handleReactionClick = (type) => {
    if(!userIsAuthenticated || isReacting) {
      return
    }
    let commentId = commentData.id

    if(currentUserReaction) {
      let currentUserReactionId = currentUserReaction.id

      if(type === currentUserReaction.type) {
        beforeReacting(type)
        dispatch(deleteCommentReaction(postId, commentId, commentData.rootId, currentUserReactionId))
          .then(onReactionClickEnd, onReactionClickEnd)
      }
      else if(type !== currentUserReaction.type) {
        beforeReacting(type)
        dispatch(editCommentReaction(postId, commentId, commentData.rootId, currentUserReactionId, type))
          .then(onReactionClickEnd, onReactionClickEnd)
      }
    }
    else {
      beforeReacting(type)
      dispatch(createCommentReaction(postId, commentId, commentData.rootId, type))
        .then(onReactionClickEnd, onReactionClickEnd)
    }
  }

  const repliedFullName = `${replied.creator.firstName} ${replied.creator.lastName}`
  const creatorFullName = `${commentData.creator.firstName} ${commentData.creator.lastName}`

  const handleClickAwayMenu = () => {
    if(menuAnchor) {
      setMenuAnchor(null)
    }
  }

  const handleEditClick = () => {
    setEditMode(true)
    setMenuAnchor(null)
  }

  const openMenu = (e) => setMenuAnchor(e.currentTarget)

  const menu = (
    <ClickAwayListener onClickAway={handleClickAwayMenu} >
      <div>
        <IconButton size='small' onClick={openMenu}>
          <MoreVertIcon />
        </IconButton>

        <PopperMenu open={!!menuAnchor} anchorEl={menuAnchor} dense>
          { isOwnComment &&
            <MenuItem
              disabled={isDeleting}
              onClick={handleEditClick}
              children={t('Edit')}
            />
          }
          {(isOwnPost || isOwnComment) &&
            <MenuListItemWithProgress
              children={t('Delete')} onClick={handleDelete}
              disabled={isDeleting} enableProgress={isDeleting}
              progressSize={32}
            />
          }
        </PopperMenu>
      </div>
    </ClickAwayListener>
  )

  const likeButton = (
    <>
      <div
        className={classes.reactionButton}
        onClick={ () => handleReactionClick(1) }
      > 
        <IconButton size='small' >
          { likedByCurrentUser
            ? <ThumbUp fontSize='small' />
            : <ThumbUpOutlined fontSize='small' />
          }
        </IconButton>
      </div>
      { isReacting === 1 &&
        <div style={{ position: 'absolute' }}>
          <Preloader color='secondary' size={24} />
        </div>
      }
    </>
  )

  const dislikeButton = (
    <>
      <div
        className={classes.reactionButton}
        onClick={ () => handleReactionClick(2) }
      >
        <IconButton size='small' >
          { dislikedByCurrentUser
            ? <ThumbDown fontSize='small' />
            : <ThumbDownOutlined fontSize='small' />
          }
        </IconButton>
      </div>
      { isReacting === 2 &&
        <div style={{ position: 'absolute'}} >
          <Preloader color='secondary' size={24} />
        </div>
      }
    </>
  )

  let repliedCreatorName = ''
  if(commentData.replied && commentData.replied.id !== commentData.rootId) {
    let repliedCreator = commentData.replied.creator
    repliedCreatorName = `${repliedCreator.firstName} ${repliedCreator.lastName}`
  }

  const commentContent = (
    <div className={classes.content} >
      <div className={classes.commentText} >
        { repliedCreatorName &&
          <>
            <Typography
              component='span'
              color='textSecondary'
              children={repliedCreatorName}
              variant='body2'
              style={{ whiteSpace: 'nowrap'}}
            />
            <span>,&nbsp;</span>
          </>
        }
        <Typography component='span' variant='body2'>{commentData.text}</Typography>
      </div>

      { commentData.attachment && 
        <div style={{marginTop: commentData.text ? 8 : 0, maxWidth: 150}} >
          { commentData.attachment && 
            <img
              alt='comment-attachment'
              style={{width: '100%'}}
              src={`${imagesStorage}/${commentData.attachment.src}`}
            />
          }
        </div>
      }
    </div>
  )

  const commentBody = (
    <div className={classes.commentBody} >

      <div
        className={classes.header}
      >
        <div className={classes.nameAndDate} >
          <Typography
            component={NavLink}
            to={`/i/${commentData.creator.username}`}
            variant='body2'
            children={creatorFullName}
            color='textPrimary'
          />

          <Typography variant='body2' color='textSecondary' >
            {moment(commentData.timestamp).format("DD MMMM HH:mm")}
          </Typography>
        </div>
        

        <div style={{marginLeft: 'auto'}} >
          { !editMode && userIsAuthenticated && menu }
        </div>
      </div>

      { editMode
        ? <NewComment
            postId={postId}
            editMode={editMode}
            setEditMode={setEditMode}
            editingComment={commentData}
            onEditingFinish={() => setEditMode(false)}
            autoFocus={true}
          />
        : commentContent
      }
    </div>
  )

  if(commentData.deleted) {
    return (
      <>
        <div style={{ padding: '16px 0' }}>
          <span>
            <Typography
              variant='body2'
              color='textSecondary'
              component='span'
              children={`${t('Comment was removed')}. `}
            >
            </Typography>
            <Typography
              style={{ cursor: 'pointer'}}
              onClick={handleRestore}
              component='span' variant='body2'
              children={t('Restore')}
            />
          </span>
        </div>
        { restoreError &&
          <span style={{ color: 'red' }}>
            { restoreError }
          </span>
        }
        { isRestoring && <LinearProgress /> }
      </>
    )
  }

  const underComment = (
    !editMode &&
    <div className={classes.underComment}>
      <div className={classes.reactions} >

        <div className={classes.likes} >
          { likeButton }
          { <span className={classes.likesCount} >
              { likesCount > 0 && likesCount}
            </span>
          }
        </div>

        <div className={classes.dislikes} >
          { dislikeButton }
          { <span className={classes.dislikesCount} >
              { dislikesCount > 0 && dislikesCount }
            </span>
          }
        </div>

      </div>

      {!commentingIsDisabled && userIsAuthenticated &&
        <span
          className={classNames(classes.replyButton, classes.replyButtonActive)}
          onClick={ handleRespond }
        >
          <div style={{ textTransform: 'uppercase' }} >{t('Reply')}</div>
        </span>
      }
    </div>
  )

  const renderReplies = (
    <>
    {reversedReplies.map(reply => {
      return <Comment
        key={reply.id}
        postId={postId}
        postCreatorId={postCreatorId}
        commentData={reply}
        currentUserReaction={reply.requesterReaction}
        replies={[]}
        isReply={true}
        commentingIsDisabled={commentingIsDisabled}
        inList={false}
        onRespond={onRespondToReplyClick}
        setReplied={setReplied}
        userIsAuthenticated={userIsAuthenticated}
      />
    })}
    </>
  )

  const repliesContainer = (
    <div className={classes.repliesContainer} >

      { replies.length === 0 && commentData.repliesCount > 0 &&
        <div
          className={ classes.toggleRepliesVisibilityButton }
          onClick={handleShowReplies}
        >
          <div><ArrowDropDownIcon style={{ display: 'block'}}/></div>
          <div>
            <SimpleText >
              {`${t('Show replies')} (${commentData.repliesCount})`}
            </SimpleText>
          </div>
          { repliesAreLoading &&
            <div style={{ marginLeft: 16 }} >
              <CircularProgress size={24} />
            </div>
          }
        </div>
      }
      { replies.length > 0 &&
        <div style={{marginRight: 16}}>
          { commentData.repliesCount > replies.length && replies.length > 0 &&
            <div
              className={ classes.loadMoreRepliesButton }
              onClick={ handleRepliesLoad }
            >
              <div><SimpleText >
                {t('Load previous replies')}
              </SimpleText></div>
              { repliesAreLoading &&
                <div><CircularProgress size={20} /></div>
              }
            </div>
          }
          { commentData.repliesCount > replies.length && replies.length === 0 &&
            <Preloader color='secondary' />
          }

          { renderReplies }
        </div>
      }
      { showReplyField && !commentingIsDisabled && userIsAuthenticated &&
        <div className={classes.newReplyFieldContainer} >
          { replied && replied.rootId &&
            <div style={{ marginTop: 8 }} >
              <SimpleText color='textSecondary'>
                {`${'Reply for'} ${repliedFullName}`}
              </SimpleText>
            </div>
          }
          <NewComment
            creatorPicture={newCommentCreatorPicture}
            postId={postId}
            rootId={replied.rootId ? replied.rootId : replied.id}
            repliedId={replied.id}
            autoFocus={true}
            focusTrigger={ focusTrigger }
            setShowReplyField={ setShowReplyField }
          />
        </div>
      }

    </div>
  )

  return (
    <>
    <div className={classes.container}>
      <div className={classes.comment} >
        <Avatar
          component={NavLink}
          to={`/i/${commentData.creator.username}`}
          className={classes.creatorAvatar}
          src={creatorPicture}
        />

        <div style={{ flexGrow: 1}} >
          { commentBody }
          { underComment }
        </div>
      </div>

      { !isReply && repliesContainer }

    </div>
  </>
  )
})

export default Comment