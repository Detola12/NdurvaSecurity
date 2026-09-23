// The package only types its index; each per-icon file is the same component.
declare module "iconsax-react-native/dist/esm/*" {
  import type { Icon } from "iconsax-react-native";
  const icon: Icon;
  export default icon;
}
