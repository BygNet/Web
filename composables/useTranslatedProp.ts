/**
 * Base component mixin/composable pattern for clean i18n integration
 * Components that use translation keys in props can use this pattern:
 *
 * <script setup lang="ts">
 *   const { t } = useTranslation('namespace')
 * </script>
 *
 * <template>
 *   <component :text="t('myKey')" />
 *   <!-- or pass key as prop -->
 *   <MyComponent :label="'common.ok'" />
 *   <!-- And MyComponent does: {{ $t(label) }} -->
 * </template>
 */

export const useTranslatedProp = (propValue: string) => {
  const { t } = useI18n()
  return computed(() => t(propValue))
}
