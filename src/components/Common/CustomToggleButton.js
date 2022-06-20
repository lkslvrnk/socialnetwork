import React, {useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ToggleButton from '@material-ui/lab/ToggleButton';

const getSizeBySizeName = sizeName => {
  switch(sizeName) {
    case 'small': return '40px'
    case 'large': return '50px'
    default : return '45px'
  }
} 

const useStyles = makeStyles(theme => ({
  qwe: {
    borderRadius: '5em',
    height: props => getSizeBySizeName(props.size),
    width: props => getSizeBySizeName(props.size),
    border: 'none',
    boxSizing: 'border-box',
    color: theme.palette.text.primary,
    '&$selected': {
      color: theme.palette.secondary.main
    },
    opacity: 1
  },
  selected: {}
}));

const CustomToggleButton = (props) => {
  const [clicked, setClicked] = useState(false);

  const classes = useStyles({
    clicked: clicked,
    color: props.color,
    hoverColor: props.hoverColor,
    size: props.size
  });

  const olololo = () => {
    setClicked(true)
    setTimeout(() => setClicked(false), 100)
  }

  return (
    <div>
      <ToggleButton
				value='check'
        disableRipple={props.disableRipple}
        classes={{ root: classes.qwe, selected: classes.selected }}
        className={props.className}
        selected={props.selected}
        onChange={props.onChange}
        onClick={(event) => {
          if(props.onClick) {          
            props.onClick(event);
          }
          olololo();
        }}
        
      >
        {props.children}

      </ToggleButton>
    </div>
  )
}

export default CustomToggleButton
