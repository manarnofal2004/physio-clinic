# 12. Privacy policy

|          |                                     |
| -------- | ----------------------------------- |
| Route    | `/privacy`                          |
| Access   | Public; linked from the site footer |
| Built by | Manar (with task 2.12)              |

## Purpose

Tells visitors, patients and staff what the clinic's website keeps about them, why, and who can see it. Google asks for a privacy page before "Sign in with Google" can be used by everyone.

## Files

| File                                 | Role                                                   |
| ------------------------------------ | ------------------------------------------------------ |
| `features/privacy/PrivacyPage.tsx`   | The page: title, last updated date, intro and sections |
| `components/layout/PublicFooter.tsx` | The "Privacy policy" link                              |

No API calls: all the text is in the translation files.

## How it works

- Sections in order: what we keep, signing in with Google, how we use it, what the browser stores, who sees it, how long we keep it, your choices, contact.
- The texts match how the system works: the system never deletes patients, so "Your choices" offers to show or correct the data, and says the clinic can turn an account off or hide a record.
- Each section's body is split into paragraphs on blank lines (`\n\n`) in the translation.

## Languages, responsive

Texts under `privacy.*` in `en.ts` / `ar.ts`; Arabic reads right to left. Plain reading text on the page's beige with a comfortable line length on every screen.
