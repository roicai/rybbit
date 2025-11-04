import { unlink } from "node:fs/promises";
import { IS_CLOUD } from "../../lib/const.js";
import { r2Storage } from "../storage/r2StorageService.js";
import { createServiceLogger } from "../../lib/logger/logger.js";

const logger = createServiceLogger("import:utils");

export interface StorageLocationInfo {
  location: string;
  isR2: boolean;
}

export function getImportStorageLocation(importId: string, filename: string): StorageLocationInfo {
  const isR2 = IS_CLOUD && r2Storage.isEnabled();
  if (isR2) {
    return {
      location: `imports/${importId}/${filename}`,
      isR2: true,
    };
  }
  return {
    location: `/tmp/imports/${importId}/${filename}`,
    isR2: false,
  };
}

export const deleteImportFile = async (storageLocation: string, isR2Storage: boolean): Promise<void> => {
  if (isR2Storage) {
    await r2Storage.deleteImportFile(storageLocation);
    logger.debug({ storageLocation }, "Deleted R2 file");
  } else {
    await unlink(storageLocation);
    logger.debug({ storageLocation }, "Deleted local file");
  }
};
