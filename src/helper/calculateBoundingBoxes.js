import React from "react";

const calculateBoundingBoxes = children => {
  // Вызов этого метода происходит в useEffect(), 
  const boundingBoxes = {};
  // console.log(children)

  React.Children.forEach(children, child => {
    
    if(child.ref && child.ref.current) {

      const domNode = child.ref.current;
      const nodeBoundingBox = domNode.getBoundingClientRect();
      boundingBoxes[child.key] = nodeBoundingBox;
    }

  });

  return boundingBoxes;
};

export default calculateBoundingBoxes;
