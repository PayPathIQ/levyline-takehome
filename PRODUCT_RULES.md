# Product rules

These are the business rules Levyline has to follow. They matter as much as the
features: we test your app against them. Where a rule doesn't cover a case,
make a sensible call and write it down in your README.

## Who's who

- A **Client** is a managing agent, such as Harbour Property Management. It runs
  one or more **Developments** (apartment blocks or estates) for the owners'
  management company.
- A **Unit** is one apartment or house in a Development. It has one or more
  **Owners**. Joint owners are each liable for the whole of that Unit's
  receivables.
- An **Owner** is a person. One person can own Units in several Developments,
  and even with different Clients. They are still one Owner, with one page.
- A **Receivable** is one amount charged to one Unit: a service charge, a
  sinking fund contribution, an insurance levy, and so on. The export calls
  them demands. A **credit note** is a negative Receivable.
- The **balance** of a Unit is the sum of what is still unpaid on its
  Receivables. An Owner's balance is the total across their Units, and their
  page shows it per Client, because money owed to one Client can never pay
  another's.

## Importing

1. Never guess a number or a date. `1.340,00` and `10/01/2026` are both
   ambiguous: don't silently pick a meaning. Skip the row with a clear reason,
   or let the user decide before importing.
2. Never merge two people because they share an email address. Couples and
   families share inboxes. Rows that look like the same person are suggested
   to staff, who confirm the merge.
3. Importing the same file twice must not create duplicate Owners, Units or
   Receivables. Importing a corrected file must update, not duplicate.
4. A note that says the owner must not be contacted, is disputing the charge,
   has died, or has sold the Unit must not be lost. It must show on the
   Owner's page and change what staff and automations can do (rules 5 and 8).

## Messaging owners

5. **Do not contact** means no email of any kind: not from an automation, and
   not sent by hand from the Owner page either. Staff can still record a
   commitment.
6. Messages to joint owners go to each of them who has a usable email address.
   Each one's reply belongs to that person.
7. A reply from an Owner appears in their messages within a minute of arriving,
   in the same conversation as the email it answers. A reply that can't be
   matched to an Owner must not be lost: staff need to be able to see it and
   attach it to the right Owner.

## Automations

8. Automations never email an Owner who is do not contact or whose balance is
   zero or less, and never chase a Receivable that is disputed or isn't due
   yet.
9. Automated emails only go out **Monday to Saturday, 08:00 to 20:00 Irish
   time**, and an Owner gets **at most one automated email per day**, however
   many Units or automations they're in.
10. An Owner who replies stops receiving automated emails until a staff member
    resumes them.

## Commitments

11. A **commitment** is an Owner's promise to pay: one payment on a date, or a
    plan of up to 12 instalments. It covers specific Receivables, all for one
    Client, and totals no more than what's outstanding on them.
12. Instalment dates are in the future and in order. The first is within 30
    days of today.
13. An Owner can have one active commitment per Client.
14. While a commitment is active, automations don't chase the Receivables it
    covers. Other Receivables can still be chased.
15. Staff mark instalments as paid. An instalment that's unpaid 3 days after
    its date is **missed**, and the commitment becomes **broken**: the Owner's
    page says so, and its Receivables can be chased again.
16. When a commitment is recorded, the Owner gets the
    `commitment-confirmation` email (unless rule 5 applies).

## Testing the time rules

Rules 9, 12 and 15 depend on the clock. We'll test them without waiting days,
so give us a way to do that in development: for example, one setting that
fixes "now", and one that makes a "day" last a few minutes (so a Wait of
5 minutes can be followed by a second email). Tell us in your README how to use
them.
