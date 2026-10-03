# Genuine artist-inspired transformations

## Goal
Replace the current cosmetic photo filters with real image transformations that reproduce each selected artist’s recognizable medium, composition, brushwork, and colour treatment while preserving the people and main subject in the uploaded photo.

## What will change
- Keep **Original** untouched and always available.
- Add a clear **Create artwork** action after choosing Van Gogh, Da Vinci, Seurat, Warhol, or Picasso.
- Generate the transformed image from the uploaded photo through Lovable AI, using artist-specific instructions and the selected strength.
- Show a blurred live preview while the artwork is being created, then reveal the finished result.
- Keep the original photo separate so changing styles never destroys it.
- Reuse a completed result when returning to the same artist and strength during the current editing session.
- Use the generated artwork in the card preview, downloaded image, and print preview.
- Surface the service’s actual safe error message and allow a deliberate retry; never pretend a filter is finished artwork.

## Artist treatments
- **Van Gogh:** directional impasto, rhythmic strokes, saturated complementary colour, expressive light.
- **Da Vinci:** Renaissance drawing and glazing, sfumato modelling, restrained earth palette, anatomical fidelity.
- **Seurat:** optical colour mixing through fine pointillist marks, luminous structured colour.
- **Warhol:** graphic screen-print treatment, flat high-contrast colour separations and deliberate registration character.
- **Picasso:** Cubist planar reconstruction, multiple viewpoints, angular geometry, controlled palette.

Strength will adjust how far the treatment departs from the source while always preserving recognizable faces, pose, composition, and important objects.

## Technical details
- Add a server-only image-editing helper and a TanStack image editing route using the supported quality-first image model.
- Validate upload type, size, selected style, and strength before forwarding the request.
- Stream image events to the browser and handle completion, in-stream errors, and the documented one-time empty-stream recovery.
- Add generated-image state to the creation draft, with safe migration of existing browser-saved drafts.
- Update all preview/export paths to use the generated image when it matches the active selection.
- Remove simulated processing and CSS filters from non-original styles so the interface never misrepresents the result.
- Add focused tests for prompt construction and transformed-image selection, then verify desktop and phone flows.

## Cloud
Lovable Cloud is now enabled for the secure server-side image transformation. It also makes built-in database, private storage, user accounts, and server functions available for later production work.
