/* eslint-disable */
import { tokyoFunctions } from "../helpers";
import * as functions from 'firebase-functions';

/**
 * Hello Functions!という文字列を返すだけのテストAPI
 */
export default tokyoFunctions().https.onRequest(async (req, res) => {
  // クエリパラメータの取得
  // リクエスト時、?param=testのようにURLの後ろに追加する
  const params = req.query.param;
  functions.logger.info(params, {structuredData: true});

  // FirebaseConsole（GUIの管理画面）のFunctionsにログを出力
  functions.logger.info('Hello logs!', {structuredData: true});

  // response.sendでリクエスト元に値を返す。今回は文字列を返している。
  res.status(200).send('Hello Functions!');
})
