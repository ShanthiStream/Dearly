# Make the creator the home screen

## What will change
- Replace the current `/` landing content with the quick card creator, while keeping `/create` working.
- Move the Photo / Message / Art mode switch above the card so the main action is immediately visible.
- Add a rotation control that rotates the photo in the live card, saved image, and shared image.
- Make the message draggable directly on the card, constrained within safe bounds, while retaining the existing nine-position control as an accessible fallback.
- Keep mobile controls compact and preserve the existing share, AI writing, artwork, and full-options paths.

## Technical details
- Extend saved drafts with image rotation and optional normalized text coordinates, with safe defaults for older drafts.
- Update the preview and canvas export to use identical rotation and text placement.
- Use pointer events for mouse and touch dragging, with keyboard-accessible position controls still available.
- Give `/` complete page metadata and avoid duplicate site navigation around the creator.

## Verification
- Check the home editor at phone and desktop sizes.
- Verify rotation and text dragging appear in downloaded output.
- Confirm the project build and relevant automated tests remain clean.
