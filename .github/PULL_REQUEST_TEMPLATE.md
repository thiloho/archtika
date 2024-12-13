#### Change description


<!--
Please provide a description above.
-->

#### Checklist
<!-- Remove items that do not apply. For completed items, change [ ] to [x]. -->

Web application changes:
- [ ] Run `npm run lint` to check code style
- [ ] Run `npm run format` to format code
- [ ] Run `npm run test` to verify end-to-end tests pass 

Database changes:
- [ ] Run `npm run gents` if database structure was modified
- [ ] Run `formatsql` command to format SQL migrations (requires `nix develop .#api`)

Nix changes:
- [ ] Run `nix fmt` if files in `nix` directory were modified