# TianCode Skill Hub implementation

1. Use dsh-skills-manager's directory-preserving catalog package format and bounded download pattern, with Apache-2.0 attribution.
2. Validate the private catalog, immutable package checksums, relative file paths, and TianCode's eight categories. Preserve community frontmatter and merge only label, category, parent, and order.
3. Install complete skill directories into a plugin-owned root using exclusive transactions; register a filesystem provider and invalidate the existing skill catalog after publication.
4. Add a localized Settings sidebar page with connection settings, searchable skill cards, installation metadata, retained errors, and responsive layout.
5. Provide a catalog builder, static server deployment files, and one self-contained offline plugin tarball accepted by TianCode's plugin installer.
6. Verify parser, download, resource preservation, conflicts, cancellation, Host routes, UI behavior, packaging, documentation, and current builds. Record the result in docs/state.md.
