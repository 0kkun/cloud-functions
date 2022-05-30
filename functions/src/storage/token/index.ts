/* eslint-disable */
import { db } from "../../lib/firebaseAdmin";
import { firestore } from "firebase-admin";
import { OAuth2Client } from "google-auth-library";
import { findDoc } from "../helper";

export type TokenInfo = {
  storeId: number,
  roomId: number,
  accessToken: string,
  refreshToken: string,
  expiryDate: string,
  updatedAt: firestore.Timestamp,
}

const collectionPath = (storeId: number, roomId: number): string => {
  return `token/${storeId}/room/${roomId}`
}

const dateConvert = (expierDate: number | null | undefined): string => {
  if (expierDate) {
    let date = new Date(expierDate);
    return date.getFullYear() + '-' + ('0' + (date.getMonth()+1)).slice(-2)+ '-' + ('0' + date.getDate()).slice(-2) + ' '+ date.getHours()+ ':'+('0' + ( date.getMinutes())).slice(-2)+ ':'+ date.getSeconds();
  } else {
    return '';
  }
}

/**
 * トークンをfirestoreへ保存する
 * @param storeId 
 * @param OAuth2Client 
 */
export const storeToken = async (storeId: number, roomId: number, OAuth2Client: OAuth2Client) => {
  const data: TokenInfo = {
    storeId: storeId,
    accessToken: OAuth2Client.credentials.access_token ?? '',
    refreshToken: OAuth2Client.credentials.refresh_token ?? '',
    expiryDate: dateConvert(OAuth2Client.credentials.expiry_date),
    updatedAt: firestore.Timestamp.now(),
    roomId: roomId,
  }
  await db.doc(collectionPath(storeId, roomId)).set(data);
}

/**
 * トークンをアップデートする
 * @param storeId 
 * @param roomId 
 * @param OAuth2Client 
 */
export const updateToken = async (storeId: number, roomId: number, OAuth2Client: OAuth2Client): Promise<void> => {
  const data: TokenInfo = {
    storeId: storeId,
    accessToken: OAuth2Client.credentials.access_token ?? '',
    refreshToken: OAuth2Client.credentials.refresh_token ?? '',
    expiryDate: dateConvert(OAuth2Client.credentials.expiry_date),
    updatedAt: firestore.Timestamp.now(),
    roomId: roomId,
  }
  await db.doc(collectionPath(storeId, roomId)).update(data);
}

/**
 * トークン情報を取得する
 * @param storeId 
 * @param roomId 
 * @returns 
 */
export const findTokenData = async (storeId: number, roomId: number): Promise<TokenInfo> => {
  const tokenInfoDoc = await findDoc<TokenInfo>(collectionPath(storeId, roomId));
  return tokenInfoDoc.data();
}
