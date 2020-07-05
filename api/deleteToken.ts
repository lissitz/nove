import { NowRequest, NowResponse } from "@vercel/node";

export default (req: NowRequest, res: NowResponse) => {
  let value = `token=""; HttpOnly; SameSite=Strict; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  if (process.env.SERVERLESS_ENV === "production") {
    value += "; Secure";
  }
  res.setHeader("Set-Cookie", value);
  res.status(200).end();
};
