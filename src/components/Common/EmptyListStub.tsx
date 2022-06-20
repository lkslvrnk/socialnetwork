import React from 'react';

type EmptyListStubPropsType = {
  imageSrc: string,
  containerWidth: number,
  containerHeight: number
}

const EmptyListStub: React.FC<EmptyListStubPropsType> = React.memo((props: EmptyListStubPropsType) => {
  const {imageSrc, containerWidth, containerHeight} = props

  return (
    <div
      style={{
        width: containerWidth,
        height: containerHeight,
        backgroundImage: `url(${imageSrc})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
    </div>
  )
})

export default EmptyListStub
