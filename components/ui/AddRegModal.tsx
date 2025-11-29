import { useState, useEffect, useMemo } from "react"
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from "react-native"
import { FocusInput } from "@/components/FocusInput"
import { useAppTheme } from "@/hooks/useAppTheme"
import { useTranslation } from "react-i18next"

interface Props {
  visible: boolean
  initialTitle: string
  initialDescription?: string
  initialDeliveryDeadline?: string | null
  isEditMode?: boolean
  onClose: () => void
  onSave: (title: string, description: string, deliveryDeadline: string) => void
}

export const AddRegModal = ({
  visible,
  initialTitle,
  initialDescription = "",
  initialDeliveryDeadline = "",
  isEditMode = false,
  onClose,
  onSave,
}: Props) => {
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)
  const [deliveryDeadline, setDeliveryDeadline] = useState(initialDeliveryDeadline || "")
  const { Theme } = useAppTheme()
  const { t } = useTranslation()
  const styles = useMemo(() => createStyles(Theme), [Theme])

  useEffect(() => {
    setTitle(initialTitle)
    setDescription(initialDescription)
    setDeliveryDeadline(initialDeliveryDeadline || "")
  }, [initialTitle, initialDescription, initialDeliveryDeadline, visible])

  const handleSave = () => {
    if (!title.trim()) return
    onSave(title, description, deliveryDeadline)
    setTitle("")
    setDescription("")
    setDeliveryDeadline("")
  }

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.centeredView}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{isEditMode ? t("edit_record") : t("add_new_record")}</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("title")}</Text>
            <FocusInput placeholder={t("enter_title")} value={title} onChange={setTitle} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("description")}</Text>
            <View style={styles.descriptionContainer}>
              <TextInput
                placeholder={t("enter_description")}
                placeholderTextColor={Theme.colors.gray}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                style={styles.descriptionInput}
                textAlignVertical="top"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("delivery_deadline")}</Text>
            <FocusInput
              placeholder={t("enter_delivery_deadline")}
              value={deliveryDeadline}
              onChange={setDeliveryDeadline}
            />
            <Text style={styles.helperText}>{t("delivery_deadline_hint")}</Text>
          </View>

          <View style={styles.buttonContainer}>
            <Pressable onPress={onClose} style={[styles.button, styles.buttonCancel]}>
              <Text style={[styles.textStyle, { color: Theme.colors.red }]}>{t("cancel")}</Text>
            </Pressable>
            <Pressable onPress={handleSave} style={[styles.button, styles.buttonSave]}>
              <Text style={[styles.textStyle, { color: Theme.colors.background }]}>{t("save")}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const createStyles = (Theme: any) =>
  StyleSheet.create({
    centeredView: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: Theme.colors.backdrop,
    },
    modalView: {
      width: "90%",
      backgroundColor: Theme.colors.background,
      borderRadius: 20,
      padding: 24,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
      gap: 16,
    },
    modalTitle: {
      fontSize: 20,
      fontFamily: Theme.fonts.onestBold,
      color: Theme.colors.text,
      textAlign: "center",
      marginBottom: 8,
    },
    inputGroup: {
      gap: 8,
    },
    label: {
      fontFamily: Theme.fonts.onestBold,
      color: Theme.colors.text,
      fontSize: 14,
    },
    helperText: {
      fontFamily: Theme.fonts.onest,
      color: Theme.colors.lightGray,
      fontSize: 12,
    },
    descriptionContainer: {
      borderRadius: 12,
      backgroundColor: Theme.colors.background2,
      minHeight: 100,
    },
    descriptionInput: {
      paddingHorizontal: 12,
      paddingVertical: 14,
      color: Theme.colors.text,
      fontFamily: Theme.fonts.onest,
      fontSize: Theme.sizes.h4,
      minHeight: 100,
    },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 12,
      marginTop: 8,
    },
    button: {
      borderRadius: 12,
      padding: 12,
      elevation: 2,
      minWidth: 80,
      alignItems: "center",
    },
    buttonCancel: {
      backgroundColor: Theme.colors.background2,
    },
    buttonSave: {
      backgroundColor: Theme.colors.accent,
    },
    textStyle: {
      fontFamily: Theme.fonts.onestBold,
      textAlign: "center",
    },
  })
