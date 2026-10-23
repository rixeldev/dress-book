import { TextField, type TextFieldProps } from "./TextField"

export function DateField(props: TextFieldProps) {
  return <TextField {...props} keyboardType="numbers-and-punctuation" placeholder={props.placeholder ?? "YYYY-MM-DD"} />
}
