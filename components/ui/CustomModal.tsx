import { useAppTheme } from "@/hooks/useAppTheme"
import { useTranslation } from "react-i18next"
import { Modal, StyleSheet, Text, View } from "react-native"
import { useMemo } from "react"
import { Button } from "./Button"
import { Card } from "./Card"

interface Props {
  title: string
  description: string
  modalVisible: boolean
  onRequestClose: () => void
  onAccept: () => void
  acceptLabel?: string
  destructive?: boolean
}

export const CustomModal = ({
  title,
  description,
  modalVisible,
  onRequestClose,
  onAccept,
  acceptLabel,
  destructive = false,
}: Props) => {
  const { t } = useTranslation()
  const { Theme } = useAppTheme()
  const styles = useMemo(() => createStyles(Theme), [Theme])

  return (
    <Modal
      animationType="fade"
      transparent={false}
      visible={modalVisible}
      onRequestClose={onRequestClose}
      backdropColor={Theme.colors.backdrop}
    >
      <View style={styles.centeredView}>
        <Card style={styles.modalView} padded={false}>
          <View>
            <Text
              style={{
                color: Theme.colors.accent,
                fontFamily: Theme.fonts.onestBold,
                fontSize: Theme.sizes.h3,
              }}
            >
              {title}
            </Text>
          </View>

          <View style={{ marginVertical: 12 }}>
            <Text
              style={{
                fontFamily: Theme.fonts.onest,
                color: Theme.colors.gray,
              }}
            >
              {description}
            </Text>
          </View>

          <View style={styles.actions}>
            <Button
              label={t("cancel")}
              onPress={onRequestClose}
              variant="ghost"
              labelStyle={{ color: Theme.semantic.state.danger }}
            />
            <Button
              label={acceptLabel ?? t("accept")}
              onPress={onAccept}
              variant={destructive ? "danger" : "primary"}
            />
          </View>
        </Card>
      </View>
    </Modal>
  )
}

const createStyles = (Theme: any) =>
  StyleSheet.create({
    columns: {
      flex: 1,
      flexDirection: "column",
      gap: 18,
    },
    buttons: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 24,
      alignSelf: "flex-start",
    },
    texts: {
      color: Theme.colors.lightGray,
      alignSelf: "flex-start",
      fontFamily: Theme.fonts.onestBold,
    },
    modalView: {
      margin: 20,
      backgroundColor: Theme.colors.modal,
      borderRadius: 20,
      padding: 20,
    },
    centeredView: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    actions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 12,
    },
  })
