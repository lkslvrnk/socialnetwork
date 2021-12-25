import React, { useState } from 'react'
import {Field, reduxForm} from "redux-form"
import {maxLengthCreator, required} from "../../utils/validators/validators"
import {OutlinedTextInput} from "../FormControls/FormControls.js"
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import { useDispatch, useSelector} from 'react-redux'
import {logIn} from './../../redux/auth_reducer'
import Avatar from '@material-ui/core/Avatar';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import { useTranslation } from 'react-i18next';
import { Redirect } from 'react-router-dom'
import { useStyles } from './LoginStyles'

const Login = React.memo( props => {
  let classes = useStyles()

  let dispatch = useDispatch()
  const [isSubmitting, setIsSubmitting] = useState(false)
  let loginForm = React.useRef(null)
  const { t } = useTranslation();

  const onSubmit = formData => {
    setIsSubmitting(true)
    dispatch(logIn(formData.email, formData.password))
      .then(response => {
        console.log(response)
        setIsSubmitting(false)
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
        <Typography component="h1" variant="h5">
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
  (props) => {
    let error = props.error
    let classes = useStyles()
    const { t } = useTranslation();

    return (
      <form onSubmit={props.handleSubmit} className={classes.form}>
        { error && <span>{error}</span> }
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

        <Button
          disabled={props.isSubmitting}
          type="submit"
          variant="contained"
          fullWidth
          color='secondary'
          
          className={classes.submit}
        >
          {t('Enter')}
        </Button>
      </form>
    )
  }
)

export default Login
