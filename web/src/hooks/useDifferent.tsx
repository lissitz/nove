import { useEffect, useRef } from "react";
export default function useDifferent<T>(value: T) {
  const prevRef = useRef<T>();
  const ref = useRef<T>(value);
  useEffect(() => {
    if (ref.current !== value) {
      prevRef.current = ref.current;
      ref.current = value;
    }
  }, [value]);
  return prevRef.current;
}
