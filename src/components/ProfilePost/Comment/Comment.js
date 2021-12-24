import React, {useState, useEffect} from 'react';
import Avatar from "@material-ui/core/Avatar";
import {useTranslation} from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux'
import { useStyles } from './CommentStyles';
import { usePrevious } from '../../../hooks/hooks';
import SimpleText from '../../Common/SimpleText';
import { ClickAwayListener, IconButton, LinearProgress, MenuItem, MenuList, Paper, Popper, Typography } from '@material-ui/core';
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
import { baseUrl, imagesStorage } from '../../../api/api';
import MoreVertIcon from '@material-ui/icons/MoreVert';

const Comment = React.memo(props => {
  const {
    postId,
    postCreatorId,
    commentData,
    currentUserReaction,
    isReply,
    commentingIsDisabled,
    replies,
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

  const reversedReplies = replies ? [...replies].reverse() : []

  useEffect(() => {
    if(prevCommentingIsDisabled !== commentingIsDisabled) {
      setShowReplyField(false)
    }
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

  const menu = (
    <ClickAwayListener onClickAway={ handleClickAwayMenu } >
      <div>
        <IconButton
          size='small'
          onClick={ (e) => setMenuAnchor(e.currentTarget) }
        >
          <MoreVertIcon color='action' />
        </IconButton>

        <Popper
          open={Boolean(menuAnchor)}
          anchorEl={menuAnchor}
          transition
        >
          <Paper elevation={3} className={classes.menuRoot} >
            <MenuList dense >
              { !isOwnComment &&
              <MenuItem disableRipple >
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%'}}>
                  <div>{t('Complain')}</div>
                </div>
              </MenuItem>
              }
              { isOwnComment &&
              <MenuItem onClick={ () => { setEditMode(true); setMenuAnchor(null) }} disableRipple >
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%'}}>
                  <div>{t('Edit')}</div>
                </div>
              </MenuItem>
              }
              {(isOwnPost || isOwnComment) &&
              <MenuItem onClick={handleDelete} disableRipple >
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%'}}>
                  <div>{t('Delete')}</div>
                  <div style={{width: 40, display: 'flex', flexDirection: 'row-reverse'}} >{ isDeleting && <Preloader size={20} color='secondary' /> }</div>
                </div>
              </MenuItem>
              }
            </MenuList>
          </Paper>
        </Popper>
      </div>
    </ClickAwayListener>
  )

  const likeButton = (
    <>
      <div style={{cursor: 'pointer' }} onClick={ () => handleReactionClick(1) }> 
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
      <div style={{cursor: 'pointer' }} onClick={ () => handleReactionClick(2) } >
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
        style={{ display: 'flex'}}
      >
        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'start'}}>
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
        { restoreError && <span style={{ color: 'red' }}>{ restoreError }</span>}
        { isRestoring && <LinearProgress /> }
      </>
    )
  }

  const underComment = (
    !editMode &&
    <div className={classes.underComment}>
      <div style={{ display: 'flex', alignItems: 'center' }} >

        <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }} >
          { likeButton }
          { <span style={{ marginLeft: 4, marginRight: 8 }} >{ likesCount > 0 && likesCount } </span> }
        </div>

        <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}  >
          { dislikeButton }
          { <span style={{ marginLeft: 4 }} >{ dislikesCount > 0 && dislikesCount } </span> }
        </div>

      </div>

      {!commentingIsDisabled && userIsAuthenticated &&
        <>
          <div style={{ margin: '0 8px' }} />
          <div>
            <span
              className={classNames(classes.replyButton, classes.replyButtonActive)}
              onClick={ handleRespond }
            >
              <div style={{ textTransform: 'uppercase' }} >{t('Reply')}</div>
            </span>
          </div>
        </>
      }
    </div>
  )

  const repliesContainer = (
    <div className={classes.repliesContainer} >

      { replies.length === 0 && commentData.repliesCount > 0 &&
        <div className={ classes.toggleRepliesVisibilityButton } onClick={handleShowReplies} >
            <div><ArrowDropDownIcon style={{ display: 'block'}}/></div>
            <div><SimpleText >{`${t('Show replies')} (${commentData.repliesCount})`}</SimpleText></div>
            { repliesAreLoading && <div style={{ marginLeft: 16 }} ><Preloader size={24} /></div> }
          </div>
      }
      { replies.length > 0 &&
        <div style={{marginRight: 16}}>
          { commentData.repliesCount > replies.length && replies.length > 0 &&
            <div
              className={ classes.loadMoreRepliesButton }
              onClick={ handleRepliesLoad }
            >
              <div ><SimpleText >{t('Load previous replies')}</SimpleText></div>
              { repliesAreLoading && <div style={{ marginLeft: 16 }} ><Preloader size={20} /></div> }
            </div>
          }
          { commentData.repliesCount > replies.length && replies.length === 0 &&
            <Preloader color='secondary' />
          }

          { reversedReplies.map(reply => {
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
            })
          }
        </div>
      }
      { showReplyField && !commentingIsDisabled && userIsAuthenticated &&
        <div className={classes.newReplyFieldContainer} >
          { replied && replied.rootId &&
            <div style={{ marginTop: 8 }} >
              <SimpleText color='textSecondary'>Ответ для {repliedFullName}</SimpleText>
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
    <div className={classes.container} style={{ padding: `0 ${isReply ? '0px' : '0px'}` }}>

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