/* eslint-disable */
import { tokyoFunctions } from "../helpers";
import * as functions from 'firebase-functions';
import GoogleCal from "../../service/google/googleCal";
import { db } from "../../lib/firebaseAdmin";

type TokenInfo = {
  storeId: number,
  roomId: number,
  accessToken: string,
  refreshToken: string,
  expiryDate: string,
  updatedAt: Date,
}

const collectionPath = (storeId: number, roomId: number): string => {
  return `token/${storeId}/room/${roomId}`
}

const dateConvert = (expierDate: number): string => {
  let date = new Date(expierDate);
  return date.getFullYear() + '-' + ('0' + (date.getMonth()+1)).slice(-2)+ '-' + ('0' + date.getDate()).slice(-2) + ' '+ date.getHours()+ ':'+('0' + ( date.getMinutes())).slice(-2)+ ':'+ date.getSeconds();
}

/**
 * トークンをfirestoreへ保存する
 * @param storeId 
 * @param OAuth2Client 
 */
const storeToken = async (storeId: number, roomId: number, OAuth2Client: any) => {
  const data: TokenInfo = {
    storeId: storeId,
    accessToken: OAuth2Client.credentials.access_token,
    refreshToken: OAuth2Client.credentials.refresh_token,
    expiryDate: dateConvert(OAuth2Client.credentials.expiry_date),
    updatedAt: new Date(),
    roomId: roomId,
  }
  await db.doc(collectionPath(storeId, roomId)).set(data);
}

/**
 * Google Auth2認証を行い、トークンを保存するAPI
 * @request code
 * @return token
 */
export default tokyoFunctions().https.onRequest(async (req, res) => {
  // クエリパラメータの取得
  const code: string = String(req.query.code);
  const storeId: number = Number(req.query.storeId);
  const roomId: number = Number(req.query.roomId);

  const googleCal = new GoogleCal(code);
  googleCal.connect().then((OAuth2Client: any) => {
    functions.logger.info('Google Cal Success.');
    functions.logger.info(OAuth2Client.credentials, {structuredData: true});
    storeToken(storeId, roomId, OAuth2Client);
    res.status(200).send('success');
  })
  .catch(err => {
    functions.logger.info('Google Cal Failed.');
    functions.logger.error(err);
    res.status(400).send('failed');
  });
})
