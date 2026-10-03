# Complete multilingual content switching

## Goal
Make all visible app content respond immediately to the user’s selected language, or to the device language when Automatic is selected.

## Changes
- Expand the translation dictionary for every customer-facing page and every creation step, including labels, buttons, notices, empty states, alerts, and status messages.
- Replace fixed English strings in routes and creation screens with translation keys while preserving user-entered names, messages, prices, dates, and sample data.
- Format dates and money with the active locale where supported.
- Keep English as the safe fallback for any missing translation and retain right-to-left layout for Arabic.
- Ensure the language selector updates mounted page content immediately and the Automatic option follows the browser language.

## Verification
- Switch among English, Arabic, French, Spanish, Russian, Hindi, and Chinese on Library and the creation flow.
- Verify Arabic direction, translated content, remembered explicit selection, and Automatic device-language behavior.
- Check the preview for runtime errors and confirm the latest build is healthy.
