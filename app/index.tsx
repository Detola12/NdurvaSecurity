import { Redirect } from "expo-router";

/** The root layout decides where to go; this just gives it somewhere to start. */
export default function Index() {
  return <Redirect href="/sign-in" />;
}
