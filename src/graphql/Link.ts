import { extendType, nonNull, objectType, stringArg,intArg,enumType, inputObjectType,arg,list,idArg } from "nexus";  
import { Prisma } from "@prisma/client";  // 1
// import { NexusGenObjects } from "../../nexus-typegen";  

// feedで検索する際に指定するソート順指定
export const LinkOrderByInput = inputObjectType({
    name: "LinkOrderByInput",
    definition(t) {
        t.field("createdAt", {type: "Sort"});  // 1
        t.field("description", {type: "Sort"});  // 2
        t.field("url", {type: "Sort"});  // 3
    }
});

//Sortの昇順・降順を指定するEnmu
export const Sort = enumType({
    name: "Sort",
    members: ["asc","desc"],
});

//Feed
export const Feed = objectType({
    name: "Feed",
    definition(t) {
        t.nonNull.list.nonNull.field("links",{type: "Link"});  // Linkのリスト
        t.nonNull.int("count");  // 総件数
        t.id("id") //ID(検索条件をシリアライズした文字列をIDとする仕様)
    },
});

export const Link = objectType({
    name: "Link", // 型名の定義
    definition(t) { //フィールドの定義
        t.nonNull.int("id"); 
        t.nonNull.string("description"); 
        t.nonNull.string("url"); 
        t.nonNull.dateTime("createdAt");
        t.field("postedBy",{  
            type: "User",
            resolve(parent, args, context) { //postedByのUserを取得するリゾルバー
                return context.prisma.link.findUnique({
                    where:{id : parent.id}  
                }).postedBy();  
            }
        });
    },
});

//Queryの定義
export const LinkQuery = extendType({  
    type: "Query", 
    definition(t) {
        //feed Queryの定義
        t.nonNull.field("feed", {   
            type: "Feed", //戻り値の型
            args: { //Queryの引数
                filter : stringArg(), //フィルタ条件
                skip : intArg(),  // ページング条件（何件スキップするか）
                take : intArg(),  // ページング条件（何件取得するか）
                orderBy : arg({type : list(nonNull(LinkOrderByInput))})  //ソート順
            },  
            // feed Queryのリゾルバー
            async resolve(parent, args, context, info) {    // 4
                const where = args.filter ? {
                    OR : [
                        {description : {contains : args.filter}},
                        {url : {contains : args.filter}},
                    ]
                }
                :{}

                const links = await context.prisma.link.findMany({
                    where,
                    skip : args?.skip as number | undefined,
                    take : args?.take as number | undefined,
                    orderBy : args?.orderBy as Prisma.Enumerable<Prisma.LinkOrderByWithRelationInput> | undefined,
                });

                const count = await context.prisma.link.count({where});
                const id = `main-feed:${JSON.stringify(args)}`;
                return{
                    links,
                    count,
                    id
                }
            },
        });
    },
});

// Mutationの定義
export const LinkMutation = extendType({  // 1
    type: "Mutation",    
    definition(t) {
        //Post Mutationの定義
        t.nonNull.field("post", {  // 2
            type: "Link",  //戻り値の型
            args: {  //Mutationの引数
                description: nonNull(stringArg()), 
                url: nonNull(stringArg()),
            },
            
            resolve(parent, args, context) {    
                const { description, url } = args;  // 4
                const {userId} = context

                // 認証されていない場合はエラーを投げる
                if(!userId){
                    throw new Error("Cannot post without logging in.");
                }

                // Linkを登録する
                const newLink = context.prisma.link.create({
                    data : {
                        description: args.description,
                        url: args.url,
                        postedBy : {connect : {id : userId}} // 認証されたユーザーを投稿者（PostedBy）として登録する
                    }
                })
                return newLink
            },
        });
    },
});