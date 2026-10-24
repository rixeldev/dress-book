const {
  AndroidConfig,
  withAndroidColors,
  withAndroidColorsNight,
  withAndroidStyles,
} = require("expo/config-plugins")

/**
 * Sets `android:windowBackground` on the app theme so native screen transitions
 * never flash the platform default (white) behind an incoming screen.
 *
 * The color is defined per configuration, so it follows the system light/dark
 * mode the same way `userInterfaceStyle: "automatic"` does.
 */
module.exports = function withWindowBackground(config, props = {}) {
  const light = props.light ?? "#F7F2EA"
  const dark = props.dark ?? "#0E0C0B"

  config = withAndroidColors(config, (cfg) => {
    cfg.modResults = AndroidConfig.Colors.assignColorValue(cfg.modResults, {
      name: "window_background",
      value: light,
    })
    return cfg
  })

  config = withAndroidColorsNight(config, (cfg) => {
    cfg.modResults = AndroidConfig.Colors.assignColorValue(cfg.modResults, {
      name: "window_background",
      value: dark,
    })
    return cfg
  })

  config = withAndroidStyles(config, (cfg) => {
    cfg.modResults = AndroidConfig.Styles.assignStylesValue(cfg.modResults, {
      add: true,
      name: "android:windowBackground",
      value: "@color/window_background",
      parent: AndroidConfig.Styles.getAppThemeGroup(),
    })
    return cfg
  })

  return config
}
