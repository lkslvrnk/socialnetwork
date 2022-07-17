import React, { useState } from 'react'
import {Field, reduxForm} from "redux-form"
import {maxLengthCreator, required} from "../../utils/validators/validators"
import {OutlinedTextInput} from "../FormControls/FormControls.js"
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import { useDispatch, useSelector} from 'react-redux'
import {logIn} from './../../redux/auth_reducer'
import Avatar from '@material-ui/core/Avatar';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { useTranslation } from 'react-i18next';
import { Redirect } from 'react-router-dom'
import { useStyles } from './LoginStyles'
import ButtonWithCircularProgress from '../Common/ButtonWithCircularProgress'

const Login = React.memo( props => {
  let classes = useStyles()

  let dispatch = useDispatch()
  const [isSubmitting, setIsSubmitting] = useState(false)
  let loginForm = React.useRef(null)
  const { t } = useTranslation();

  const onSubmit = formData => {
    console.log(formData)
    setIsSubmitting(true)
    dispatch(logIn(formData.email, formData.password))
      .then(response => {
        // setIsSubmitting(false)
      }, err => {
        setIsSubmitting(false)
      })
  }

  const isAuthenticated = useSelector((state) => state.auth.isAuth)
  const username = useSelector((state) => state.auth.username)

  if(isAuthenticated) {
    return <Redirect to={`/i/${username}`} />
  }

  return (
    <div className={classes.root}>
      <Paper className={classes.formContainer}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography variant="h5">
          {t('Sign in')}
        </Typography>
        <LoginForm
          onSubmit={onSubmit} 
          ref={loginForm}
          isSubmitting={isSubmitting}
        />
      </Paper>
    </div>
  )
})

let maxLength30 = maxLengthCreator(30)

const LoginForm = reduxForm({form: 'login'})(
  ({error, isSubmitting, invalid, handleSubmit}) => {
    let classes = useStyles()
    const { t } = useTranslation();

    return (
      <form onSubmit={handleSubmit} className={classes.form}>
        <Field
          label={t('Email')}
          type='email'
          name="email"
          component={OutlinedTextInput}
          validate={[required]}
          margin="normal"
          fullWidth
          required
          autoComplete="email"
        />
        <Field
          label={t('Password')}
          type='password'
          name="password"
          component={OutlinedTextInput}
          validate={[maxLength30, required]}
          margin="normal"
          fullWidth
          required
          autoComplete="current-password"
        />

        <div className={classes.error}>
          { error &&
            <span>{t(error)}</span>
          }
        </div>

        <ButtonWithCircularProgress
          disabled={invalid || isSubmitting}
          type="submit"
          variant="contained"
          fullWidth
          color='secondary'
          children={t('Sign in')}
          enableProgress={isSubmitting}
        />
      </form>
    )
  }
)

export default Login
