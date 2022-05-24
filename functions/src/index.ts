// import * as functions from 'firebase-functions';
// import GoogleCal from './service/google/googleCal';
export * from './triggers';

// 上でインポートしたfunctionsが持つメソッドの1つであるHTTPリクエストメソッドを利用
// HTTPリクエストがくると関数が発火する
// export const helloWorld = functions.https.onRequest((request, response) => {
//   /* eslint-disable max-len */

//   // FirebaseConsole（GUIの管理画面）のFunctionsにログを出力
//   functions.logger.info('Hello logs!', {structuredData: true});

//   const googleCal = new GoogleCal;
//   googleCal.connect().then((OAuth2Client: any) => {
//     functions.logger.info('Google Cal Success!', {structuredData: true});
//     functions.logger.info(OAuth2Client.credentials, {structuredData: true});
//   });

//   // response.sendでリクエスト元に値を返す。今回は文字列を返している。
//   response.send('Hello Functions!');

//   /* eslint-enable max-len */
// });
