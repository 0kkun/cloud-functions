/* eslint-disable */
import {Credentials} from '../../types';
import * as functions from 'firebase-functions';
import {google} from 'googleapis';

/**
 * GoogleApi接続用のインスタンス生成
 * 処理の流れ
 * 1. クレデンシャル情報を環境変数から取得
 * 2. クレデンシャルを使ってoAuth2Clientインスタンスを生成
 * 3. 受け取ったコードを使ってアクセストークンとリフレッシュトークンを発行
 */
export default class GoogleCal {
  private accessCode: string | undefined;

  constructor(accessCode?: string | undefined){
    this.accessCode = accessCode;
  }

  /**
   * googleへ接続する
   * @return {Config} 一旦Configを返すようにする
   */
  connect() {
    const credentials: Credentials = {
      web: functions.config().googlecredentialsweb,
    };

    return new Promise((resolve) => {
      this.authorize(credentials).then((auth) => {
        resolve(auth);
      });
    });
  }

  /**
   * OAuth認証処理
   * @param {Object} credentials 認証データ
   * @return {Promise} object oAuth2Client.
   */
  authorize(credentials: Credentials) {
    const {client_secret, client_id, redirect_uris} = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);

    return new Promise((resolve) => {
      this.getToken(oAuth2Client).then(() => {
        resolve(oAuth2Client);
      })
    });
  }

  /**
   * OAuth2のアクセストークンとリフレッシュトークンを取得
   * @param oAuth2Client {object} google.auth.OAuth2の戻り値
   * @return (promise) object 有効なtokenを含めたgoogle.auth.OAuth2
   */
  getToken(oAuth2Client: any) {
    return new Promise((resolve) => {
        // 指定されたコードのアクセストークンを取得
        oAuth2Client.getToken(this.accessCode, (err: any, token: string) => {
          if (err) {
            functions.logger.info('Coud not get token.');
            functions.logger.error(err, {structuredData: true});
            return;
          }
          functions.logger.info(token, {structuredData: true});
          oAuth2Client.setCredentials(token);
          resolve(oAuth2Client);
        });
    });
  }

  /**
   * リフレッシュトークンを取得する
   * @param refreshToken 
   */
  refreshAccessToken(refreshToken: string) {
    const credentials: Credentials = {
      web: functions.config().googlecredentialsweb,
    };
    const {client_secret, client_id, redirect_uris} = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);
    oAuth2Client.credentials = {refresh_token: refreshToken};
    return new Promise((resolve, reject) => {
      oAuth2Client.refreshAccessToken((err, token: any) => {
        if (err) {
          functions.logger.info('リフレッシュトークンを取得できませんでした。');
        }
        functions.logger.info('リフレッシュトークンの取得完了');
        oAuth2Client.setCredentials(token);
        resolve(oAuth2Client);
      });
    });
  }
}
