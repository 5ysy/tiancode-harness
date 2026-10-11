---
kind: upgrade-guide
description: "The Desktop application identity and data root change to TianCode for the internal Windows build."
---

# Desktop identity changes to TianCode

English | [中文](guide.zh.md)

## Change

The internal Desktop build uses `TianCode` and `com.tiancode.desktop`. Windows installs use `TianCode.exe`, a separate Electron profile, and a separate `DSH_HOME` under `%APPDATA%\\TianCode`. The upstream DeepSeek Harness installation keeps its own identity and data. Existing data is not copied automatically between the two products.

## Migration

1. Install TianCode into its own folder. Do not point the installer at an existing DeepSeek Harness folder.
2. If an existing session or plugin set is required, export or copy it through the supported application and plugin workflows. Keep the original `$DSH_HOME` until the TianCode copy has been checked.
3. Configure the internal model Provider in the TianCode Models settings. Keep API keys in the application credential store; do not add them to `.env.windows` or source files.
4. For an offline package, set `DSH_DESKTOP_UPDATES=disabled` in `apps/desktop/.env.windows` before packaging. Confirm that the installed application has no public update feed and that `TianCode.exe` starts beside the upstream installation.
