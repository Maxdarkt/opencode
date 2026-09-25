export const billingMethods = ["api", "key", "wellknown", "oauth"] as const

export type BillingMethod = (typeof billingMethods)[number]

export type BillingChannel = "api" | "abo"

// key and wellknown both carry a key. oauth is the subscription adapter.
export function billingChannel(method: BillingMethod): BillingChannel {
  if (method === "oauth") return "abo"
  return "api"
}

export function billingChannelKey(channel: BillingChannel) {
  if (channel === "abo") return "billing.channel.subscription" as const
  return "billing.channel.api" as const
}

// A provider that offers both channels does not reveal which one is connected.
export function uniqueBillingChannel(methods: readonly BillingMethod[]): BillingChannel | undefined {
  const first = methods[0]
  if (!first) return
  const channel = billingChannel(first)
  if (methods.some((method) => billingChannel(method) !== channel)) return
  return channel
}

export function channelsByProvider(
  methods: Readonly<Record<string, readonly { type: BillingMethod }[] | undefined>>,
) {
  const channels = new Map<string, BillingChannel>()
  for (const [id, list] of Object.entries(methods)) {
    if (!list) continue
    const channel = uniqueBillingChannel(list.map((method) => method.type))
    if (channel) channels.set(id, channel)
  }
  return channels
}
