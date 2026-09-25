export * as SessionRunnerCost from "./cost"

const TOKEN_SCALE = 1_000_000

export type Tariff = {
  readonly input: number
  readonly output: number
  readonly cache?: {
    readonly read?: number
    readonly write?: number
  }
}

export type Usage = {
  readonly input: number
  readonly output: number
  readonly reasoning: number
  readonly cache: {
    readonly read: number
    readonly write: number
  }
}

export type Estimated = {
  readonly cost: number
  readonly costState: "estimated"
}

// USD per 1_000_000 tokens. A zero result is omitted: it is not a measured bill.
export const estimate = (tariffs: Tariff | ReadonlyArray<Tariff> | undefined, tokens: Usage): Estimated | undefined => {
  const tariff = selectTariff(tariffs)
  if (!tariff) return undefined
  if (tokens.cache.read > 0 && tariff.cache?.read === undefined) return undefined
  if (tokens.cache.write > 0 && tariff.cache?.write === undefined) return undefined
  const cost =
    (tokens.input * tariff.input +
      (tokens.output + tokens.reasoning) * tariff.output +
      tokens.cache.read * (tariff.cache?.read ?? 0) +
      tokens.cache.write * (tariff.cache?.write ?? 0)) /
    TOKEN_SCALE
  if (cost === 0) return undefined
  return { cost, costState: "estimated" }
}

function selectTariff(tariffs: Tariff | ReadonlyArray<Tariff> | undefined) {
  if (!tariffs) return undefined
  if (!Array.isArray(tariffs)) return tariffs
  if (tariffs.length !== 1) return undefined
  return tariffs[0]
}
