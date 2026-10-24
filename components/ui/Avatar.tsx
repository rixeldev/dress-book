import { Image, StyleSheet, Text, View } from "react-native"
import type { StyleProp, ViewStyle } from "react-native"
import { useAppTheme } from "@/hooks/useAppTheme"

export interface AvatarProps {
  name?: string
  imageUrl?: string | null
  size?: "sm" | "md" | "lg" | "xl"
  style?: StyleProp<ViewStyle>
}

const sizes = { sm: 28, md: 36, lg: 48, xl: 64 }

export function Avatar({ name, imageUrl, size = "md", style }: AvatarProps) {
  const { Theme } = useAppTheme()
  const dimension = sizes[size]
  const initials = (name ?? "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")

  return (
    <View
      style={[
        styles.base,
        {
          width: dimension,
          height: dimension,
          borderRadius: dimension / 2,
          backgroundColor: Theme.semantic.accent.soft,
        },
        style,
      ]}
    >
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={{ width: dimension, height: dimension }} resizeMode="cover" />
      ) : (
        <Text
          style={{
            color: Theme.semantic.accent.primary,
            fontFamily: Theme.fonts.onestBold,
            fontSize: dimension * 0.38,
          }}
        >
          {initials || "?"}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
})
