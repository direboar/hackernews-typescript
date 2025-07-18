import { makeSchema } from "nexus";
import { join } from "path";
import * as types from "./graphql";   // 1


//AppoloServerにスキーマを指定する。
export const schema = makeSchema({
    types,   // graphQLの型定義を読み込む。Type,Query,Mutationなど。
    outputs: { 
        typegen: join(process.cwd(), "nexus-typegen.ts"), 
        schema: join(process.cwd(), "schema.graphql"),    //graphqlのスキーマファイルの出力先を指定する
    },
    contextType:{
        module: join(process.cwd(), "src", "./context.ts"),  //Contextの型定義を読み込む。
        export: "Context",  // Contextの型名を指定する。
    }
});