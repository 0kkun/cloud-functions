/* eslint-disable */
import { config, logger } from 'firebase-functions';
import { firestore } from "firebase-admin";
import { OAuth2Client } from "google-auth-library";
import { google } from 'googleapis'
import { GetTokenResponse } from "google-auth-library/build/src/auth/oauth2client";
const request = require('request');

// TODO: 連携済みのアクセストークン取得メソッドを実装する

export type Credentials = {
  [key:string]: {
    client_id: string,
    client_secret: string,
    redirect_uris: string,
  }
}

export type TokenInfo = {
  storeId: number,
  roomId: number,
  accessToken: string | null | undefined,
  refreshToken: string | null | undefined,
  expiryDate: string,
  updatedAt: firestore.Timestamp,
}

/**
 * Credential情報を使ってgoogleインスタンスを生成する
 * @returns
 */
export const authorize = async (): Promise<OAuth2Client> => {
  const credentials: Credentials = {
    web: config().googlecredentialsweb,
  };
  const {client_secret, client_id, redirect_uris} = credentials.web;
  return new google.auth.OAuth2(client_id, client_secret, redirect_uris)
}

/**
 * トークンを取得する (連携初回)
 * @param oAuth2Client 
 * @param accessCode 
 * @returns
 */
export const getToken = async (oAuth2Client: OAuth2Client, accessCode: string): Promise<OAuth2Client> => {
  const res: GetTokenResponse = await oAuth2Client.getToken(accessCode);
  oAuth2Client.setCredentials(res.tokens);
  return oAuth2Client
}

/**
 * アクセストークンが有効かどうか判定する
 * @param accessToken 
 * @returns
 */
export const isValid = (accessToken: string): boolean => {
  const response = request.get({
    uri: 'https://www.googleapis.com/oauth2/v3/tokeninfo',
    headers: {'Content-type': 'application/json'},
    qs: {
      'access_token': accessToken,
    },
    json: true,
  }, (err: any, req: any, data: any) => {
    logger.info(data, {structuredData: true});
  });

  // アクセストークンの期限が切れていたらerror_descriptionが含まれている
  if (response.error_description === undefined) {
    logger.info('アクセストークンは無効です');
    return false;
  } else {
    logger.info('アクセストークンは有効です');
    return true;
  }
}

/**
 *  * リフレッシュトークンでアクセストークンを再発行する
 * @param refreshToken 
 * @returns
 */
export const refreshAccessToken = async (refreshToken: string): Promise<OAuth2Client> => {
  const credentials: Credentials = {
    web: config().googlecredentialsweb,
  };
  const {client_secret, client_id, redirect_uris} = credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris);
  oAuth2Client.credentials = {refresh_token: refreshToken};
  return new Promise((resolve, reject) => {
    oAuth2Client.refreshAccessToken((err, token: any) => {
      if (err) {
        logger.info('リフレッシュトークンを取得できませんでした。');
        reject();
      }
      logger.info('リフレッシュトークンの取得完了');
      oAuth2Client.setCredentials(token);
      resolve(oAuth2Client);
    });
  });
}
