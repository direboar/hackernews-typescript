import {objectType,extendType,nonNull,stringArg} from "nexus"
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import {APP_SECRET} from "../utils/auth"

// 認証のペイロードの型定義
export const AuthPayload = objectType({
    name: "AuthPayload",
    definition(t) {
        t.nonNull.string("token");
        t.nonNull.field("user",{
            type : "User"
        })
    },
});

// AuthのMutation定義
export const AuthMutation = extendType({
    type: "Mutation",
    definition(t) {
        // ユーザー登録のためのMutation
        // email, password, nameを引数に取り、AuthPayload型のオブ
        t.nonNull.field("signup", {
            type: "AuthPayload",
            args: {
                email:nonNull(stringArg()),
                password:nonNull(stringArg()),
                name: nonNull(stringArg()),
            },
            async resolve(parent, args, context) {
                const {email,name} = args;
                // Userを登録する（パスワードはハッシュ化して登録）
                const password = await bcrypt.hash(args.password, 10);
                const user = await context.prisma.user.create({
                    data: {
                        email,
                        name,
                        password
                    },
                });
                // JWTトークンを生成する
                const token = jwt.sign({userId : user.id},APP_SECRET);
                return {
                    token,user
                }
            }
        });

        // ログインのためのMutation
        // email, passwordを引数に取り、AuthPayload型のオブジェクトを返す
        t.nonNull.field("login", {
            type: "AuthPayload",
            args : {
                email : nonNull(stringArg()),
                password : nonNull(stringArg()),
            },
            async resolve(parent, args, context) {
                // emailでユーザーを検索
                const user = await context.prisma.user.findUnique({
                    where : {email : args.email}
                });
                if(!user){
                    throw new Error("No such user found");
                }

                // パスワードを検証
                const valid = await bcrypt.compare(args.password,user.password)
                if(!valid){
                    throw new Error("Invalid password");
                }

                // パスワードが正しければ、JWTトークンを生成して返す
                const token = jwt.sign({userId : user.id} , APP_SECRET);
                return {
                    token,user
                }
            }
        });
    }
})