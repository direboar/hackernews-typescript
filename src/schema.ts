import { makeSchema } from "nexus";
import { join } from "path";
import * as types from "./graphql";   // 1

export const schema = makeSchema({
    types,   // 2
    outputs: {
        typegen: join(process.cwd(), "nexus-typegen.ts"),
        schema: join(process.cwd(), "schema.graphql"),
    },
    contextType:{
        module: join(process.cwd(), "src", "./context.ts"),  // 3
        export: "Context",  // 4
    }
});