import React from 'react';
import { NavLink } from 'react-router-dom'
import { ContactType } from '../../types/types';
import { Avatar, Typography } from '@material-ui/core';
import { imagesStorage } from '../../api/api';
import { useStyles } from './ConnectionsStyles';

type CommonContactPropsType = {
  contact: ContactType
}

const CommonContact: React.FC<CommonContactPropsType> = React.memo((props: CommonContactPropsType) => {
  const classes = useStyles()
  const contact = props.contact

  const contactPicture = `${imagesStorage}${contact.picture}`
  const contactName = `${contact.firstname} ${contact.lastname}`
  const contactLink = `/i/${contact.username}`

  return (
    <div>
      <div className={classes.connection} key={contact.id} >
        <Avatar
          component={NavLink}
          to={contactLink}
          className={classes.avatar}
          src={contactPicture}
        />
        <div className={classes.grow}>
          <div className={classes.nameAndMenu} >
            <Typography
              color='textPrimary'
              component={NavLink}
              to={contactLink}
              variant='body2'
            >
              <b>{ contactName }</b>
            </Typography>
          </div>
        </div>
      </div>
    </div>
  )
})

export default CommonContact