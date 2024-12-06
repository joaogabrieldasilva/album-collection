import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const DISK_COVER_SIZE = width * 0.7;
const DISK_SPACING = 32;
const DISK_GAP = 16;

const DISK_SIZE = DISK_COVER_SIZE * 0.7;

const DISK_IMAGE_URL = "https://pngimg.com/d/vinyl_PNG1.png";

export { DISK_IMAGE_URL, DISK_COVER_SIZE, DISK_SPACING, DISK_GAP, DISK_SIZE };
