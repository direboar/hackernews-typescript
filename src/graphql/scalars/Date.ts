import {asNexusMethod} from "nexus"
import {GraphQLDateTime} from "graphql-scalars"

// GraphQLのDate型をNexusのスカラー型として定義する
export const GQLDate = asNexusMethod(GraphQLDateTime,"dateTime");