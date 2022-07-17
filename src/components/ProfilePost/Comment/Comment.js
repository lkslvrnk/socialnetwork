import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux'
import { useStyles } from './CommentStyles';
import { usePrevious } from '../../../hooks/hooks';
import {
  ClickAwayListener, IconButton, LinearProgress, MenuItem, Typography
} from '@material-ui/core';
import classNames from 'classnames';
import NewComment from '../NewComment/NewComment';
import moment from 'moment'
import { ThumbDown, ThumbDownOutlined, ThumbUp, ThumbUpOutlined } from '@material-ui/icons';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import { getCurrentUserId, getCurrentUserPicture } from '../../../redux/auth_selectors'
import { createSimpleGalleryPhoto, nFormatter } from '../../../helper/helperFunctions.js'
import { NavLink } from 'react-router-dom';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import PopperMenu from '../../Common/PopperMenu';
import MenuItemWithProgress from '../../Common/MenuItemWithProgress';
import {
  createCommentReaction,
  deleteComment,
  deleteCommentReaction,
  editCommentReaction,
  restoreComment,
  getReplies
} from '../../../redux/profile_posts_reducer'
import { PhotoSlider } from 'react-photo-view';
import SimplePhotoGallery from '../../Common/SimplePhotoGallery';
import NavLinkAvatar from '../../Common/NavLinkAvatar';
import { CircularProgress } from '@mui/material';

