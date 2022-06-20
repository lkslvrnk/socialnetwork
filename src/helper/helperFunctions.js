import { imagesStorage } from "../api/api";

export function nFormatter(num, digits) {
    const lookup = [
        { value: 1, symbol: "" },
        { value: 1e3, symbol: "k" },
        { value: 1e6, symbol: "M" },
        { value: 1e9, symbol: "G" },
        { value: 1e12, symbol: "T" },
        { value: 1e15, symbol: "P" },
        { value: 1e18, symbol: "E" }
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    var item = lookup.slice().reverse().find(function(item) {
        return num >= item.value;
    });
    return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
}

export function debounce(func, ms) {
    let timeout = null

    return (...args) => {
      clearTimeout(timeout)

      timeout = setTimeout(() => {
        func.call(this, ...args)
      }, ms)
    }
  }

export function createSimpleGalleryPhoto(id, preview, large) {
  return {
    id: id,
    large: {
      src: large.src,
      width: large.width,
      height: large.height
    },
    preview: {
      src: preview.src,
      width: preview.width,
      height: preview.height
    }
  }
}

export function elementsCollectionToSimpleArray(elements) {
  const simpleArray = []
  elements.forEach(m => {
    simpleArray.push(m)
  })
  return simpleArray
}

export const hideBodyYScrollbar = () => {
  const body = document.getElementsByTagName('body')[0]
  if(body) {
    body.style.overflowY = 'hidden'
    body.style.marginRight = '12px'
  } 
}

export const showBodyYScrollbar = () => {
  const body = document.getElementsByTagName('body')[0]
  if(body) {
    body.style.overflowY = 'scroll'
    body.style.marginRight = '0px'
  }
}

export function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function getRandomColorForAvatar() {
  const colors = [
    '#2ecc71',
    '#3498db',
    '#8e44ad',
    '#e67e22',
    '#e74c3c',
    '#1abc9c',
    '#2c3e50'
  ]
  return colors[randomIntFromInterval(1, 7) - 1]
}