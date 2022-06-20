import { Typography } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';

const ProfileNotFound = React.memo(() => {

  const { t } = useTranslation()

  return (
    <div style={{display: 'flex', flexDirection: 'column', padding: 16, justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
      <span role='img' aria-label='no-subscribers' style={{ fontSize: '130px' }}>
        🐷
      </span>
      <Typography variant='h4' >{t('Profile not found')}</Typography>
    </div>
  )
})

export default ProfileNotFound
