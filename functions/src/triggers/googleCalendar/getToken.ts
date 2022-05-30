/* eslint-disable */
import { tokyoFunctions } from "../helpers";
import * as functions from 'firebase-functions';
import { updateToken, findTokenData } from '../../storage/token';
import { isValid } from '../../service/google_calendar';
import { refreshAccessToken } from "../../service/google_calendar";


export default tokyoFunctions().https.onRequest(async (req, res) => {
  // クエリパラメータの取得
  const storeId: number = Number(req.query.storeId);
  const roomId: number = Number(req.query.roomId);

  if (isNaN(storeId) || isNaN(roomId)) {
    functions.logger.info('リクエストが正しくありません。');
    res.status(400).send('bad request. Must need [storeId=, roomId=].');
  }

  const tokenInfo = await findTokenData(storeId, roomId);
  functions.logger.info('firestoreからtokenデータ取得完了');

  if (isValid(tokenInfo.accessToken)) {
    functions.logger.info('保存してあるアクセストークンは期限内');
    res.status(200).send({accessToken: tokenInfo.accessToken});
  }

  try {
    functions.logger.info('アクセストークンの期限切れのため再発行処理開始');
    const oAuth2Client = await refreshAccessToken(tokenInfo.refreshToken);
    functions.logger.info('アクセストークンの再発行処理完了');
    await updateToken(storeId, roomId, oAuth2Client);
    res.status(200).send('success');

  } catch (err) {
    functions.logger.info('Server Error');
    functions.logger.error(err);
    res.status(503).send('Server Error');
  }

  // const googleCal = new GoogleCal();
  // googleCal.refreshAccessToken(tokenInfo.refreshToken).then((oAuth2Client: any) => {
  //   updateToken(storeId, roomId, oAuth2Client);
  //   functions.logger.info('トークン情報の更新が完了しました');
  // })
  // .catch(err => {
  //   functions.logger.info('Google Cal Failed.');
  //   functions.logger.error(err);
  //   res.status(400).send('failed');
  // });

  // res.status(200).send(tokenInfo);
})
