export const required = value => {
    if(value) return undefined

    return 'Field is required'
}

export const maxLengthCreator = (maxLength) => {
    return (value, ...rest) => {
        if(value && value.length > maxLength) return `Max length is ${maxLength} symbols`

        return undefined
    }
}

export const minLengthCreator = (minLength) => {
    return (value, ...rest) => {
        if(value && value.length < minLength) {
            return `Min length is ${minLength} symbols`
        }
        return undefined
    }
}