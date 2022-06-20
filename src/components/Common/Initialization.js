import React from 'react';
import { CircularProgress } from '@material-ui/core';
import './InitializationStyles.css'

const Initialization = React.memo((props) => {


  let language = localStorage.i18nextLng ? localStorage.i18nextLng : 'en'
  let text = 'Loading'
  if(language === 'ru') {
    text = 'Загрузка'
  } else if(language === 'uk') {
    text = 'Завантаження'
  }

  return (
    <div
      style={{
        background: '#424242',
        position: 'fixed',
        top: 0, bottom: 0, left: 0, right: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
      children={<div className="loader">
      <span>{text}</span>
    </div>}
    />
  )
})

export default Initialization
