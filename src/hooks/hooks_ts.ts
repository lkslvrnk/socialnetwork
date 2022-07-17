import { useEffect, useRef, useState} from "react";

export function usePrevious<T>(value: T): T {
  const ref: any = useRef<T>();

  useEffect(() => {
    ref.current = value
  }, [value])
  return ref.current
}

export function useDots(dep: boolean, ms: number = 200) {
  const [dots, setDots] = useState('')

  let interval: any = useRef(null)


  useEffect(() => {
    if(dep) {
      interval.current = setInterval(() => {
        setDots(prev => prev.length === 3 ? '' : prev + '.')
      }, ms)
    } else {
      clearInterval(interval.current)
    }
  }, [dep, ms])

  return dots
}

export let useTemp = (timestamp: number, period: number): Array<any> => {
  const [value, setValue] = useState<boolean>(false)
  const timeout: any = useRef(null)

  useEffect(() => {
    const now = Date.now()
    const difference = now - timestamp
    if(difference >= (period - 500)) {
      // Если передано новый timestamp и это условие срабатывате,
      // то значит timestamp слишком "старый" и нужно обнулить всё.
      clearTimeout(timeout.current)
      setValue(false)
      return
    }
    /*
      Если собеседника снова пишет, то удаляем timeout, который где
      выполняется setInterlocutorIsTyping(false)
    */
    clearTimeout(timeout.current)
    setValue(true)
    timeout.current = setTimeout(() => {
      setValue(false)
    }, (period - difference))
  }, [timestamp, period])

  return [value, setValue]
}