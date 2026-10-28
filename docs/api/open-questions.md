# Open questions and plan changes

## Questions for the supervisor

Until these are answered, the contract uses the assumption in brackets and marks affected items **TENTATIVE**.

1. **Therapist logins:** do therapists log in? If yes, can they do everything an admin can, or only see their own sessions and write reports? _(Assumed: they may log in as "staff".)_
2. **Patient account link:** is each patient login tied to exactly one patient record? _(Assumed: yes, created from the patient's page.)_
3. **Session length and gaps:** sessions must be 45 minutes apart, and you mentioned a 15-minute gap. Is the 15 minutes extra (sessions 60 minutes apart) or part of the 45? _(Assumed: part of the 45.)_
4. **Therapist assignment:** when a reservation is accepted, does staff pick the therapist, or should the system pick one? _(Assumed: staff pick from a list of free therapists.)_
5. **Working hours:** does each therapist have their own hours, or does everyone work 08:00 to 19:00? _(Assumed: own hours, inside 08:00 to 19:00.)_
6. **Rescheduling news:** who sees it, staff only or also visitors? Should the patient be told? _(Assumed: staff only.)_
7. **Patient status:** are `active` and `completed` enough, or is another status needed (for example `inactive`)? _(Assumed: these two.)_

## Changes from the original implementation plan

Based on the supervisor's answers (2026-10-27):

| Change                                              | Affects tasks                     |
| --------------------------------------------------- | --------------------------------- |
| No self-registration; staff create patient logins   | 2.x, new endpoint                 |
| No patient delete; `active` / `completed` status    | 3.3, 3.10, 4.4 (removed)          |
| Multiple therapists with their own schedules        | New model and page, 5.2, 5.4, 5.9 |
| Only accepted reservations block slots              | 5.2, 5.4                          |
| Taken slots hidden instead of disabled              | 5.7                               |
| Files in MongoDB GridFS instead of local disk       | 4.6                               |
| Guest spam limits (2 pending per phone, rate limit) | 5.3                               |
| Banner `type`, rescheduling news, "running now"     | 6.1, 6.6, new component           |
