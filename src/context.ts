import {PrismaClient} from "@prisma/client" 
import {AuthTokenPayload,decodeAuthHeader} from "./utils/auth"
import {Request} from "express"

// ApolloServerに指定するコンテキストを生成する。

export const prisma = new PrismaClient();  

export interface Context{
    prisma: PrismaClient;
    userId?: number;  //graphQLへのリクエストに対して、認証されたユーザーのIDを保持する。
}

// 認証トークンをデコードして、ユーザーIDを取得する。
export const context = ({req} : {req:Request}) : Context =>{ 
    const token = 
        req && req.headers.authorization
        ? decodeAuthHeader(req.headers.authorization)
        : null; 
    return {
        prisma : prisma,
        userId : token?.userId
    }
}