import { fireEvent, render } from "@testing-library/react-native"
import { Button } from "../Button"

jest.mock("@/hooks/useAppTheme", () => {
  const { createTheme } =
    jest.requireActual<typeof import("@/consts/Theme")>("@/consts/Theme")

  return {
    useAppTheme: () => ({
      Theme: createTheme(false),
      isDark: false,
      themeMode: "light",
      setThemeMode: jest.fn(),
    }),
  }
})

describe("Button", () => {
  it("renders its label and invokes onPress", () => {
    const onPress = jest.fn()
    const { getByText } = render(<Button label="Save" onPress={onPress} />)

    fireEvent.press(getByText("Save"))

    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it("does not invoke onPress when disabled", () => {
    const onPress = jest.fn()
    const { getByText } = render(<Button label="Save" onPress={onPress} disabled />)

    fireEvent.press(getByText("Save"))

    expect(onPress).not.toHaveBeenCalled()
  })

  it("shows a spinner and stays disabled while loading", () => {
    const onPress = jest.fn()
    const { getByTestId, getByText } = render(
      <Button label="Saving" onPress={onPress} loading />,
    )

    expect(getByTestId("button-loading")).toBeTruthy()
    fireEvent.press(getByText("Saving"))
    expect(onPress).not.toHaveBeenCalled()
  })
})
