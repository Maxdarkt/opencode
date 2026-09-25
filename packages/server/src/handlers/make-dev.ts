import { MakeDev } from "@opencode-ai/core/make-dev"
import { HttpApiBuilder } from "effect/unstable/httpapi"
import { Api } from "../api"
import { response } from "../location"

export const MakeDevHandler = HttpApiBuilder.group(Api, "server.makeDev", (handlers) =>
  handlers
    .handle("makeDev.status", () => response(MakeDev.Service.use((service) => service.status())))
    .handle("makeDev.start", () => response(MakeDev.Service.use((service) => service.start())))
    .handle("makeDev.stop", () => response(MakeDev.Service.use((service) => service.stop()))),
)
