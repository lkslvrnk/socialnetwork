
import { Paper, Typography } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';

function Adv(props) {

  const {t} = useTranslation()

  return (
    <Paper style={{padding: 16}}>
      <Typography
        variant='body2'
        color='textSecondary'
        style={{marginBottom: 8}}
      >
        {t('Advertising')}
      </Typography>

      <NavLink to='/kek' style={{display: 'flex', justifyContent: 'center'}}>
        <img
          style={props.imageStyles}
          src={props.imageSrc}
          alt='adversting'
        />
      </NavLink>
    </Paper>
  )
}

export default Adv
