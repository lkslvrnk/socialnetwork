import React from 'react'
import { NavLink } from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import { useStyles } from './SearchStyles.js'
import { Paper } from '@material-ui/core'
import { ProfileType } from '../../types/types.js';
import NavLinkAvatar from '../Common/NavLinkAvatar';
import classNames from 'classnames';

type SearchResultType = {
  found: ProfileType
}

const SearchResult: React.FC<SearchResultType> = React.memo((props: SearchResultType) => {
  const classes = useStyles()
  const { found } = props

  const userPicture = found.picture ? `${found.picture.versions.cropped_small}` : ''
  const userFullName = `${found.firstName} ${found.lastName}`
  const userLink = `/i/${found.username}`

  return (
    <Paper className={classNames(classes.result, 'search-result')} >
      <div className={classes.avatar}>
        <NavLinkAvatar
          picture={userPicture}
          to={userLink}
          width={80}
          name={userFullName}
        />
      </div>

      <div style={{ flexGrow: 1 }}>
        <div style={{ marginBottom: 8 }}>
          <Typography
            component={NavLink}
            to={userLink}
            variant='body2'
            color={"textPrimary"}
          >
            <b>{userFullName}</b>
          </Typography>
        </div>
      </div>

    </Paper>
  )
})

export default SearchResult
