import React, { useState } from 'react'
import {Field, reduxForm, SubmissionError} from "redux-form"
import {maxLengthCreator, minLengthCreator, required} from "../../utils/validators/validators"
import {DateInput, OutlinedTextInput} from "../FormControls/FormControls.js"
import Button from '@material-ui/core/Button'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import { useDispatch, useSelector} from 'react-redux'
import {signUp} from '../../redux/auth_reducer'
import {makeStyles} from "@material-ui/core/styles";
import Avatar from '@material-ui/core/Avatar';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Link from '@material-ui/core/Link';
import { useTranslation } from 'react-i18next';
import { Redirect } from 'react-router-dom'

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    marginTop: theme.spacing(8),
  },
  form: {
    width: '100%'
  },
  formContainer: {
    padding: theme.spacing(2),
    flexDirection: 'column',
    display: 'flex',
    alignItems: 'center',
    width: '400px'
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  }
}))

const SignUp = React.memo( props => {
  let classes = useStyles()

  let dispatch = useDispatch()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)


  const onSubmit = formData => {
    console.log(formData)
    setIsSubmitting(true)
    let exploded = formData.birthday.split('-')
    let birthday = `${exploded[2]}-${exploded[1]}-${exploded[0]}`

    dispatch(signUp(formData.email, formData.password, formData.repeatPassword, formData.firstname, formData.lastname, formData.nickname, 'male', birthday, 'ru'))
      .then(response => {
        setIsRegistered(true)
        setIsSubmitting(false)
      }, err => {
        console.log('error')
        setIsSubmitting(false)
      })
  }

  let signUpForm = React.useRef(null)

  let facebookAuthHref = 'https://www.facebook.com/v6.0/dialog/oauth?client_id='
    + '520867695227342&redirect_uri=http://localhost:1338/auth/fb&display=popup'
  const { t } = useTranslation();

  const isAuthenticated = useSelector((state) => state.auth.isAuth)
  const username = useSelector((state) => state.auth.username)
  if(isAuthenticated) {
    return <Redirect to={`/i/${username}`} />
  }

  if(isRegistered) {
    return <div>Вы успешно зарегистрированы</div>
  }

  return (
    <div className={classes.root}>
      <Paper className={classes.formContainer}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          {t('Sign up')}
        </Typography>
        <SignUpForm
          onSubmit={onSubmit} 
          ref={signUpForm}
          isSubmitting={isSubmitting}
        />
      </Paper>
    </div>
  )
})

let maxLength30 = maxLengthCreator(30)
let maxLength25 = maxLengthCreator(25)
let maxLength20 = maxLengthCreator(20)
let minLength2 = minLengthCreator(2)
let minLength5 = minLengthCreator(5)
let minLength7 = minLengthCreator(7)

const passwordsEquality = (value, rest) => {
  if(rest.password && rest.password !== value) {
    return 'Пароли должны совпадать'
  }
}

const nicknameValidator = (value) => {
  let exp = /^[A-Za-z][A-Za-z0-9_]{4,20}$/

  if(value && !value.match(exp)) {
    return 'Никнейм содержит недопустимые символы'
  }
}

const firstnameValidator = (value) => {
  let exp = /^[^±!@£$%^&*_+§¡€#¢§¶•ªº«\\/<>?:;1234567890|=.,]{1,20}$/

  if(value && !value.match(exp)) {
    return 'Имя содержит недопустимые символы'
  }
}

const lastnameValidator = (value) => {
  let exp = /^[^±!@£$%^&*_+§¡€#¢§¶•ªº«\\/<>?:;1234567890|=.,]{1,25}$/

  if(value && !value.match(exp)) {
    return 'Фамилия содержит недопустимые символы'
  }
}

const birthdayValidator = (value) => {
  let exp = /^\d\d\d\d-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/

  console.log(value)

  if(value) {
    if(!value.match(exp)) {
      return 'Неправильная дата'
    }
    let exploded = value.split('-')
    let year = exploded[0]
    if(exploded[0] > 2005) {
      return 'Вам должно быть минимум 16 лет'
    }
    else if(exploded[0] < 1890) {
      return 'Вам должно быть максимум 131 год'
    }
  }
}

const SignUpForm = reduxForm({form: 'signup'})(
  (props) => {
    const {error, invalid} = props
    console.log(props)
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
          margin="normal"
          fullWidth
          required
          autoComplete={true}
        />

        <Field
          label={t('First name')}
          type='text'
          name="firstname"
          component={OutlinedTextInput}
          validate={[required, minLength2, maxLength20, firstnameValidator]}
          margin="normal"
          fullWidth
          required
          autoComplete="off"
        />

        <Field
          label={t('Last name')}
          type='text'
          name="lastname"
          component={OutlinedTextInput}
          validate={[required, minLength2, maxLength25, lastnameValidator]}
          margin="normal"
          fullWidth
          required
          autoComplete="off"
        />

        <Field
          label={t('Nickname')}
          type='text'
          name="nickname"
          component={OutlinedTextInput}
          validate={[required, minLength5, maxLength20, nicknameValidator]}
          margin="normal"
          fullWidth
          required
          autoComplete='username'
        />

        <Field
          label={t('Birthday')}
          type='date'
          name="birthday"
          component={OutlinedTextInput}
          validate={[required, birthdayValidator]}
          margin="normal"
          fullWidth
          required
          max="2010-01-01"
          min="1930-01-01"
          InputLabelProps={{
            shrink: true,
          }}
        />

        <Field
          label={t('Password')}
          type='password'
          name="password"
          component={OutlinedTextInput}
          validate={[required, minLength7, maxLength30]}
          margin="normal"
          fullWidth
          required
          autoComplete="new-password"
        />

        <Field
          label={t('Repeat password')}
          type='password'
          name="repeatPassword"
          component={OutlinedTextInput}
          validate={[required, passwordsEquality, minLength7]}
          margin="normal"
          fullWidth
          required
        />

        <Button
          disabled={invalid}
          type="submit"
          variant="contained"
          fullWidth
          color='secondary'
          
          className={classes.submit}
        >
          {t('Sign up')}
        </Button>
      </form>
    )
  }
)

export default SignUp
