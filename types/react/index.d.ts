import * as React from "react";
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
