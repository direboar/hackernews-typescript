import * as jwt from "jsonwebtoken"

export const APP_SECRET = "GraphQL-is-aw3some";

// 認証トークンのペイロードの型定義
export interface AuthTokenPayload {
    userId : number;
}

// 認証ヘッダーからトークンをデコードして、ユーザーIDを取得する
export function decodeAuthHeader(authHeader : String){
    const token = authHeader.replace("Bearer ", "");
    if(!token){
        throw new Error("No token provided");
    }
    return jwt.verify(token, APP_SECRET) as AuthTokenPayload;
}
