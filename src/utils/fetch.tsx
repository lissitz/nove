type ArgsType<T> = T extends (...args: infer U) => any ? U : never;
export function fetchJson(...args: ArgsType<typeof fetch>) {
  return fetch(...args)
    .then((res) => (res.ok ? res : Promise.reject(res)))
    .then((res) => res.json());
}
