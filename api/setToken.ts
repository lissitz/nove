import { NowRequest, NowResponse } from "@vercel/node";

export default (req: NowRequest, res: NowResponse) => {
  const { token } = req.body;
  let value = `token=${token}; HttpOnly; SameSite=Strict`;
  if (process.env.SERVERLESS_ENV === "production") {
    value += "; Secure";
  }
  if (token) {
    res.setHeader("Set-Cookie", value);
    res.status(200).end();
  } else return res.status(404).send(undefined);
};
