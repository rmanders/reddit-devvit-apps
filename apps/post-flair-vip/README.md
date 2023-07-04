# Post Flair Pass-List

Limits a single post flair to a list of users. Posts using the flair by a user not in the pass-list are automatically removed.

## Settings
| Setting | Type | Description |
| ------- | ---- | ----------- |
| Protected Flair Text | Text Field | The text value of the post flair that should be protected by the pass-list (64 characters max) |
| Pass-List Reddit Usernames | Text Area | A list of Reddit usersnames, one per line and without the u/, who are allowed to post using the protected post flair. (2000 characters max) |

## Future Considerations
* Add toggle setting for including moderators in the pass-list.
* Add post-menu button allowing moderators to add post's author to the pass-list.
* Allow multiple protected post flairs and associated pass-lists.
* Add custom removal reason for user & modlog visibility (needs API support)