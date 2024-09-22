import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.status(404).send("Not found");
    return;
  }

  if (!req.body) {
    res.status(400).send("Bad request");
    return;
  }

  const data = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/v1/integrations/stc-marketplace`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    method: "POST",
    body: JSON.stringify(req.body)
  });
  if (data.ok) {
    const result = await data.json();

    res.status(200).send(result);
  } else {
    res.status(500).send("Something went wrong!");
  }
};

export default handler;
