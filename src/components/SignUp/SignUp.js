import React, { useState } from 'react'
import { Field, reduxForm } from "redux-form"
import {
  maxLengthCreator, minLengthCreator, required
} from "../../utils/validators/validators"
import { OutlinedTextInput } from "../FormControls/FormControls.js"
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import { useDispatch, useSelector } from 'react-redux'
import { signUp } from '../../redux/auth_reducer'
import Avatar from '@material-ui/core/Avatar';
import { useTranslation } from 'react-i18next';
import { Redirect } from 'react-router-dom'
import TypographyLink from '../Common/TypographyLink'
import ButtonWithCircularProgress from '../Common/ButtonWithCircularProgress'
import {
  FormControl, FormControlLabel, FormLabel, Radio, RadioGroup
} from '@material-ui/core'
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import { useStyles } from './SignUpStyles'

const SignUp = React.memo(props => {
  let classes = useStyles()

  let dispatch = useDispatch()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)


  const onSubmit = formData => {
    setIsSubmitting(true)
    let exploded = formData.birthday.split('-')
    let birthday = `${exploded[2]}-${exploded[1]}-${exploded[0]}`

    dispatch(signUp(
      formData.email,
      formData.password, formData.repeatPassword,
      formData.firstname, formData.lastname, formData.nickname,
      formData.sex, birthday, 'ru'
    )).then(response => {
      setIsRegistered(true)
      setIsSubmitting(false)
    }, (error) => {
      setIsSubmitting(false)
    })
  }

  let signUpForm = React.useRef(null)
  const { t } = useTranslation();

  const isAuthenticated = useSelector((state) => state.auth.isAuth)
  const username = useSelector((state) => state.auth.username)
  if (isAuthenticated) {
    return <Redirect to={`/i/${username}`} />
  }

  if (isRegistered) {
    return <div>
      <Typography
        component='span'
        variant='body2'
        children={`${t('You have successfully registered')}. `}
      />

      <TypographyLink
        to='/login'
        variant='body2'
        children={t('Sign in')}
        style={{ textDecoration: 'underline' }}
      />
    </div>
  }

  return (
    <div className={classes.root}>
      <Paper className={classes.formContainer}>
        <Avatar className={classes.avatar}>
          <PersonAddIcon />
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
let minLength3 = minLengthCreator(3)
let minLength7 = minLengthCreator(7)

const passwordsEquality = (value, rest) => {
  if (rest.password && rest.password !== value) {
    return t("Passwords don't match")
  }
}

const nicknameValidator = (value) => {
  let exp = /^[A-Za-z][A-Za-z0-9_]{2,20}$/
  if (value && !value.match(exp)) {
    return t("Nickname contains invalid characters")
  }
}

const firstnameValidator = (value) => {
  let exp = /^[^±!@£$%^&*_+§¡€#¢§¶•ªº«\\/<>?:;1234567890|=.,]{1,20}$/

  if (value && !value.match(exp)) {
    return t("First name contains invalid characters")
  }
}

const lastnameValidator = (value) => {
  let exp = /^[^±!@£$%^&*_+§¡€#¢§¶•ªº«\\/<>?:;1234567890|=.,]{1,25}$/

  if (value && !value.match(exp)) {
    return t("Last name contains invalid characters")
  }
}

const birthdayValidator = (value) => {
  let exp = /^\d\d\d\d-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/

  if (value) {
    if (!value.match(exp)) {
      return t('Incorrect date')
    }
    let exploded = value.split('-')
    let year = exploded[0]
    if (year > 2005) {
      return 'Вам должно быть минимум 16 лет'
    } else if (exploded[0] < 1890) {
      return 'Вам должно быть максимум 131 год'
    }
  }
}

const SignUpForm = reduxForm({ form: 'signup' })(
  (props) => {
    const { error, invalid, isSubmitting } = props
    let classes = useStyles()
    const { t } = useTranslation();

    const renderRadioGroup = ({ input, legend, ...rest }) => {
      return (
        <FormControl component="fieldset">
          <FormLabel component="legend">{legend}</FormLabel>
          <RadioGroup
            {...input}
            {...rest}
            // valueSelected={input.value}
            onChange={(event, value) => input.onChange(value)}
          />
        </FormControl>
      )
    }

    return (
      <form onSubmit={props.handleSubmit} className={classes.form}>
        <Field
          label={t('Email')}
          type='email'
          name="email"
          component={OutlinedTextInput}
          validate={[required]}
          margin="normal"
          fullWidth
          required
          autoComplete='off'
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
          validate={[required, minLength3, maxLength20, nicknameValidator]}
          margin="normal"
          fullWidth
          required
          autoComplete='nickname'
        />

        <div style={{ marginTop: 16 }}>
          <Field
            validate={[required]}
            name="sex"
            component={renderRadioGroup}
            legend={t('Gender')}
          >
            <div style={{ display: 'flex' }}>
              <FormControlLabel
                value="male"
                control={<Radio />}
                label={t("Male")}
              />
              <FormControlLabel
                value="female"
                control={<Radio />}
                label={t("Female")}
              />
            </div>
          </Field>
        </div>

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
          autoComplete="new-password"
        />

        <div style={{ padding: 8, display: 'flex', justifyContent: 'center' }}>
          {error && <span style={{ color: 'red' }}>{t(error)}</span>}
        </div>

        <ButtonWithCircularProgress
          disabled={invalid || isSubmitting}
          type="submit"
          variant="contained"
          fullWidth
          color='secondary'
          children={t('Sign up')}
          enableProgress={isSubmitting}
        />
      </form>
    )
  }
)

export default SignUp
