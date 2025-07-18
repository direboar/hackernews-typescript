import {objectType} from "nexus"

// Userの型定義
export const User = objectType({
    name: "User",  
    definition(t) {
        t.nonNull.int("id");
        t.nonNull.string("name");
        t.nonNull.string("email");
        t.nonNull.list.nonNull.field("links", {    // ユーザーが投稿したLinkのリスト
            type : "Link",
            // リンクを取得するためのリゾルバー。
            resolve(parent, args, context) {  
                return context.prisma.user.findUnique({
                    where: {id : parent.id}}
                ).links();
            }
        });
        t.nonNull.list.nonNull.field("votes",{ // ユーザーが投票したVoteのリスト
            // Votesを取得するためのリゾルバー。
            type : "Vote",
            resolve(parent, args, context) {
                return context.prisma.user.findUnique({
                    where: {id : parent.id}}
                ).votes();
            }
        });
    },
});