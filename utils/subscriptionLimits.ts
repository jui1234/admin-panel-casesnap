export interface ModuleSubscriptionLimit {
  limitKey?: string
  max?: number
  used?: number
  remaining?: number
  canCreate?: boolean
  message?: string
}

export interface ModuleWithSubscriptionLimit {
  name?: string
  displayName?: string
  subscriptionLimit?: ModuleSubscriptionLimit
  subscriptionFeatures?: {
    canTemplate?: boolean
    canImport?: boolean
    canExport?: boolean
    canBulkAssign?: boolean
  }
}

const MODULE_NAME_VARIATIONS: Record<string, string[]> = {
  case: ['case', 'cases'],
  cases: ['case', 'cases'],
  client: ['client', 'clients'],
  clients: ['client', 'clients'],
  role: ['role', 'roles'],
  roles: ['role', 'roles'],
  user: ['user', 'users'],
  users: ['user', 'users'],
  employee: ['employee', 'employees'],
  employees: ['employee', 'employees'],
}

export const SUBSCRIPTION_LIMIT_MESSAGE =
  'Upgrade your plan. Your credit for this plan is completed.'

export const SUBSCRIPTION_FEATURE_MESSAGE =
  'Upgrade your plan to use this feature.'

function getModuleNameVariations(moduleName: string): string[] {
  const normalized = moduleName.toLowerCase().trim()
  return MODULE_NAME_VARIATIONS[normalized] ?? [normalized]
}

export function getModuleSubscriptionLimit(
  modules: ModuleWithSubscriptionLimit[] | undefined,
  moduleName: string
): ModuleSubscriptionLimit | undefined {
  return getModuleByName(modules, moduleName)?.subscriptionLimit
}

export function getModuleByName(
  modules: ModuleWithSubscriptionLimit[] | undefined,
  moduleName: string
): ModuleWithSubscriptionLimit | undefined {
  if (!Array.isArray(modules)) return undefined

  const names = new Set(getModuleNameVariations(moduleName))
  return modules.find((module) => {
    const name = module.name?.toLowerCase().trim()
    return !!name && names.has(name)
  })
}

export function isModuleCreateLimitReached(
  modules: ModuleWithSubscriptionLimit[] | undefined,
  moduleName: string
): boolean {
  const limit = getModuleSubscriptionLimit(modules, moduleName)
  if (!limit || typeof limit.remaining !== 'number') return false
  return limit.remaining <= 0
}

export function getModuleCreateLimitMessage(
  modules: ModuleWithSubscriptionLimit[] | undefined,
  moduleName: string
): string {
  return getModuleSubscriptionLimit(modules, moduleName)?.message || SUBSCRIPTION_LIMIT_MESSAGE
}

export function isModuleFeatureEnabled(
  modules: ModuleWithSubscriptionLimit[] | undefined,
  moduleName: string,
  feature: 'canTemplate' | 'canImport' | 'canExport' | 'canBulkAssign'
): boolean {
  return getModuleByName(modules, moduleName)?.subscriptionFeatures?.[feature] === true
}
