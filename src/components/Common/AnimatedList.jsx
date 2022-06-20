import React, { useState, useLayoutEffect, useEffect } from "react";
import calculateBoundingBoxes from "../../helper/calculateBoundingBoxes";
import { usePrevious } from "../../hooks/hooks";


const AnimatedList = ({ children }) => {
  const [boundingBox, setBoundingBox] = useState({})
  const [prevBoundingBox, setPrevBoundingBox] = useState({})
  const prevChildren = usePrevious(children)

  // console.log(children)

  useLayoutEffect(() => {
    // setTimeout(() => {
      const newBoundingBox = calculateBoundingBoxes(children);
      setBoundingBox(newBoundingBox);
    // }, 0)

  }, [children]);

  useLayoutEffect(() => {
    // setTimeout(() => {
      const prevBoundingBox = calculateBoundingBoxes(prevChildren);
      setPrevBoundingBox(prevBoundingBox);
    // }, 0)
  }, [prevChildren]);

  useLayoutEffect(() => {
    const hasPrevBoundingBox = Object.keys(prevBoundingBox).length;
    const kek = Object.keys(prevBoundingBox).length === children.length

    if (hasPrevBoundingBox && kek) {
      React.Children.forEach(children, child => {
        const domNode = child.ref.current;
        const firstBox = prevBoundingBox[child.key];
        const lastBox = boundingBox[child.key];
        const changeInY = firstBox.top - lastBox.top

        if (changeInY) {
          requestAnimationFrame(() => {
            domNode.style.transform = `translateY(${changeInY}px)`;
            domNode.style.transition = "transform 0s";

            requestAnimationFrame(() => {
              domNode.style.transform = "";
              domNode.style.transition = "transform 500ms";
            });
          });
        }
      });
    }
  }, [boundingBox, prevBoundingBox, children]);

  return children;
};

export default AnimatedList;
