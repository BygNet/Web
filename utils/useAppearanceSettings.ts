export const useAppearanceSettings = () => {
  const wallpaperMode = useCookie<boolean>('byg-wallpaper-mode', {
    default: () => false,
    watch: true,
  })

  const wallpaperUrl = useCookie<string>('byg-wallpaper-url', {
    default: () => '',
    watch: true,
  })

  const setWallpaperMode = (enabled: boolean) => {
    wallpaperMode.value = enabled
  }

  const setWallpaperUrl = (url: string) => {
    wallpaperUrl.value = url
  }

  const resetAppearance = () => {
    wallpaperMode.value = false
    wallpaperUrl.value = ''
  }

  return {
    wallpaperMode,
    wallpaperUrl,
    setWallpaperMode,
    setWallpaperUrl,
    resetAppearance,
  }
}
