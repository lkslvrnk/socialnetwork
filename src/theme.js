const darkBackgroundPaper = '#424242'
const darkBackground = '#303030'//'#222'
const lightBackground = '#e3e1e1'

let themeObject = {
  props: {
    MuiCard: {
      elevation: 0
    },
    MuiPaper: {
      elevation: 0,
    },
    MuiSkeleton: {
      animation: "wave"
    },
    MuiAppBar: {
      elevation: 0,
    }
  },
  overrides: {
    MuiButton: {
      root: {
        textTransform: 'none',
      },
    },
    MuiTab: {
      textColorInherit: {
        textTransform: 'none'
      }
    },
    MuiSvgIcon: {
      root: {
        fontSize: '24px'
      },
      fontSizeSmall: {
        fontSize: '16px'
      },
      fontSizeLarge: {
        fontSize: '32px'
      }
    }
  },
  palette: {
    background: {
    },
    common: {
      halfTransparentPaper: 'rgba(0,0,0, 0.4)',
      halfTransparentPaperHover: 'rgba(66,66,66, 0.4)',
      textSmallDarkShadow: `-1px -1px 2px ${darkBackgroundPaper}, ` +
        ` 0px -1px 2px ${darkBackgroundPaper}, ` +
        ` 1px -1px 2px ${darkBackgroundPaper}, ` +
        `-1px  1px 2px ${darkBackgroundPaper}, ` +
        ` 0px  1px 2px ${darkBackgroundPaper}, ` +
        ` 1px  1px 2px ${darkBackgroundPaper}`,
      textLightLargeShadow: '-1px -1px 6px #424242, 0px -1px 6px #424242, 1px -1px 6px '
        + '#424242, -1px 1px 6px #424242, 0px 1px 6px #424242, 1px 1px 6px #424242'
    },
    secondary: {
      contrastText: "#fff",
      dark: "#ad4a23",
      light: "#ff743d",
      main: "#de6231",
    }
  },
  styles: {
    twoDimensionsCentering: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    flexColumn: {
      display: 'flex',
      flexDirection: 'column'
    },
    flexColumnCenter: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },
    flexColumnScratch: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'scratch'
    },
    flexCenter: {
      display: 'flex',
      justifyContent: 'center',
    },
    flexCenterHoriz: {
      display: 'flex',
      justifyContent: 'center',
    },
    flexRowAlignCenter: {
      display: 'flex',
      alignItems: 'center'
    }
  },
  withPercents: number => `${number}%`
}

const getThemeObject = (themeIsDark) => {
  let themeType = themeIsDark ? 'dark' : 'light'
  themeObject.palette.type = themeType
  let themeIsLight = themeObject.palette.type === 'light'
  themeObject.palette.background.default = themeIsLight
    ? lightBackground : darkBackground

  return themeObject
}

export default getThemeObject