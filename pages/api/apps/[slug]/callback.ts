import { NextApiRequest, NextApiResponse } from "next";

import { getSession } from "next-auth/react";

import axios, { setAuthToken } from "@/lib/axios";

// turn off default parser for current route
export const config = {
  api: {
    bodyParser: false,
    externalResolver: true
  }
};

const Callback = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession({ req });

  setAuthToken(session?.access_token);
  const { slug, ...query } = req.query;

  const app = await axios
    .post(`/apps/${slug}/callback`, {
      ...query
    })
    .catch((err) => {});

  res.writeHead(302, { Location: `/apps?app_installed=${slug}` });

  res.end();
};

export default Callback;
