import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles(theme => {

  return {
    buttonsSection: {
      marginLeft: 8,
      borderTop: `1px solid ${theme.palette.divider}`,
      '@media (min-width: 600px)': {
        padding: 8,
        display: 'flex',
        justifyContent: 'center',
        '& > *': {
          marginLeft: 8,
        },
      },
      '@media (max-width: 600px)': {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        paddingTop: 8,
        '& > *': {
          marginRight: 8,
          marginBottom: 8,
        },
      },
    },
    buttonSkeleton: {
      borderRadius: 3
    },
    paper: {
      minWidth: 300
    },
    toMessengerButton: {
      position: 'absolute',
      right: 8,
      top: 8
    },
    newMessageDialogTitle: {
      display: 'flex',
      justifyContent: 'space-between'
    }
  }
})