export function mergeConfigurations<T extends {}>(
  baseConfig: T | undefined,
  ...partialConfigs: (Partial<T> | undefined)[]
): T | undefined {
  let overallConfig = baseConfig

  for (const config of partialConfigs) {
    overallConfig = overallConfig ? { ...overallConfig, ...config } : undefined
  }

  return overallConfig
}
