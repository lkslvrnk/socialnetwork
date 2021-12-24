import React from 'react'
import styles from './NotFound.module.css'
import { useTranslation } from 'react-i18next';

const NotFound = props => {
  const { t } = useTranslation();

  return (
    <div id={styles.not_found}>
      {props.text ? props.text : t('Not Found')}
    </div>
  )
}

export default NotFound