const Comment = React.memo(props => {
  const {
    postId,
    postCreatorId,
    commentData,
    isReply,
    commentingIsDisabled,
    onRespond,
    userIsAuthenticated,
    place
  } = props

  useEffect(() => {
    return () => console.log('unmount')
  }, [])

  const classes = useStyles({ isReply: isReply })
  const { t } = useTranslation()
  const dispatch = useDispatch()

  const [showReplyField, setShowReplyField] = useState(false)
  const [showReplies, setShowReplies] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [menuAnchor, setMenuAnchor] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [restoreError, setRestoreError] = useState('')
  const [reactionType, setReactionType] = useState(null)
  const [replied, setReplied] = useState(commentData)
  const [editMode, setEditMode] = useState(false)
  const [repliesAreLoading, setRepliesAreLoading] = useState(false)
  const [focusTrigger, triggerFocus] = useState(false)

  const prevCommentingIsDisabled = usePrevious(commentingIsDisabled)
  const currentUserId = useSelector(getCurrentUserId)
  const currentUserPicture = useSelector(getCurrentUserPicture)

  const creator = commentData.creator
  const isOwnPost = currentUserId === postCreatorId
  const isOwnComment = currentUserId === creator.id
  let newCommentCreatorPicture = `${currentUserPicture}`
  let creatorPicture = creator.picture
  let creatorFirstName = creator.firstName
  let creatorLastName = creator.lastName

  const creationDate = new Date(commentData.timestamp)
  const currentDate = Date.now()
  const differenceInHours = (((currentDate - creationDate) / 1000) / 60) / 60
  const isEditable = differenceInHours < 24
  const [viewerIsOpen, setViewerIsOpen] = useState(false);
  const attachment = commentData.attachment
  const viewerPhotos = !!attachment
    ? [{ src: `${attachment.versions[0].src}` }] : []
  const replies = commentData.replies
  const repliesContRef = useRef(null)

  const onRespondToReplyClick = (comment) => {
    setReplied(comment)
    setShowReplyField(true)
    triggerFocus(prev => !prev)
  }

  function handleRespond() {
    if (onRespond) {
      onRespond(commentData)
    } else {
      setShowReplyField(true)
      triggerFocus(prev => !prev)
      setReplied(commentData)
    }
  }

  const handleDelete = () => {
    setIsDeleting(true)
    dispatch(deleteComment(commentData.id, postId, commentData.rootId, place))
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
    dispatch(restoreComment(commentData.id, postId, commentData.rootId, place))
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

  const reversedReplies = replies ? [...replies].reverse() : []

  useEffect(() => {
    if (prevCommentingIsDisabled !== commentingIsDisabled) {
      setShowReplyField(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commentingIsDisabled])

  let likesInfo = commentData.reactionsCount.find(element => element.type === 1)
  let likesCount = nFormatter(likesInfo ? likesInfo.count : 0)

  let dislikesInfo = commentData.reactionsCount.find(element => element.type === 2)
  let dislikesCount = nFormatter(dislikesInfo ? dislikesInfo.count : 0)

  let likedByCurrentUser = commentData.requesterReaction
    && commentData.requesterReaction.type === 1
  let dislikedByCurrentUser = commentData.requesterReaction
    && commentData.requesterReaction.type === 2

  const handleRepliesLoad = () => {
    if (commentData.repliesCount > replies.length) {
      const lastReply = commentData.replies[commentData.replies.length - 1]
      const offsetId = lastReply ? lastReply.id : null
      setRepliesAreLoading(true)
      dispatch(getReplies(currentUserId, postId, commentData.id, offsetId, 3, place))
        .then(() => {
          setRepliesAreLoading(false)
        })
    }
  }

  const handleShowReplies = () => {
    if (showReplies) return
    setShowReplies(true)
    setRepliesAreLoading(true)
    if (commentData.repliesCount > replies.length && replies.length === 0) {
      dispatch(getReplies(currentUserId, postId, commentData.id, null, 2, place))
        .then(() => setRepliesAreLoading(false))
    }
  }

  const beforeReacting = (type) => {
    setReactionType(type)
  }

  const onReactionClickEnd = () => {
    setReactionType(null)
  }

  const handleReactionClick = (type) => {
    if (!userIsAuthenticated || reactionType) {
      return
    }
    let commentId = commentData.id
    let requesterReaction = commentData.requesterReaction

    if (requesterReaction) {

      let requesterReactionId = requesterReaction.id

      if (type === requesterReaction.type) {
        beforeReacting(type)
        dispatch(deleteCommentReaction(
          postId, commentId, commentData.rootId, requesterReactionId, place
        )).then(onReactionClickEnd, onReactionClickEnd)
      }
      else if (type !== requesterReaction.type) {
        beforeReacting(type)
        dispatch(editCommentReaction(
          postId, commentId, commentData.rootId, requesterReactionId, type, place
        )).then(onReactionClickEnd, onReactionClickEnd)
      }
    }
    else {
      beforeReacting(type)
      dispatch(createCommentReaction(
        postId, commentId, commentData.rootId, type, place
      )).then(onReactionClickEnd, onReactionClickEnd)
    }
  }

  const repliedCreator = replied.creator
  const repliedFullName = `${repliedCreator.firstName} ${repliedCreator.lastName}`
  const creatorFullName = `${creator.firstName} ${creator.lastName}`

  const handleClickAwayMenu = () => {
    if (menuAnchor) setMenuAnchor(null)
  }

  const handleEditClick = () => {
    if (isEditable) {
      setEditMode(true)
      setMenuAnchor(null)
    }
  }

  const openMenu = (e) => setMenuAnchor(e.currentTarget)

  const [disableMenu, setDisableMenu] = useState(false)
  const [complaining, setComplaining] = useState(false)

  const menu = !editMode && userIsAuthenticated && (
    <ClickAwayListener onClickAway={handleClickAwayMenu} >
      <div>
        <IconButton
          size='small'
          onClick={openMenu}
          className={classes.menuButton}
        >
          <MoreVertIcon />
        </IconButton>

        <PopperMenu open={!!menuAnchor} anchorEl={menuAnchor} dense>
          {isOwnComment && isEditable &&
            <MenuItem
              disabled={disableMenu || isDeleting}
              onClick={handleEditClick}
              children={t('Edit')}
            />
          }
          {(isOwnPost || isOwnComment) &&
            <MenuItemWithProgress
              children={t('Delete')} onClick={handleDelete}
              disabled={disableMenu || isDeleting}
              enableProgress={isDeleting}
              progressSize={32}
            />
          }
          {!isOwnComment &&
            <MenuItemWithProgress
              children={t('Complain')}
              onClick={() => {
                setDisableMenu(true)
                setComplaining(true)
                setTimeout(() => {
                  setMenuAnchor(null)
                  setDisableMenu(false)
                  setComplaining(false)
                }, 1000)
              }}
              disabled={disableMenu || complaining}
              enableProgress={complaining}
              progressSize={32}
            />
          }
        </PopperMenu>
      </div>
    </ClickAwayListener>
  )

  const likeButton = <>
    <div
      className={classes.reactionButton}
      onClick={() => handleReactionClick(1)}
    >
      <IconButton size='small' >
        {likedByCurrentUser
          ? <ThumbUp fontSize='small' />
          : <ThumbUpOutlined fontSize='small' />
        }
      </IconButton>
    </div>
    
    {reactionType === 1 &&
      <div style={{ position: 'absolute', top: 0 }}>
        <CircularProgress size={22} />
      </div>
    }
  </>

  const dislikeButton = <>
    <div
      className={classes.reactionButton}
      onClick={() => handleReactionClick(2)}
    >
      <IconButton size='small' >
        {dislikedByCurrentUser
          ? <ThumbDown fontSize='small' />
          : <ThumbDownOutlined fontSize='small' />
        }
      </IconButton>
    </div>

    {reactionType === 2 &&
      <div style={{ position: 'absolute', top: 0 }} >
        <CircularProgress size={22} />
      </div>
    }
  </>

  let repliedCreatorName = ''
  let repliedUsername = ''
  if (commentData.replied && commentData.replied.id !== commentData.rootId) {
    let repliedCreator = commentData.replied.creator
    repliedCreatorName = `${repliedCreator.firstName} ${repliedCreator.lastName}`
    repliedUsername = repliedCreator.username
  }

  let renderCommentAttachment = null
  if (!!attachment) {
    const medium = attachment.versions[2]
    let maxSize = 150
    const width = medium.width
    const height = medium.height
    if (width > height) {
      maxSize = maxSize * (width / height)
    }

    renderCommentAttachment = (
      <div style={{ maxWidth: maxSize, maxHeight: maxSize }}>
        <SimplePhotoGallery
          centering={false}
          passedImages={[
            createSimpleGalleryPhoto(
              attachment.id,
              medium,
              attachment.versions[0]
            )
          ]}
          spacing={1}
          imageBorderRadius={2}
        />
      </div>
    )
  }

  const commentContent = (
    <div className={classes.content} >
      <div className={classes.commentText} >
        <Typography
          component='span'
          variant='body2'
          children={commentData.text}
        />
      </div>

      {renderCommentAttachment}
    </div>
  )

  const commentBody = (
    <div className={classes.commentBody} >
      <div className={classes.header}>
        <div className={classes.nameAndDate} >
          <Typography
            component={NavLink}
            to={`/i/${creator.username}`}
            variant='body2'
            children={creatorFullName}
            color='textPrimary'
          />
          {repliedCreatorName &&
            <span style={{ whiteSpace: 'nowrap' }}>
              &nbsp;
              <Typography
                component='span'
                color='textSecondary'
                variant='body2'
                children={t('replied to')}
              />
              &nbsp;
              <Typography
                component={NavLink}
                to={`/i/${repliedUsername}`}
                color='textSecondary'
                children={repliedCreatorName}
                variant='body2'
                className={classes.repliedName}
              />
            </span>
          }
        </div>
      </div>
      {editMode
        ? <NewComment
          postId={postId}
          editMode={editMode}
          setEditMode={setEditMode}
          editingComment={commentData}
          onEditingFinish={() => setEditMode(false)}
          autoFocus={true}
          place={place}
          creatorPicture={creatorPicture}
          creatorFirstName={creatorFirstName}
          creatorLastName={creatorLastName}
        />
        : commentContent
      }
    </div>
  )

  if (commentData.deleted) {
    return <>
      <div className={isReply ? classes.deletedReply : classes.deletedComment} >
        <span>
          <Typography
            variant='body2'
            color='textSecondary'
            component='span'
            children={`${t('Comment was removed')}. `}
          >
          </Typography>
          <Typography
            style={{ cursor: 'pointer' }}
            onClick={handleRestore}
            component='span' variant='body2'
            children={t('Restore')}
          />
        </span>
      </div>
      {restoreError &&
        <span className={classes.restoringError}>
          {restoreError}
        </span>
      }
      {isRestoring && <LinearProgress />}
    </>
  }

  const underComment = !editMode && (
    <section className={classes.underComment}>
      <Typography
        variant='body2' color='textSecondary'
        style={{ marginRight: 8, textTransform: 'lowercase' }}
      >
        {moment(commentData.timestamp).format("DD MMMM HH:mm")}
      </Typography>

      <section className={classes.reactions} >
        <div className={classes.likes} >
          {likeButton}
          <span className={classes.likesCount} >
            {likesCount > 0 && likesCount}
          </span>
        </div>
        <div className={classes.dislikes} >
          {dislikeButton}
          <span className={classes.dislikesCount} >
            {dislikesCount > 0 && dislikesCount}
          </span>
        </div>
      </section>

      {!commentingIsDisabled && userIsAuthenticated &&
        <span
          className={classNames(classes.replyButton, classes.replyButtonActive)}
          onClick={handleRespond}
          style={{ marginRight: 8 }}
        >
          <Typography variant='body2'>
            {t('Reply')}
          </Typography>
        </span>
      }
      {replies.length === 0 && commentData.repliesCount > 0 &&
        <div
          className={classes.toggleRepliesVisibilityButton}
          onClick={handleShowReplies}
        >
          <div style={{ position: 'relative' }}>
            <div className={classes.dropDownIconWrapper}>
              <ArrowDropDownIcon style={{ display: 'block' }} />
            </div>
            {repliesAreLoading &&
              <div className={classes.repliesLoadingProgress}>
                <CircularProgress color='secondary' size={20} />
              </div>
            }
          </div>

          <span
            className={classNames(classes.replyButton, classes.replyButtonActive)}
          >
            <Typography variant='body2'>
              {`${t('Replies')} (${commentData.repliesCount})`}
            </Typography>
          </span>
        </div>
      }
    </section>
  )

  const repliesContainer = !isReply && (
    <div
      ref={repliesContRef}
      className={classes.repliesContainer}
    >
      {replies.length > 0 &&
        <div style={{ marginRight: 8 }}>
          {commentData.repliesCount > replies.length && replies.length > 0 &&
            <div
              className={classes.loadMoreRepliesButton}
              onClick={handleRepliesLoad}
            >
              <div style={{ position: 'relative' }}>
                <Typography variant='body2'>
                  {t('Load previous replies')}
                </Typography>

                {repliesAreLoading &&
                  <div className={classes.moreRepliesLoadingProgress}>
                    <CircularProgress size={16} color='secondary' />
                  </div>
                }
              </div>
            </div>
          }
          {commentData.repliesCount > replies.length && replies.length === 0 &&
            <CircularProgress color='secondary' />
          }
          {reversedReplies.map(reply => {
            return <Comment
              key={reply.id}
              postId={postId}
              postCreatorId={postCreatorId}
              commentData={reply}
              replies={[]}
              isReply={true}
              commentingIsDisabled={commentingIsDisabled}
              inList={false}
              onRespond={onRespondToReplyClick}
              setReplied={setReplied}
              userIsAuthenticated={userIsAuthenticated}
              place={place}
            />
          })}
        </div>
      }
      {showReplyField && !commentingIsDisabled && userIsAuthenticated &&
        <div className={classes.newReplyFieldContainer} >
          {replied && replied.rootId &&
            <div style={{ marginTop: 8 }} >
              <Typography variant='body2' color='textSecondary'>
                {`${'Reply for'} ${repliedFullName}`}
              </Typography>
            </div>
          }
          <NewComment
            creatorPicture={newCommentCreatorPicture}
            postId={postId}
            rootId={replied.rootId ? replied.rootId : replied.id}
            repliedId={replied.id}
            autoFocus={true}
            focusTrigger={focusTrigger}
            setShowReplyField={setShowReplyField}
            place={place}
            creatorFirstName={creatorFirstName}
          />
        </div>
      }
    </div>
  )

  const creatorName = creator.firstName + ' ' + creator.lastName

  return (
    <div className={classes.container}>
      <div
        className={classNames(
          classes.comment,
          isReply ? classes.reply : classes.rootComment
        )}
      >
        <NavLinkAvatar
          width={36}
          to={`/i/${creator.username}`}
          picture={creatorPicture || null}
          name={creatorName}
        />
        {commentBody}
        {menu}
      </div>

      {underComment}
      {repliesContainer}

      <PhotoSlider
        images={viewerPhotos}
        visible={viewerIsOpen}
        onClose={() => setViewerIsOpen(false)}
        index={0}
      />
    </div>
  )
})

export default Comment