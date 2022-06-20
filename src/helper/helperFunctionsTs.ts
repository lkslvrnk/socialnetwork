export function elementsCollectionToSimpleArray<T>(elements: NodeListOf<Element>): Array<Element> {
  const simpleArray: Array<Element> = []
  elements.forEach(m => {
    simpleArray.push(m)
  })
  return simpleArray
}

export const getFirstLetter = (word: string): string => {
  return word.substring(0, 1)
}