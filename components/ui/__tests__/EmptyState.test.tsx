import { fireEvent, render } from "@testing-library/react-native"
import { EmptyState } from "../EmptyState"

jest.mock("@/hooks/useAppTheme", () => {
  const { createTheme } = jest.requireActual("@/consts/Theme")
  return { useAppTheme: () => ({ Theme: createTheme(false), isDark: false, themeMode: "light", setThemeMode: jest.fn() }) }
})

describe("EmptyState", () => {
  it("renders title, description, and invokes the action", () => {
    const onAction = jest.fn()
    const { getByText } = render(
      <EmptyState
        title="Nothing here"
        description="Add your first item."
        actionLabel="Add item"
        onAction={onAction}
      />,
    )

    expect(getByText("Nothing here")).toBeTruthy()
    expect(getByText("Add your first item.")).toBeTruthy()
    fireEvent.press(getByText("Add item"))
    expect(onAction).toHaveBeenCalledTimes(1)
  })
})
