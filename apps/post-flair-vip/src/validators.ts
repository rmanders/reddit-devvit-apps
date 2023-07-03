import { SettingsFormFieldValidatorEvent } from "@devvit/public-api/settings/types.js";
import {
    Metadata,
  } from '@devvit/protos';
import { RedditAPIClient } from "@devvit/public-api";

export async function validateVipUsers(
    event: SettingsFormFieldValidatorEvent<string>, 
    metadata: Metadata | undefined
) {
    // Don't check on edit
    if (event.isEditing || !event.value) { return; }

    const reddit = new RedditAPIClient();

    const userNames = event?.value.split(/\s+/);
    for (name in userNames) {
        if (!(await reddit.getUserByUsername(name, metadata))) {
            return `Invalid reddit username: ${name}`
        }
    }
}