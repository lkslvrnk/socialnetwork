import React, { forwardRef } from "react";

const IMAGE_URL = "https://loremflickr.com/120/120/sun";

const AnimatedListItem = forwardRef(({ children }, ref) => {
  
  return <div ref={ref} style={{position: 'relative'}} >
    {children}
  </div>
})

export default AnimatedListItem;
