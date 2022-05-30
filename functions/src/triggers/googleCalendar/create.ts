/* eslint-disable */
import { tokyoFunctions } from "../helpers";
import * as functions from 'firebase-functions';
import { storeToken } from '../../storage/token'
import { authorize, getToken } from '../../service/google_calendar'


export default tokyoFunctions().https.onRequest(async (req, res) => {
  // クエリパラメータの取得
  const accessCode: string | undefined = String(req.query.accessCode);
  const storeId: number | undefined = Number(req.query.storeId);
  const roomId: number | undefined = Number(req.query.roomId);

  if (accessCode === 'undefined' || isNaN(storeId) || isNaN(roomId)) {
    functions.logger.info('リクエストが正しくありません。');
    res.status(400).send('bad request. Must need [accessCode=, storeId=, roomId=].');
  }

  try {
    let oAuth2Client = await authorize();
    functions.logger.info('認証終了');

    functions.logger.info('トークン取得開始');
    oAuth2Client = await getToken(oAuth2Client, accessCode);
    functions.logger.info(oAuth2Client);
    functions.logger.info('トークン取得完了');

    functions.logger.info('保存処理開始');
    storeToken(storeId, roomId, oAuth2Client);
    functions.logger.info('保存処理完了');

    res.status(200).send('success');

  } catch (err) {
    functions.logger.info('Server Error');
    functions.logger.error(err);
    res.status(503).send('Server Error');
  }
})
