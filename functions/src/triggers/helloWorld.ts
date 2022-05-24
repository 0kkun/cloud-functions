/* eslint-disable */
import { tokyoFunctions } from "./helpers";
import * as functions from 'firebase-functions';

export default tokyoFunctions().https.onRequest(async (req, res) => {
  // FirebaseConsole（GUIの管理画面）のFunctionsにログを出力
  functions.logger.info('Hello logs!', {structuredData: true});
  // response.sendでリクエスト元に値を返す。今回は文字列を返している。
  res.status(200).send('Hello Functions!');
})
