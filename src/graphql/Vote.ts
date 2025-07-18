import { User } from "@prisma/client";
import {objectType,extendType,nonNull,intArg} from "nexus"


// Voteの型定義
// ユーザーがリンクに投票したことを表す
export const Vote = objectType({
    name: "Vote", // Voteの型名の定義
    definition(t) { // Voteのフィールド定義
        t.nonNull.field("link",{type : "Link"})
        t.nonNull.field("user",{type : "User"})
    },
});

// VoteのMutation定義
export const VoteMutation = extendType({
    type: "Mutation",
    definition(t) {
        // ユーザーがLinkに投票するためのMutation
        // LinkIDを引数に取り、Vote型のオブジェクトを返す
        t.field("vote",{
            type : "Vote",
            args : {
                linkId : nonNull(intArg()),
            },
            resolve(parent, args, context) {
                const {userId} = context;
                if(!userId){
                    throw new Error("Cannot vote without logging in.");
                }

                const link = context.prisma.link.update({
                    where : {id : args.linkId},
                    data : {
                        voters : {
                            connect : {id : userId}
                        }
                    }
                });

                const user = context.prisma.user.findUnique({
                    where : {id : userId}
                });

                return {
                    link,
                    user : user as User
                }

            }
        });
    },
})