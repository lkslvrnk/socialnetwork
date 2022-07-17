import { useCallback, useEffect, useRef, useState } from 'react';
import { useTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { hideBodyYScrollbar, showBodyYScrollbar } from '../helper/helperFunctions';

export let useWidth = function () {
  const theme = useTheme();
  const keys = [...theme.breakpoints.keys].reverse();
  return (
    keys.reduce((output, key) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const matches = useMediaQuery(theme.breakpoints.up(key));
      return !output && matches ? key : output;
    }, null) || 'xs'
  );
}

export let usePrevious = value => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export let useTemp = (timestamp, period) => {
  const [value, setValue] = useState(false)
  const timeout = useRef(null)

  useEffect(() => {
    if (timestamp) {
      const now = Date.now()
      const difference = timestamp ? ((now - timestamp)) : 99999999
      if (difference >= (period - 500)) {
        return
      }
      if (timeout.current) {
        /* 
          Если собеседника снова пишет, то удаляем timeout,
          который где выполняется setInterlocutorIsTyping(false)
        */
        clearTimeout(timeout.current)
      }
      setValue(true)
      timeout.current = setTimeout(() => {
        setValue(false)
      }, (period - difference))
    }
  }, [timestamp, period])

  return [value, setValue]
}

export let useImageViewer = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const openImageViewer = useCallback((index) => {
    hideBodyYScrollbar()
    setCurrentImage(index);
    setIsViewerOpen(true);
  }, []);

  const closeImageViewer = () => {
    showBodyYScrollbar()
    setCurrentImage(0);
    setIsViewerOpen(false);
  }

  return [currentImage, isViewerOpen, openImageViewer, closeImageViewer]
}

/**
 * Вызывает коллбек handleIntersection при пересечении элемента
 * observableElementRef.current
 *
 * @param {boolean} initialized когда этот параметр === true, создаётся
 * IntersectionObserver и начинается наблюдение за observableElementRef.current
 * 
 * @param {Function} handleIntersection коллбек, который нужно выполнить при
 * пересечении observableElementRef.current
 */
export const useIntersection = (
  initialized, handleIntersection, observableElementRef
) => {

  const handleIntersectionRef = useRef(handleIntersection)

  useEffect(() => {
    handleIntersectionRef.current = handleIntersection
  }, [handleIntersection])

  useEffect(() => {
    if (initialized) {
      var options = {
        root: null, rootMargin: '0px', threshold: 0.1
      }
      var callback = function (entries) {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            handleIntersectionRef.current()
          }
        })
      }
      var observer = new IntersectionObserver(callback, options)
      let observable = observableElementRef.current
      if (observable) observer.observe(observable)
      return () => observer.disconnect()
    }
  }, [initialized, observableElementRef]);
}