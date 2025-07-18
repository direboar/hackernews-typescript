import { extendType, nonNull, objectType, stringArg,intArg,enumType, inputObjectType,arg,list,idArg } from "nexus";  
import { Prisma } from "@prisma/client";  // 1
// import { NexusGenObjects } from "../../nexus-typegen";  

export const LinkOrderByInput = inputObjectType({
    name: "LinkOrderByInput",
    definition(t) {
        t.field("createdAt", {type: "Sort"});  // 1
        t.field("description", {type: "Sort"});  // 2
        t.field("url", {type: "Sort"});  // 3
    }
});

export const Sort = enumType({
    name: "Sort",
    members: ["asc","desc"],
});

export const Feed = objectType({
    name: "Feed",
    definition(t) {
        t.nonNull.list.nonNull.field("links",{type: "Link"});  // 1
        t.nonNull.int("count");  // 2
        t.id("id")
    },
});

export const Link = objectType({
    name: "Link", // <- Name of your type
    definition(t) {
        t.nonNull.int("id"); 
        t.nonNull.string("description"); 
        t.nonNull.string("url"); 
        t.nonNull.dateTime("createdAt");
        t.field("postedBy",{  
            type: "User",
            resolve(parent, args, context) {
                return context.prisma.link.findUnique({
                    where:{id : parent.id}  
                }).postedBy();  
            }
        });
    },
});

export const LinkQuery = extendType({  // 2
    type: "Query",
    definition(t) {
        t.nonNull.field("feed", {   // 3
            type: "Feed",
            args: {
                filter : stringArg(),
                skip : intArg(),  // 1
                take : intArg(),  // 2
                orderBy : arg({type : list(nonNull(LinkOrderByInput))})
            },  
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

export const LinkMutation = extendType({  // 1
    type: "Mutation",    
    definition(t) {
        t.nonNull.field("post", {  // 2
            type: "Link",  
            args: {   // 3
                description: nonNull(stringArg()),
                url: nonNull(stringArg()),
            },
            
            resolve(parent, args, context) {    
                const { description, url } = args;  // 4
                const {userId} = context

                if(!userId){
                    throw new Error("Cannot post without logging in.");
                }

                const newLink = context.prisma.link.create({
                    data : {
                        description: args.description,
                        url: args.url,
                        postedBy : {connect : {id : userId}}
                    }
                })
                return newLink
            },
        });
    },
});