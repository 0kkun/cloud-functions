/* eslint-disable */
import { tokyoFunctions } from "../helpers";
import * as functions from 'firebase-functions';
import GoogleCal from "../../service/google/googleCal";

/**
 * Google Auth2認証を行い、トークンを返すAPI
 * @request code
 * @return token
 */
export default tokyoFunctions().https.onRequest(async (req, res) => {
  // クエリパラメータの取得
  const code: string = String(req.query.code);
  functions.logger.info('received code:', code);

  const googleCal = new GoogleCal(code);
  googleCal.connect().then((OAuth2Client: any) => {
    functions.logger.info('Google Cal Success!');
    functions.logger.info(OAuth2Client.credentials, {structuredData: true});
  });

  res.status(200).send(code);
})
