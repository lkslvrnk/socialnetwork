import React from 'react'
import {makeStyles} from "@material-ui/core/styles"
import TextField from '@material-ui/core/TextField'

const useStyles = makeStyles(theme => ({
  root: {
    margin: theme.spacing(2),
    marginBottom: 0
  },
  field: {
    width: '100%'
  },
  resize: {
    fontSize: props => props.fontSize || '1em'
  }
}))

export const TextArea = (
  {input, label, meta: {touched, error}, fontSize, endAdornment, ...restProps}
) => {
  let classes = useStyles({fontSize: fontSize})
  
  return (
    <TextField   
      error={Boolean(error)}
      helperText={error}
      multiline
      InputProps={{
        classes: {
          input: classes.resize,
        },
        style: {
          padding: 6,
        },
        endAdornment: endAdornment
      }}
      {...input}
      {...restProps}
      
    />
  )
}

export const OutlinedTextInput = (
  props
) => {
  let {input, meta: {touched, error}, ...restProps} = props
  let hasError = touched && error

  return (
    <TextField
      error={Boolean(hasError)}
      helperText={hasError && error}
      {...input}
      {...restProps}
    />
  )
}

export const DateInput = (
  {input, meta: {touched, error}, ...restProps}
) => {
  let hasError = touched && error

  return (
    <TextField
      error={Boolean(hasError)}
      label="Birthday"
      type="date"
      helperText={hasError && error}
      {...input}
      {...restProps}
    />
  )
}