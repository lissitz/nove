import * as React from "react";
import {} from 'react/experimental'
import {} from 'react-dom/experimental'
declare global {
  namespace JSX {
    interface IntrinsicAttributes {
      sx?: any;
    }
  }
  namespace React {
    interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
      sx?: any;
    }
  }
}
