import { NowRequest, NowResponse } from "@vercel/node";

export default (req: NowRequest, res: NowResponse) => {
  const { token } = req.cookies;
  if (token) {
    res.status(200).send({ token });
  } else {
    res.status(404).send(undefined);
  }
};
