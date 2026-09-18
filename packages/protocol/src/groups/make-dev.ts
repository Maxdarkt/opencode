import { MakeDev } from "@opencode-ai/schema/make-dev"
import { Location } from "@opencode-ai/schema/location"
import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "effect/unstable/httpapi"
import { LocationQuery, locationQueryOpenApi } from "./location"

export const MakeDevGroup = HttpApiGroup.make("server.makeDev")
  .add(
    HttpApiEndpoint.get("makeDev.status", "/api/make-dev", {
      query: LocationQuery,
      success: Location.response(MakeDev.Status),
    })
      .annotateMerge(locationQueryOpenApi)
      .annotateMerge(
        OpenApi.annotations({
          identifier: "v2.makeDev.status",
          summary: "Get make dev status",
          description: "Read make dev process ownership and .make.env ports for the requested location.",
        }),
      ),
  )
  .add(
    HttpApiEndpoint.post("makeDev.start", "/api/make-dev/start", {
      query: LocationQuery,
      success: Location.response(MakeDev.Status),
    })
      .annotateMerge(locationQueryOpenApi)
      .annotateMerge(
        OpenApi.annotations({
          identifier: "v2.makeDev.start",
          summary: "Start make dev",
          description: "Start make dev in the requested location directory only.",
        }),
      ),
  )
  .add(
    HttpApiEndpoint.post("makeDev.stop", "/api/make-dev/stop", {
      query: LocationQuery,
      success: Location.response(MakeDev.Status),
    })
      .annotateMerge(locationQueryOpenApi)
      .annotateMerge(
        OpenApi.annotations({
          identifier: "v2.makeDev.stop",
          summary: "Stop make dev",
          description: "Stop the make dev process group owned for the requested location only.",
        }),
      ),
  )
  .annotateMerge(
    OpenApi.annotations({
      title: "make-dev",
      description: "Location-scoped make dev start, stop, and status.",
    }),
  )
