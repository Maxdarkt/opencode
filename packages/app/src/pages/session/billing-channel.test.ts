import { describe, expect, test } from "bun:test"
import { billingChannel, channelsByProvider, uniqueBillingChannel } from "./billing-channel"

describe("billingChannel", () => {
  test("maps a key method to the api channel", () => {
    expect(billingChannel("api")).toBe("api")
    expect(billingChannel("key")).toBe("api")
    expect(billingChannel("wellknown")).toBe("api")
  })

  test("maps oauth to the subscription channel", () => {
    expect(billingChannel("oauth")).toBe("abo")
  })

  test("takes only the method type", () => {
    expect(billingChannel.length).toBe(1)
  })
})

describe("uniqueBillingChannel", () => {
  test("returns the channel when every method agrees", () => {
    expect(uniqueBillingChannel(["oauth", "oauth"])).toBe("abo")
    expect(uniqueBillingChannel(["api", "key"])).toBe("api")
  })

  test("stays unknown when the provider offers both channels", () => {
    expect(uniqueBillingChannel(["api", "oauth"])).toBeUndefined()
    expect(uniqueBillingChannel([])).toBeUndefined()
  })
})

describe("channelsByProvider", () => {
  test("keeps a provider only when its methods share one channel", () => {
    const channels = channelsByProvider({
      copilot: [{ type: "oauth" }],
      anthropic: [{ type: "api" }],
      openai: [{ type: "api" }, { type: "oauth" }],
    })
    expect(channels.get("copilot")).toBe("abo")
    expect(channels.get("anthropic")).toBe("api")
    expect(channels.has("openai")).toBe(false)
  })
})
