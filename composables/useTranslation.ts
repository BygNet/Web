/**
 * Smart i18n composable that provides:
 * - t(key) function for translating keys
 * - Ability to use translation keys as component props
 * - Organized by namespace
 *
 * Usage in components:
 * const { t } = useTranslation('nav')
 *
 * Then in template:
 * <label :text="$t('nav.home')" />
 * Or pass key as prop:
 * <MyComponent :label="'nav.home'" />
 * And the component uses: $t(props.label)
 */
export const useTranslation = (namespace?: string) => {
  const { t: i18nT } = useI18n()

  const t = (key: string) => {
    if (namespace && !key.includes('.')) {
      return i18nT(`${namespace}.${key}`)
    }
    return i18nT(key)
  }

  return { t }
}
